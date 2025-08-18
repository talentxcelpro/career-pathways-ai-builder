-- Fix bot profile assignment and RLS policies for bot social posts pipeline

-- Step 1: Create profiles for bots that don't have them
DO $$
DECLARE
  bot_record RECORD;
BEGIN
  FOR bot_record IN 
    SELECT id as bot_id, name, email, user_id 
    FROM ai_bots 
    WHERE is_active = true 
    AND user_id IS NOT NULL 
    AND user_id NOT IN (SELECT id FROM profiles)
  LOOP
    -- Create profile for bot user_id
    INSERT INTO profiles (id, full_name, email, username, created_at)
    VALUES (
      bot_record.user_id,
      bot_record.name,
      bot_record.email,
      LOWER(REPLACE(bot_record.name, ' ', '_')) || '_bot',
      now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created profile for bot % with user_id %', bot_record.name, bot_record.user_id;
  END LOOP;
END $$;

-- Step 2: Update ai_bots to set profile_id = user_id where profile exists
UPDATE ai_bots 
SET profile_id = user_id 
WHERE is_active = true 
  AND user_id IS NOT NULL 
  AND user_id IN (SELECT id FROM profiles)
  AND profile_id IS NULL;

-- Step 3: Add service role bypass policy for bot_wall to fix RLS issues
DROP POLICY IF EXISTS "Service role can manage bot_wall" ON bot_wall;
CREATE POLICY "Service role can manage bot_wall" 
ON bot_wall 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Step 4: Simplify posts table RLS policies - ensure bots can post
DROP POLICY IF EXISTS "Bots can create posts" ON posts;
CREATE POLICY "Bots can create posts" 
ON posts 
FOR INSERT 
TO authenticated
WITH CHECK (
  author_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM ai_bots WHERE user_id = auth.uid() AND is_active = true)
);

-- Step 5: Add constraint to ensure bots have valid profiles
ALTER TABLE ai_bots 
ADD CONSTRAINT check_active_bots_have_profiles 
CHECK (
  NOT is_active OR 
  (profile_id IS NOT NULL AND user_id IS NOT NULL)
);

-- Step 6: Create function to validate bot setup
CREATE OR REPLACE FUNCTION validate_bot_setup()
RETURNS TABLE(bot_id uuid, bot_name text, has_profile boolean, has_user boolean, is_valid boolean) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    ab.id as bot_id,
    ab.name as bot_name,
    (ab.profile_id IS NOT NULL AND EXISTS (SELECT 1 FROM profiles WHERE id = ab.profile_id)) as has_profile,
    (ab.user_id IS NOT NULL) as has_user,
    (ab.profile_id IS NOT NULL AND ab.user_id IS NOT NULL AND 
     EXISTS (SELECT 1 FROM profiles WHERE id = ab.profile_id)) as is_valid
  FROM ai_bots ab
  WHERE ab.is_active = true
  ORDER BY ab.name;
$$;