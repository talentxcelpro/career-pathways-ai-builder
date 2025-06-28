
-- Create tool_usage table for tracking tool usage
CREATE TABLE IF NOT EXISTS public.tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  session_data JSONB DEFAULT '{}',
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tool_usage
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for tool_usage
CREATE POLICY "Users can view their own tool usage" 
  ON public.tool_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool usage" 
  ON public.tool_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool usage" 
  ON public.tool_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tool_usage_user_id ON public.tool_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_name ON public.tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_usage_created_at ON public.tool_usage(created_at);
