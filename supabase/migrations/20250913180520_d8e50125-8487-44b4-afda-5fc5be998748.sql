-- Enable RLS on spatial_ref_sys table (PostGIS system table)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access to spatial reference systems
-- This table contains standard geographic coordinate system definitions
-- and is generally safe to read by authenticated users
CREATE POLICY "Allow read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
USING (true);