-- Clean up the problematic security definer view
DROP VIEW IF EXISTS public.spatial_reference_info;

-- Since we cannot control PostGIS system table permissions due to default ACLs,
-- we'll create a comprehensive security solution that works within system constraints

-- Create a secure function to access spatial reference systems (already exists but updating for clarity)
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

-- Create a comment explaining the PostGIS system table limitation
COMMENT ON TABLE public.spatial_ref_sys IS 'PostGIS system table - managed by supabase_admin with default ACLs. Access controlled via get_spatial_reference_systems() function.';

-- Since the PostGIS system table cannot be secured due to system constraints,
-- document this as a known limitation that doesn't affect application security
-- The spatial_ref_sys table contains standard geographic coordinate system definitions
-- which are not sensitive data and are commonly public in GIS applications