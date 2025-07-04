-- Create goal-driven communities table
CREATE TABLE public.goal_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL, -- 'skill_development', 'career_change', 'networking', 'job_search'
  target_outcome TEXT,
  timeline_months INTEGER,
  member_count INTEGER DEFAULT 0,
  max_members INTEGER DEFAULT 100,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Create community memberships table
CREATE TABLE public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.goal_communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(community_id, user_id)
);

-- Create community activities table for tracking progress
CREATE TABLE public.community_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.goal_communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'post', 'comment', 'resource_share', 'milestone_achieved'
  content TEXT,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create gamification tables
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'streak_keeper', 'knowledge_sharer', 'community_builder', 'career_switcher'
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  community_id UUID REFERENCES public.goal_communities(id) ON DELETE SET NULL
);

-- Create user progress tracking
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  communities_joined INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  connections_made INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.goal_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Communities are viewable by everyone" ON public.goal_communities FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create communities" ON public.goal_communities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Community creators can update their communities" ON public.goal_communities FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Members can view their memberships" ON public.community_memberships FOR SELECT USING (auth.uid() = user_id OR community_id IN (SELECT id FROM public.goal_communities WHERE created_by = auth.uid()));
CREATE POLICY "Users can join communities" ON public.community_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own memberships" ON public.community_memberships FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Community activities are viewable by members" ON public.community_activities FOR SELECT USING (
  community_id IN (SELECT community_id FROM public.community_memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create activities in their communities" ON public.community_activities FOR INSERT WITH CHECK (
  auth.uid() = user_id AND community_id IN (SELECT community_id FROM public.community_memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_goal_communities_goal_type ON public.goal_communities(goal_type);
CREATE INDEX idx_community_memberships_user_id ON public.community_memberships(user_id);
CREATE INDEX idx_community_activities_community_id ON public.community_activities(community_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);

-- Create trigger to update member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.goal_communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.goal_communities 
    SET member_count = GREATEST(member_count - 1, 0) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_member_count_trigger
  AFTER INSERT OR DELETE ON public.community_memberships
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();