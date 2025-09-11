-- Fix transaction mechanism with proper RLS policies and constraints

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

-- Add constraints to ensure data integrity
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_amount_positive 
CHECK (amount > 0);

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_different_shgs 
CHECK (sender_shg_id != recipient_shg_id);

-- Add proper status constraint
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_valid_status 
CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));

-- Create a function to automatically update transaction status
CREATE OR REPLACE FUNCTION public.update_transaction_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, now());
  
  -- Generate transaction_id if not provided
  IF NEW.transaction_id IS NULL THEN
    NEW.transaction_id = 'TXN-' || UPPER(LEFT(gen_random_uuid()::text, 8));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for transaction timestamps and IDs
DROP TRIGGER IF EXISTS update_transaction_timestamp_trigger ON public.transactions;
CREATE TRIGGER update_transaction_timestamp_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_transaction_timestamp();

-- Create function to validate SHG exists before transaction
CREATE OR REPLACE FUNCTION public.validate_transaction_shgs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if sender SHG exists
  IF NOT EXISTS (SELECT 1 FROM shgs WHERE id = NEW.sender_shg_id) THEN
    RAISE EXCEPTION 'Sender SHG does not exist';
  END IF;
  
  -- Check if recipient SHG exists
  IF NOT EXISTS (SELECT 1 FROM shgs WHERE id = NEW.recipient_shg_id) THEN
    RAISE EXCEPTION 'Recipient SHG does not exist';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for SHG validation
DROP TRIGGER IF EXISTS validate_transaction_shgs_trigger ON public.transactions;
CREATE TRIGGER validate_transaction_shgs_trigger
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_transaction_shgs();