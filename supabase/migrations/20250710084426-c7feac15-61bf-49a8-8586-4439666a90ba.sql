-- Fix the notify_company_follow trigger to remove reference to non-existent status field
-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS notify_company_follow_trigger ON company_follows;

-- Recreate the function without referencing status field
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

-- Recreate the trigger
CREATE TRIGGER notify_company_follow_trigger
  AFTER INSERT ON company_follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_company_follow();