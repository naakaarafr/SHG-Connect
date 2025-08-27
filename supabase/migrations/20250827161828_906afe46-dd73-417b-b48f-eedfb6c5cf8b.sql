-- Fix RLS for any missing tables
ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Add policies for system tables (they should be readable by everyone)
CREATE POLICY "Allow read access to geometry_columns" ON public.geometry_columns FOR SELECT USING (true);
CREATE POLICY "Allow read access to geography_columns" ON public.geography_columns FOR SELECT USING (true);
CREATE POLICY "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys FOR SELECT USING (true);

-- Fix search path for the nearby_shgs function
CREATE OR REPLACE FUNCTION public.nearby_shgs(lat double precision, lon double precision, radius_km double precision)
RETURNS TABLE (
  id uuid,
  name text,
  leader_name text,
  village text,
  state text,
  focus_areas text[],
  member_count integer,
  description text,
  distance_km double precision
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.name,
    s.leader_name,
    s.village,
    s.state,
    s.focus_areas,
    s.member_count,
    s.description,
    ST_Distance(
      ST_Transform(location, 3857),
      ST_Transform(ST_SetSRID(ST_MakePoint(lon, lat), 4326), 3857)
    ) / 1000.0 AS distance_km
  FROM shgs s
  WHERE location IS NOT NULL
    AND ST_DWithin(
      ST_Transform(location, 3857),
      ST_Transform(ST_SetSRID(ST_MakePoint(lon, lat), 4326), 3857),
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
$$;