-- Fix missing database schema issues

-- Add missing columns to existing tables
ALTER TABLE courses ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
ALTER TABLE profile_views ADD COLUMN IF NOT EXISTS view_type TEXT DEFAULT 'profile_view';

-- Create course_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  course_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default course categories
INSERT INTO course_categories (name, description, course_count) VALUES
  ('Technology & IT', 'Programming, software development, and IT skills', 45),
  ('Business & Finance', 'Business management, finance, and entrepreneurship', 38),
  ('Marketing & Sales', 'Digital marketing, sales strategies, and brand management', 32),
  ('Design & Creative', 'Graphic design, UI/UX, and creative arts', 28),
  ('Healthcare & Medical', 'Medical knowledge, healthcare management, and wellness', 25),
  ('Education & Training', 'Teaching methods, educational technology, and training', 22),
  ('Engineering & Manufacturing', 'Engineering principles and manufacturing processes', 18),
  ('Hospitality & Tourism', 'Hotel management, tourism, and customer service', 15)
ON CONFLICT (name) DO NOTHING;

-- Create function to update course categories updated_at
CREATE OR REPLACE FUNCTION update_course_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for course_categories
DROP TRIGGER IF EXISTS update_course_categories_updated_at ON course_categories;
CREATE TRIGGER update_course_categories_updated_at
  BEFORE UPDATE ON course_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_course_categories_updated_at();