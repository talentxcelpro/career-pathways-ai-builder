-- Fix variable name conflict in create_course_batch function
CREATE OR REPLACE FUNCTION public.create_course_batch(
  p_batch_name text,
  p_course_count integer,
  p_categories text[] DEFAULT ARRAY['programming', 'web-development', 'database', 'design', 'data-science', 'mobile-development', 'marketing', 'cloud-computing', 'cybersecurity']
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_batch_id UUID;
  courses_created INTEGER := 0;
  course_record RECORD;
BEGIN
  -- Create the batch
  INSERT INTO course_batches (name, total_courses, status)
  VALUES (p_batch_name, p_course_count, 'active')
  RETURNING id INTO new_batch_id;
  
  -- Get random courses from specified categories and assign to batch
  FOR course_record IN (
    SELECT c.id
    FROM courses c
    WHERE c.is_active = true
    AND c.category = ANY(p_categories)
    ORDER BY RANDOM()
    LIMIT p_course_count
  ) LOOP
    -- Update each course with the batch_id (using new_batch_id to avoid variable conflict)
    UPDATE courses 
    SET batch_id = new_batch_id
    WHERE id = course_record.id;
    
    courses_created := courses_created + 1;
  END LOOP;
  
  -- Update batch with actual courses created
  UPDATE course_batches 
  SET total_courses = courses_created
  WHERE id = new_batch_id;
  
  -- Return the result with correct property names
  RETURN jsonb_build_object(
    'success', true,
    'batch_number', new_batch_id,
    'courses_created', courses_created,
    'message', 'Batch created successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$function$;