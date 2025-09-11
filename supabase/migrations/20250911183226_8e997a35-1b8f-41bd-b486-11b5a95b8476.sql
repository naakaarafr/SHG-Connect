-- Fix transaction mechanism by dropping existing conflicting policies and recreating properly

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "SHG members can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "SHG members can update their transactions" ON public.transactions;

-- Add missing INSERT policy for transactions
CREATE POLICY "SHG members can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  -- User must be a member of the sender SHG
  EXISTS (
    SELECT 1 FROM shg_members sm 
    WHERE sm.shg_id = transactions.sender_shg_id 
    AND sm.user_id = auth.uid()
  )
);

-- Add UPDATE policy for transactions
CREATE POLICY "SHG members can update their transactions" 
ON public.transactions 
FOR UPDATE 
USING (
  -- User must be a member of either sender or recipient SHG
  EXISTS (
    SELECT 1 FROM shg_members sm 
    WHERE (sm.shg_id = transactions.sender_shg_id OR sm.shg_id = transactions.recipient_shg_id)
    AND sm.user_id = auth.uid()
  )
);

-- Add constraints to ensure data integrity (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_amount_positive') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_different_shgs') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_different_shgs CHECK (sender_shg_id != recipient_shg_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_valid_status') THEN
    ALTER TABLE public.transactions ADD CONSTRAINT transactions_valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));
  END IF;
END $$;

-- Create a function to automatically generate transaction IDs and timestamps
CREATE OR REPLACE FUNCTION public.update_transaction_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Generate transaction_id if not provided
  IF NEW.transaction_id IS NULL THEN
    NEW.transaction_id = 'TXN-' || UPPER(LEFT(gen_random_uuid()::text, 8));
  END IF;
  
  -- Set created_at if not provided
  NEW.created_at = COALESCE(NEW.created_at, now());
  
  RETURN NEW;
END;
$$;

-- Create trigger for transaction metadata
DROP TRIGGER IF EXISTS update_transaction_metadata_trigger ON public.transactions;
CREATE TRIGGER update_transaction_metadata_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transaction_metadata();