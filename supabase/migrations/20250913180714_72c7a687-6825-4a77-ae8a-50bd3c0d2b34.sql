-- Create a more comprehensive security setup for PostGIS system tables
-- Since we can't modify ownership, we'll use a different approach

-- First, let's try to revoke permissions more explicitly
REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.spatial_ref_sys FROM anon;

-- Since PostGIS tables might have default grants, let's be more explicit
-- Grant only to postgres role (which owns our other tables)
GRANT SELECT ON TABLE public.spatial_ref_sys TO postgres;

-- Create a view that provides controlled access to spatial reference data
-- This view will have proper RLS
DROP VIEW IF EXISTS public.spatial_reference_info;
CREATE VIEW public.spatial_reference_info AS
SELECT 
    srid,
    auth_name,
    auth_srid,
    srtext,
    proj4text
FROM public.spatial_ref_sys
WHERE srid IN (4326, 3857, 2154, 32633, 32634, 32635, 32636); -- Common spatial reference systems

-- Enable RLS on the view
ALTER VIEW public.spatial_reference_info SET (security_barrier = true);

-- Create RLS policy for the view
-- Note: Views don't have RLS directly, but we control access through the underlying table permissions

-- Grant permissions only to authenticated users for the view
GRANT SELECT ON public.spatial_reference_info TO authenticated;

-- Update our function to use better security
DROP FUNCTION IF EXISTS public.get_spatial_reference_systems(INTEGER);
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
    -- Only return commonly used spatial reference systems
    SELECT 
        s.srid::INTEGER,
        s.auth_name::TEXT,
        s.auth_srid::INTEGER,
        s.srtext::TEXT,
        s.proj4text::TEXT
    FROM spatial_ref_sys s
    WHERE s.srid IN (4326, 3857, 2154, 32633, 32634, 32635, 32636)
    AND CASE 
        WHEN target_srid IS NOT NULL THEN s.srid = target_srid
        ELSE TRUE
    END
    ORDER BY s.srid;
$$;