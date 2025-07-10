-- Drop any remaining problematic triggers that reference non-existent status field
DROP TRIGGER IF EXISTS update_company_follow_status_trigger ON company_follows;
DROP TRIGGER IF EXISTS company_follows_status_update ON company_follows;

-- Ensure the company_follows table has the correct structure
ALTER TABLE company_follows 
ADD COLUMN IF NOT EXISTS followed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Remove any problematic functions
DROP FUNCTION IF EXISTS update_company_follow_status();

-- Recreate the proper notification trigger function
CREATE OR REPLACE FUNCTION notify_company_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Company follow notifications
  IF TG_OP = 'INSERT' THEN
    -- Only create notification, don't try to access non-existent status field
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS notify_company_follow_trigger ON company_follows;
CREATE TRIGGER notify_company_follow_trigger
  AFTER INSERT ON company_follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_company_follow();