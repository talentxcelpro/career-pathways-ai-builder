-- Enable realtime for existing tables that were created
ALTER TABLE public.user_lesson_progress REPLICA IDENTITY FULL;
ALTER TABLE public.course_discussions REPLICA IDENTITY FULL;

-- Add tables to realtime publication 
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_discussions;

-- Only add course_notifications if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'course_notifications') THEN
    EXECUTE 'ALTER TABLE public.course_notifications REPLICA IDENTITY FULL';
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.course_notifications';
  END IF;
END
$$;