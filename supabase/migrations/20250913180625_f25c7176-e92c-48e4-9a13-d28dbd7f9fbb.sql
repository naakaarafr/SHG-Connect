-- Create a security definer function to access spatial reference systems safely
-- This provides controlled access to spatial_ref_sys without exposing the table directly
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
    SELECT 
        s.srid::INTEGER,
        s.auth_name::TEXT,
        s.auth_srid::INTEGER,
        s.srtext::TEXT,
        s.proj4text::TEXT
    FROM spatial_ref_sys s
    WHERE CASE 
        WHEN target_srid IS NOT NULL THEN s.srid = target_srid
        ELSE TRUE
    END
    ORDER BY s.srid;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_spatial_reference_systems(INTEGER) TO authenticated;

-- Revoke all permissions on spatial_ref_sys from public and authenticated roles
-- This effectively hides the table from the PostgREST API
REVOKE ALL ON TABLE public.spatial_ref_sys FROM public;
REVOKE ALL ON TABLE public.spatial_ref_sys FROM authenticated;