-- Drop and recreate the nearby_shgs function
DROP FUNCTION IF EXISTS public.nearby_shgs(double precision, double precision, double precision);

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

-- Insert sample SHG data
INSERT INTO public.shgs (name, leader_name, village, state, pin_code, focus_areas, member_count, description, contact_email, contact_phone, location, created_by) VALUES
('Mahila Shakti SHG', 'Priya Sharma', 'Amethi', 'Uttar Pradesh', '227405', ARRAY['Agriculture', 'Microfinance', 'Women Empowerment'], 15, 'A women-led self-help group focused on sustainable agriculture and financial inclusion in rural areas.', 'mahilashakti@gmail.com', '+91-9876543210', ST_SetSRID(ST_MakePoint(81.8, 26.1), 4326), 'e7f0db41-f1a9-42ba-b244-67cb529deef5'),

('Grameen Vikas Mandal', 'Rajesh Kumar', 'Varanasi', 'Uttar Pradesh', '221005', ARRAY['Education', 'Healthcare', 'Skill Development'], 20, 'Community-driven group working towards holistic village development through education and healthcare initiatives.', 'grameenvikas@yahoo.com', '+91-9876543211', ST_SetSRID(ST_MakePoint(83.0, 25.3), 4326), 'e7f0db41-f1a9-42ba-b244-67cb529deef5'),

('Swayam Sahayata Samuh', 'Meera Devi', 'Allahabad', 'Uttar Pradesh', '211001', ARRAY['Handicrafts', 'Marketing', 'Women Empowerment'], 12, 'Artisan women group specializing in traditional handicrafts and textiles with direct market access.', 'swayamsahayata@outlook.com', '+91-9876543212', ST_SetSRID(ST_MakePoint(81.85, 25.45), 4326), 'e7f0db41-f1a9-42ba-b244-67cb529deef5'),

('Kisan Mitra Sangathan', 'Suresh Patel', 'Agra', 'Uttar Pradesh', '282001', ARRAY['Agriculture', 'Organic Farming', 'Microfinance'], 25, 'Farmer collective promoting organic farming techniques and providing micro-credit facilities.', 'kisanmitra@gmail.com', '+91-9876543213', ST_SetSRID(ST_MakePoint(78.0, 27.2), 4326), 'e7f0db41-f1a9-42ba-b244-67cb529deef5'),

('Mahila Udyog Samiti', 'Sunita Agarwal', 'Chennai', 'Tamil Nadu', '600001', ARRAY['Food Processing', 'Entrepreneurship', 'Skill Development'], 18, 'Women entrepreneurs group focused on food processing and small-scale manufacturing businesses.', 'mahilaudyog@gmail.com', '+91-9876543214', ST_SetSRID(ST_MakePoint(80.27, 13.08), 4326), 'e7f0db41-f1a9-42ba-b244-67cb529deef5'),

('Bhumi Vikas Samuh', 'Arjun Singh', 'Jaipur', 'Rajasthan', '302001', ARRAY['Water Conservation', 'Agriculture', 'Environment'], 22, 'Environmental conservation group working on water harvesting and sustainable farming practices.', 'bhumivikas@rediffmail.com', '+91-9876543215', ST_SetSRID(ST_MakePoint(75.79, 26.91), 4326), 'e7f0db41-f1a9-42ba-b244-67cb529deef5');