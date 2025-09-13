-- Allow recipients to mark messages as read by updating the "read" flag
-- Safe recreate to avoid duplicates
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.messages;
CREATE POLICY "Recipients can mark messages as read"
ON public.messages
FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);
