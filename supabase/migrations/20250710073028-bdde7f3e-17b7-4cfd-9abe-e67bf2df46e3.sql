
-- First, let's set up proper college admin permissions and create college management tables

-- Create college creation requests table
CREATE TABLE IF NOT EXISTS college_creation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  college_name TEXT NOT NULL,
  college_email TEXT NOT NULL,
  official_website TEXT,
  contact_person TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  documents_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on college creation requests
ALTER TABLE college_creation_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for college creation requests
CREATE POLICY "Users can create their own college requests" ON college_creation_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their own college requests" ON college_creation_requests
  FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Admins can manage all college requests" ON college_creation_requests
  FOR ALL USING (is_app_admin(auth.uid()));

-- Create college analytics table
CREATE TABLE IF NOT EXISTS college_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  profile_views INTEGER DEFAULT 0,
  course_views INTEGER DEFAULT 0,
  application_starts INTEGER DEFAULT 0,
  application_completions INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on college analytics
ALTER TABLE college_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for college analytics
CREATE POLICY "College admins can view their college analytics" ON college_analytics
  FOR SELECT USING (
    college_id IN (
      SELECT college_id FROM college_admins 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create college posts table for updates
CREATE TABLE IF NOT EXISTS college_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT DEFAULT 'announcement' CHECK (post_type IN ('announcement', 'event', 'admission', 'achievement', 'news')),
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on college posts
ALTER TABLE college_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for college posts
CREATE POLICY "Anyone can view published college posts" ON college_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "College admins can manage their college posts" ON college_posts
  FOR ALL USING (
    college_id IN (
      SELECT college_id FROM college_admins 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Add super admin permissions for talentxcelpro@gmail.com
INSERT INTO user_roles (user_id, role, is_active) 
SELECT id, 'super_admin'::app_role, true 
FROM auth.users 
WHERE email = 'talentxcelpro@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Add college admin entry for talentxcelpro@gmail.com for all colleges
INSERT INTO college_admins (college_id, user_id, role, can_edit_college_info, can_manage_courses, can_manage_admissions, can_view_analytics, is_active)
SELECT c.id, u.id, 'super_admin', true, true, true, true, true
FROM colleges c, auth.users u
WHERE u.email = 'talentxcelpro@gmail.com'
ON CONFLICT (college_id, user_id) DO UPDATE SET
  role = 'super_admin',
  can_edit_college_info = true,
  can_manage_courses = true,
  can_manage_admissions = true,
  can_view_analytics = true,
  is_active = true;

-- Create function to handle college creation approval
CREATE OR REPLACE FUNCTION approve_college_creation(request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  new_college_id UUID;
BEGIN
  -- Get request details
  SELECT * INTO request_record
  FROM college_creation_requests
  WHERE id = request_id AND status = 'pending';
  
  IF request_record IS NULL THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
  
  -- Create college
  INSERT INTO colleges (
    name, email, website, phone, address, city, state,
    created_by, verification_status, is_verified, is_active
  ) VALUES (
    request_record.college_name,
    request_record.college_email,
    request_record.official_website,
    request_record.phone,
    request_record.address,
    request_record.city,
    request_record.state,
    request_record.requester_id,
    'verified',
    true,
    true
  ) RETURNING id INTO new_college_id;
  
  -- Add requester as college admin
  INSERT INTO college_admins (
    college_id, user_id, role, 
    can_edit_college_info, can_manage_courses, can_manage_admissions, can_view_analytics,
    is_active
  ) VALUES (
    new_college_id, request_record.requester_id, 'admin',
    true, true, true, true, true
  );
  
  -- Update request status
  UPDATE college_creation_requests
  SET status = 'approved', updated_at = now()
  WHERE id = request_id;
  
  RETURN new_college_id;
END;
$$;

-- Add some sample college posts
INSERT INTO college_posts (college_id, title, content, post_type, created_by) 
SELECT 
  c.id,
  'Welcome to ' || c.name || ' Academic Year 2024-25',
  'We are excited to welcome new students to our prestigious institution. Join us for an amazing academic journey filled with opportunities for growth and learning.',
  'announcement',
  (SELECT id FROM auth.users WHERE email = 'talentxcelpro@gmail.com' LIMIT 1)
FROM colleges c
LIMIT 5;

-- Trigger to update college posts updated_at
CREATE OR REPLACE FUNCTION update_college_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_college_posts_updated_at_trigger
  BEFORE UPDATE ON college_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_college_posts_updated_at();
