
-- Create collaboration_sessions table for real-time collaboration
CREATE TABLE public.collaboration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  shared_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_participants table for collaboration participants
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT DEFAULT 'participant',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_suggestions table for automated suggestions
CREATE TABLE public.user_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tool_name TEXT,
  priority TEXT DEFAULT 'medium',
  reason TEXT,
  estimated_time INTEGER DEFAULT 0,
  potential_impact TEXT DEFAULT 'medium',
  expires_at TIMESTAMP WITH TIME ZONE,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for collaboration_sessions
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaboration sessions they participate in" 
  ON public.collaboration_sessions 
  FOR SELECT 
  USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT session_id FROM public.session_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create collaboration sessions" 
  ON public.collaboration_sessions 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own collaboration sessions" 
  ON public.collaboration_sessions 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Add RLS policies for session_participants
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view session participants for sessions they're in" 
  ON public.session_participants 
  FOR SELECT 
  USING (
    session_id IN (
      SELECT id FROM public.collaboration_sessions 
      WHERE created_by = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can join sessions as participants" 
  ON public.session_participants 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Add RLS policies for user_suggestions
ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own suggestions" 
  ON public.user_suggestions 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own suggestions" 
  ON public.user_suggestions 
  FOR UPDATE 
  USING (user_id = auth.uid());
