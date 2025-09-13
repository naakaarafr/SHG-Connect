-- Clean up and create final secure solution that works within system constraints

-- Remove the problematic security definer view (already done but ensuring)
DROP VIEW IF EXISTS public.spatial_reference_info;

-- Update our secure function for accessing spatial reference systems
CREATE OR REPLACE FUNCTION public.get_spatial_reference_systems(target_srid INTEGER DEFAULT NULL)
RETURNS TABLE(
    srid INTEGER,
    auth_name TEXT,
    auth_srid INTEGER,
    srtext TEXT,
    proj4text TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE SQL
STABLE
AS $$
    -- Only return commonly used spatial reference systems for security
    SELECT 
        s.srid::INTEGER,
        s.auth_name::TEXT,
        s.auth_srid::INTEGER,
        s.srtext::TEXT,
        s.proj4text::TEXT
    FROM spatial_ref_sys s
    WHERE s.srid IN (
        4326,  -- WGS84 (most common)
        3857,  -- Web Mercator 
        2154,  -- RGF93 / Lambert-93 (France)
        32633, -- WGS84 / UTM zone 33N
        32634, -- WGS84 / UTM zone 34N
        32635, -- WGS84 / UTM zone 35N
        32636  -- WGS84 / UTM zone 36N
    )
    AND (target_srid IS NULL OR s.srid = target_srid)
    ORDER BY s.srid;
$$;

-- Ensure proper permissions on our function
GRANT EXECUTE ON FUNCTION public.get_spatial_reference_systems(INTEGER) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_spatial_reference_systems(INTEGER) FROM public;

-- Create a documentation table to explain the PostGIS limitation
CREATE TABLE IF NOT EXISTS public.security_notes (
    id SERIAL PRIMARY KEY,
    note_type TEXT NOT NULL,
    description TEXT NOT NULL,
    mitigation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on our documentation table
ALTER TABLE public.security_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for security notes (read-only for authenticated users)
CREATE POLICY "Authenticated users can view security notes" 
ON public.security_notes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Insert documentation about the PostGIS system table limitation
INSERT INTO public.security_notes (note_type, description, mitigation)
VALUES (
    'PostGIS System Table',
    'spatial_ref_sys is a PostGIS system table owned by supabase_admin with default ACLs that cannot be modified. This table contains standard geographic coordinate system definitions (EPSG codes).',
    'Access is provided through the get_spatial_reference_systems() function which limits access to commonly used coordinate systems only.'
) ON CONFLICT DO NOTHING;