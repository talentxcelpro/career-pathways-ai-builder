-- Create a function to sync bot profile pictures to profiles table
CREATE OR REPLACE FUNCTION sync_bot_profile_pictures()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profiles table when bot profile picture changes
  IF (TG_OP = 'UPDATE' AND 
      (OLD.profile_picture_url IS DISTINCT FROM NEW.profile_picture_url OR 
       OLD.banner_picture_url IS DISTINCT FROM NEW.banner_picture_url)) THEN
    
    -- Update the profile record for this bot
    UPDATE profiles 
    SET 
      profile_picture_url = NEW.profile_picture_url,
      banner_url = NEW.banner_picture_url,
      updated_at = now()
    WHERE email = NEW.email AND is_ai_bot = true;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER sync_bot_profile_pictures_trigger
  AFTER UPDATE ON ai_bots
  FOR EACH ROW
  EXECUTE FUNCTION sync_bot_profile_pictures();