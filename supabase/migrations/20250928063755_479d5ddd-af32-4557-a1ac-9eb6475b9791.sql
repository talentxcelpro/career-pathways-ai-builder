-- Add unique constraint to prevent duplicate achievements using existing columns
ALTER TABLE career_achievements 
ADD CONSTRAINT unique_user_achievement 
UNIQUE (user_id, achievement_type, achievement_title);

-- Create function to handle duplicate achievement insertions
CREATE OR REPLACE FUNCTION handle_duplicate_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- If a duplicate is being inserted, update the existing record instead
  IF EXISTS (
    SELECT 1 FROM career_achievements 
    WHERE user_id = NEW.user_id 
    AND achievement_type = NEW.achievement_type 
    AND achievement_title = NEW.achievement_title
  ) THEN
    -- Update the existing achievement with latest data
    UPDATE career_achievements 
    SET 
      points_awarded = GREATEST(points_awarded, NEW.points_awarded),
      verified = NEW.verified OR verified,
      verification_data = COALESCE(NEW.verification_data, verification_data),
      earned_at = CASE 
        WHEN NEW.earned_at IS NOT NULL AND earned_at IS NULL THEN NEW.earned_at
        ELSE earned_at 
      END,
      is_public = COALESCE(NEW.is_public, is_public)
    WHERE user_id = NEW.user_id 
    AND achievement_type = NEW.achievement_type 
    AND achievement_title = NEW.achievement_title;
    
    -- Return NULL to prevent the INSERT
    RETURN NULL;
  END IF;
  
  -- Allow the insert if no duplicate exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent duplicate achievements
CREATE TRIGGER prevent_duplicate_achievements
  BEFORE INSERT ON career_achievements
  FOR EACH ROW
  EXECUTE FUNCTION handle_duplicate_achievement();