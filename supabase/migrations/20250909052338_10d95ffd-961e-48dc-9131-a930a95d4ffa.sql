-- First drop the conflicting policy if it exists
DROP POLICY IF EXISTS "Users can view their own lesson progress" ON public.user_lesson_progress;

-- Recreate the policy
CREATE POLICY "Users can view their own lesson progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Enable realtime for course progress updates
ALTER TABLE public.user_lesson_progress REPLICA IDENTITY FULL;
ALTER TABLE public.course_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.course_discussions REPLICA IDENTITY FULL;

-- Add these tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_discussions;

-- Create function to track video progress
CREATE OR REPLACE FUNCTION public.track_video_progress(
  p_lesson_id UUID,
  p_position_seconds INTEGER,
  p_progress_percentage INTEGER DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_course_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Get course_id from lesson
  SELECT course_id INTO v_course_id 
  FROM public.course_lessons 
  WHERE id = p_lesson_id;
  
  -- Insert or update progress
  INSERT INTO public.user_lesson_progress (
    user_id, 
    lesson_id, 
    course_id, 
    last_position_seconds, 
    progress_percentage,
    status,
    updated_at
  ) VALUES (
    v_user_id, 
    p_lesson_id, 
    v_course_id, 
    p_position_seconds, 
    COALESCE(p_progress_percentage, 0),
    CASE WHEN COALESCE(p_progress_percentage, 0) >= 90 THEN 'completed' ELSE 'in_progress' END,
    NOW()
  )
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET 
    last_position_seconds = EXCLUDED.last_position_seconds,
    progress_percentage = COALESCE(EXCLUDED.progress_percentage, user_lesson_progress.progress_percentage),
    status = CASE 
      WHEN COALESCE(EXCLUDED.progress_percentage, user_lesson_progress.progress_percentage) >= 90 THEN 'completed' 
      ELSE 'in_progress' 
    END,
    updated_at = NOW();
    
  -- Track analytics
  INSERT INTO public.learning_analytics (
    user_id,
    course_id,
    lesson_id,
    activity_type,
    duration_seconds,
    metadata
  ) VALUES (
    v_user_id,
    v_course_id,
    p_lesson_id,
    'video_watch',
    1, -- Will be updated with actual duration
    jsonb_build_object('position', p_position_seconds, 'progress', p_progress_percentage)
  );
END;
$$;