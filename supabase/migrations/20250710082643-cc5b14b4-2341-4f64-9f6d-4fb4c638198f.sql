-- Fix company follow functionality by removing problematic triggers that reference non-existent 'status' field
-- Also ensure proper column exists for followed_at

-- First, let's check if the company_follows table has the right structure
-- Add followed_at column if it doesn't exist
ALTER TABLE company_follows 
ADD COLUMN IF NOT EXISTS followed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Drop any triggers that might be causing the 'status' field error
-- These triggers are likely referencing a status field that doesn't exist in company_follows
DROP TRIGGER IF EXISTS notify_company_activities_trigger ON company_follows;
DROP TRIGGER IF EXISTS update_company_follow_status ON company_follows;

-- Recreate the proper trigger for company follow notifications
CREATE OR REPLACE FUNCTION notify_company_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Company follow notifications
  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'company_followed',
      'Following Company',
      'You are now following ' || COALESCE((SELECT name FROM companies WHERE id = NEW.company_id), 'a company'),
      'companies',
      NEW.company_id,
      '/companies/' || COALESCE((SELECT slug FROM companies WHERE id = NEW.company_id), NEW.company_id::text),
      'low',
      'building'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for company follows
CREATE TRIGGER notify_company_follow_trigger
  AFTER INSERT ON company_follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_company_follow();