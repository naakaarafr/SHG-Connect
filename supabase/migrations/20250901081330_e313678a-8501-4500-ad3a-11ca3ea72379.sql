-- Add sample SHG data for testing
INSERT INTO public.shgs (
  name, 
  leader_name, 
  village, 
  state, 
  focus_areas, 
  member_count, 
  description,
  contact_email,
  contact_phone,
  pin_code,
  created_by
) VALUES 
(
  'Mahila Shakti SHG',
  'Priya Sharma',
  'Rampur',
  'Uttar Pradesh',
  ARRAY['Women Empowerment', 'Microfinance', 'Skill Development'],
  15,
  'Empowering rural women through financial literacy and skill development programs.',
  'mahilashakti@example.com',
  '+91-9876543210',
  '123456',
  'e7f0db41-f1a9-42ba-b244-67cb529deef5'
),
(
  'Krishak Vikas Group',
  'Ramesh Kumar',
  'Patna',
  'Bihar',
  ARRAY['Agriculture', 'Organic Farming', 'Livestock'],
  20,
  'Supporting farmers with modern agricultural techniques and organic farming methods.',
  'krishakvikas@example.com',
  '+91-9876543211',
  '789012',
  'e7f0db41-f1a9-42ba-b244-67cb529deef5'
),
(
  'Swavlamban SHG',
  'Asha Patel',
  'Ahmedabad',
  'Gujarat',
  ARRAY['Handicrafts', 'Small Business', 'Women Empowerment'],
  12,
  'Promoting traditional handicrafts and supporting women entrepreneurs.',
  'swavlamban@example.com',
  '+91-9876543212',
  '345678',
  'e7f0db41-f1a9-42ba-b244-67cb529deef5'
),
(
  'Grameen Shakti Mandal',
  'Suresh Reddy',
  'Hyderabad',
  'Telangana',
  ARRAY['Education', 'Health', 'Community Development'],
  18,
  'Focused on rural education and healthcare initiatives in village communities.',
  'grameenshakti@example.com',
  '+91-9876543213',
  '567890',
  'e7f0db41-f1a9-42ba-b244-67cb529deef5'
),
(
  'Udyami Mahila Sangh',
  'Kavita Singh',
  'Jaipur',
  'Rajasthan',
  ARRAY['Tailoring', 'Food Processing', 'Microfinance'],
  25,
  'Training women in tailoring and food processing to create sustainable livelihoods.',
  'udyamimahila@example.com',
  '+91-9876543214',
  '901234',
  'e7f0db41-f1a9-42ba-b244-67cb529deef5'
);