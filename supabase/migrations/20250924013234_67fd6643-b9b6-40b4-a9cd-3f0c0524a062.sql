-- Fix the auto_generate_meta_tags function to use instructor_name instead of instructor
CREATE OR REPLACE FUNCTION public.auto_generate_meta_tags()
RETURNS TRIGGER AS $$
DECLARE
  content_data JSONB;
BEGIN
  -- Prepare content data based on table
  IF TG_TABLE_NAME = 'jobs' THEN
    content_data := jsonb_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'company_name', NEW.company_name,
      'location', NEW.location,
      'employment_type', NEW.employment_type,
      'salary_min', NEW.salary_min,
      'salary_max', NEW.salary_max,
      'skills', NEW.skills
    );
  ELSIF TG_TABLE_NAME = 'companies' THEN
    content_data := jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'industry', NEW.industry,
      'location', NEW.location,
      'size', NEW.size,
      'description', NEW.description
    );
  ELSIF TG_TABLE_NAME = 'courses' THEN
    content_data := jsonb_build_object(
      'id', NEW.id,
      'title', NEW.title,
      'instructor_name', NEW.instructor_name,
      'duration', NEW.duration,
      'level', NEW.level,
      'price', NEW.price,
      'skills', NEW.skills
    );
  END IF;

  -- Queue meta tag generation (async)
  INSERT INTO public.ai_operation_queue (
    user_id,
    operation_type,
    tool_slug,
    input_data,
    priority
  ) VALUES (
    COALESCE(NEW.created_by, NEW.posted_by, NEW.user_id, auth.uid()),
    'meta_generation',
    'ai-meta-generator',
    jsonb_build_object(
      'type', CASE 
        WHEN TG_TABLE_NAME = 'jobs' THEN 'job'
        WHEN TG_TABLE_NAME = 'companies' THEN 'company'
        WHEN TG_TABLE_NAME = 'courses' THEN 'course'
        ELSE 'content'
      END,
      'data', content_data,
      'auto_generated', true
    ),
    1
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;