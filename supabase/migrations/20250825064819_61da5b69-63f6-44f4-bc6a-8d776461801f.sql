-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create shgs table for Self-Help Groups (if not exists)
CREATE TABLE IF NOT EXISTS public.shgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_name TEXT,
  description TEXT,
  formation_date DATE,
  member_count INTEGER DEFAULT 0,
  focus_areas TEXT[] DEFAULT '{}',
  village TEXT,
  state TEXT,
  pin_code TEXT,
  location GEOMETRY(Point, 4326),
  contact_email TEXT,
  contact_phone TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shg_members table for SHG membership
CREATE TABLE IF NOT EXISTS public.shg_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_in_shg TEXT DEFAULT 'member' CHECK (role_in_shg IN ('leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shg_id, user_id)
);

-- Create shg_track_records table
CREATE TABLE IF NOT EXISTS public.shg_track_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shg_id UUID REFERENCES public.shgs(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  funds_raised NUMERIC(12,2) DEFAULT 0,
  funds_spent NUMERIC(12,2) DEFAULT 0,
  impact_metrics JSONB DEFAULT '{}',
  testimonials TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for chat functionality
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- Create transactions table for payments
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_shg_id UUID REFERENCES public.shgs(id),
  recipient_shg_id UUID REFERENCES public.shgs(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update profiles table to add missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guest',
ADD COLUMN IF NOT EXISTS shg_id UUID;

-- Add constraint for role if not exists
DO $$
BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('shg_admin', 'member', 'guest'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add foreign key constraint for profiles.shg_id if not exists
DO $$
BEGIN
  ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_shg_id_fkey 
  FOREIGN KEY (shg_id) REFERENCES public.shgs(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shg_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shg_track_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for shgs (public read, authenticated create/update)
CREATE POLICY "Anyone can view SHGs" ON public.shgs
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create SHGs" ON public.shgs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "SHG creators can update their SHGs" ON public.shgs
  FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for shg_members
CREATE POLICY "Users can view SHG memberships" ON public.shg_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join SHGs" ON public.shg_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create RLS policies for track records (public read)
CREATE POLICY "Anyone can view track records" ON public.shg_track_records
  FOR SELECT USING (true);

CREATE POLICY "SHG members can create track records" ON public.shg_track_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shg_members 
      WHERE shg_id = shg_track_records.shg_id 
      AND user_id = auth.uid()
      AND role_in_shg = 'leader'
    )
  );

-- Create RLS policies for transactions (involved parties only)
CREATE POLICY "Users can view their SHG transactions" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shg_members sm1 
      WHERE sm1.shg_id = sender_shg_id AND sm1.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.shg_members sm2 
      WHERE sm2.shg_id = recipient_shg_id AND sm2.user_id = auth.uid()
    )
  );

-- Create geospatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_shgs_location ON public.shgs USING GIST (location);

-- Create function for finding nearby SHGs
CREATE OR REPLACE FUNCTION public.nearby_shgs(lat FLOAT, lon FLOAT, radius_km FLOAT DEFAULT 50)
RETURNS TABLE(
  id UUID,
  name TEXT,
  leader_name TEXT,
  village TEXT,
  state TEXT,
  focus_areas TEXT[],
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.leader_name,
    s.village,
    s.state,
    s.focus_areas,
    ROUND((ST_Distance(s.location, ST_MakePoint(lon, lat)::geography) / 1000)::NUMERIC, 2)::FLOAT AS distance_km
  FROM public.shgs s
  WHERE s.location IS NOT NULL
    AND ST_DWithin(s.location, ST_MakePoint(lon, lat)::geography, radius_km * 1000)
  ORDER BY ST_Distance(s.location, ST_MakePoint(lon, lat)::geography);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_shgs_updated_at ON public.shgs;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shgs_updated_at
  BEFORE UPDATE ON public.shgs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();