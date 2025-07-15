-- Phase 6: Social Content & Community Engagement

-- User Posts table for content sharing
CREATE TABLE public.user_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('article', 'story', 'tip', 'question', 'achievement')),
  tags TEXT[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mentorship Programs table
CREATE TABLE public.mentorship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_type TEXT NOT NULL CHECK (program_type IN ('career_guidance', 'skill_development', 'interview_prep', 'leadership')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  goals TEXT[],
  duration_weeks INTEGER DEFAULT 12,
  meeting_frequency TEXT DEFAULT 'weekly',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

-- Discussion Forums table
CREATE TABLE public.discussion_forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Forum Memberships table
CREATE TABLE public.forum_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID NOT NULL REFERENCES discussion_forums(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(forum_id, user_id)
);

-- Career Milestones table
CREATE TABLE public.career_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('promotion', 'new_job', 'skill_certified', 'project_completed', 'education_completed')),
  title TEXT NOT NULL,
  description TEXT,
  company TEXT,
  achievement_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  celebration_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Social Interactions table
CREATE TABLE public.social_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'milestone', 'comment')),
  target_id UUID NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'celebrate')),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, target_type, target_id, interaction_type)
);

-- Enable RLS
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own posts" ON public.user_posts FOR ALL USING (author_id = auth.uid());
CREATE POLICY "Anyone can view published posts" ON public.user_posts FOR SELECT USING (true);

CREATE POLICY "Users can manage their mentorship programs" ON public.mentorship_programs FOR ALL 
USING (mentor_id = auth.uid() OR mentee_id = auth.uid());

CREATE POLICY "Anyone can view forums" ON public.discussion_forums FOR SELECT USING (is_active = true);
CREATE POLICY "Members can manage their forum memberships" ON public.forum_memberships FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their milestones" ON public.career_milestones FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Anyone can view public milestones" ON public.career_milestones FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage their interactions" ON public.social_interactions FOR ALL USING (user_id = auth.uid());

-- Indexes and Triggers
CREATE INDEX idx_user_posts_author ON public.user_posts(author_id);
CREATE INDEX idx_user_posts_type ON public.user_posts(post_type);
CREATE INDEX idx_mentorship_mentor ON public.mentorship_programs(mentor_id);
CREATE INDEX idx_mentorship_mentee ON public.mentorship_programs(mentee_id);
CREATE INDEX idx_forum_memberships_user ON public.forum_memberships(user_id);
CREATE INDEX idx_career_milestones_user ON public.career_milestones(user_id);
CREATE INDEX idx_social_interactions_target ON public.social_interactions(target_type, target_id);

CREATE TRIGGER update_user_posts_updated_at BEFORE UPDATE ON public.user_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentorship_programs_updated_at BEFORE UPDATE ON public.mentorship_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discussion_forums_updated_at BEFORE UPDATE ON public.discussion_forums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();