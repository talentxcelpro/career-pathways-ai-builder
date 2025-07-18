-- Check if the services table already has the required fields
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'services' AND table_schema = 'public';

-- If fields are missing, add them
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS profile_link TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published')),
ADD COLUMN IF NOT EXISTS contact_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS portfolio_items JSONB DEFAULT '[]';