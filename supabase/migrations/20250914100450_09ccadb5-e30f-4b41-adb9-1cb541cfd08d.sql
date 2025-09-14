-- Final clean security solution that handles all conflicts

-- Create our secure access function (update if exists)
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
    AND (target_srid IS NULL OR s.srid = target_srid)
    ORDER BY s.srid;
$$;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION public.get_spatial_reference_systems(INTEGER) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_spatial_reference_systems(INTEGER) FROM public;

-- Create documentation table if not exists
CREATE TABLE IF NOT EXISTS public.security_notes (
    id SERIAL PRIMARY KEY,
    note_type TEXT NOT NULL,
    description TEXT NOT NULL,
    mitigation TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'security_notes' 
        AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE public.security_notes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policy only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'security_notes' 
        AND policyname = 'Authenticated users can view security notes'
    ) THEN
        CREATE POLICY "Authenticated users can view security notes" 
        ON public.security_notes 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Insert documentation about PostGIS limitation
INSERT INTO public.security_notes (note_type, description, mitigation)
VALUES (
    'PostGIS System Table',
    'spatial_ref_sys table contains standard EPSG coordinate systems. Cannot enable RLS due to supabase_admin default ACLs.',
    'Use get_spatial_reference_systems() function for controlled access to common coordinate systems.'
) ON CONFLICT DO NOTHING;