-- Create emoji configuration table for admin settings
CREATE TABLE IF NOT EXISTS public.emoji_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji_code TEXT NOT NULL, -- e.g., '👍', '❤️', '😂', etc.
  emoji_name TEXT NOT NULL, -- e.g., 'like', 'love', 'laugh', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(emoji_name)
);

-- Insert default emojis
INSERT INTO public.emoji_configs (emoji_code, emoji_name, display_order) VALUES
('👍', 'like', 1),
('❤️', 'love', 2),
('😂', 'laugh', 3),
('😢', 'sad', 4),
('😮', 'wow', 5),
('😠', 'angry', 6)
ON CONFLICT (emoji_name) DO NOTHING;

-- Enable RLS on emoji_configs
ALTER TABLE public.emoji_configs ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing emoji configs (everyone can view)
CREATE POLICY "Anyone can view active emoji configs" 
ON public.emoji_configs 
FOR SELECT 
USING (is_active = true);

-- Create policy for admins to manage emoji configs
CREATE POLICY "Admins can manage emoji configs" 
ON public.emoji_configs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_role = 'admin'
  )
);

-- Update post_reactions table to use reaction_type instead of just storing emoji
ALTER TABLE public.post_reactions 
ADD COLUMN IF NOT EXISTS reaction_type TEXT REFERENCES emoji_configs(emoji_name);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_type_post ON public.post_reactions(reaction_type, post_id);
CREATE INDEX IF NOT EXISTS idx_emoji_configs_active ON public.emoji_configs(is_active, display_order);

-- Create or replace function to get reaction counts for a post
CREATE OR REPLACE FUNCTION public.get_post_reaction_counts(post_uuid UUID)
RETURNS TABLE (
  reaction_type TEXT,
  emoji_code TEXT,
  count BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    pr.reaction_type,
    ec.emoji_code,
    COUNT(pr.id) as count
  FROM public.post_reactions pr
  JOIN public.emoji_configs ec ON ec.emoji_name = pr.reaction_type
  WHERE pr.post_id = post_uuid 
    AND ec.is_active = true
  GROUP BY pr.reaction_type, ec.emoji_code, ec.display_order
  ORDER BY ec.display_order;
$$;