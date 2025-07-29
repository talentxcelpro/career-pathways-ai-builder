-- Update profiles table to support AI bots
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_ai_bot BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bot_tone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_frequency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS departments TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS content_domains TEXT[];

-- Create index for efficient bot queries
CREATE INDEX IF NOT EXISTS idx_profiles_ai_bot ON profiles(is_ai_bot) WHERE is_ai_bot = true;

-- Update existing AI bots data if any exists
-- This will help migrate from the old ai_bots table approach to the new profiles approach