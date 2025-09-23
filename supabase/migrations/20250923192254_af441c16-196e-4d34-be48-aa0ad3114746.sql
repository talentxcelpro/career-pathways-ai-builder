-- Create the create_course_batch function
CREATE OR REPLACE FUNCTION public.create_course_batch(
  batch_title text,
  batch_description text,
  course_tags text[],
  difficulty_level text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  batch_id uuid;
  course_record RECORD;
  selected_courses uuid[];
  course_count integer := 0;
  target_count integer := 10; -- Target 10 courses per batch
BEGIN
  -- Create a new course batch
  INSERT INTO course_batches (title, description, tags, difficulty, is_active)
  VALUES (batch_title, batch_description, course_tags, difficulty_level, true)
  RETURNING id INTO batch_id;
  
  -- Select courses that match the tags and difficulty
  FOR course_record IN
    SELECT id FROM courses 
    WHERE 
      is_active = true
      AND level = difficulty_level
      AND (
        category = ANY(course_tags) 
        OR subcategory = ANY(course_tags)
        OR title ILIKE ANY(SELECT '%' || unnest(course_tags) || '%')
      )
    ORDER BY RANDOM()
    LIMIT target_count
  LOOP
    -- Add course to batch
    INSERT INTO course_batch_items (batch_id, course_id, sort_order)
    VALUES (batch_id, course_record.id, course_count + 1);
    
    course_count := course_count + 1;
  END LOOP;
  
  -- If we don't have enough courses, fill with random courses of the same difficulty
  IF course_count < target_count THEN
    FOR course_record IN
      SELECT id FROM courses 
      WHERE 
        is_active = true
        AND level = difficulty_level
        AND id NOT IN (
          SELECT course_id FROM course_batch_items WHERE batch_id = batch_id
        )
      ORDER BY RANDOM()
      LIMIT (target_count - course_count)
    LOOP
      INSERT INTO course_batch_items (batch_id, course_id, sort_order)
      VALUES (batch_id, course_record.id, course_count + 1);
      
      course_count := course_count + 1;
    END LOOP;
  END IF;
  
  -- Update batch with final course count
  UPDATE course_batches 
  SET course_count = course_count
  WHERE id = batch_id;
  
  RETURN batch_id;
END;
$function$;