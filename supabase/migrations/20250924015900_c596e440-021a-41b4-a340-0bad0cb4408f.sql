-- Drop the existing function with incorrect column references
DROP FUNCTION IF EXISTS public.create_course_batch(jsonb);

-- Recreate the function with correct column names and data types
CREATE OR REPLACE FUNCTION public.create_course_batch(batch_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  video_record RECORD;
  course_id UUID;
  results jsonb := '[]'::jsonb;
  course_count INTEGER := 0;
BEGIN
  -- Loop through each video in the batch
  FOR video_record IN SELECT * FROM jsonb_to_recordset(batch_data) AS x(
    title text,
    instructor_name text,
    rating numeric,
    students integer,
    duration_minutes integer,
    difficulty_level text,
    price text,
    category text,
    subcategory text,
    thumbnail text,
    description text,
    what_you_learn text[],
    requirements text[],
    skills_taught text[],
    skills_required text[]
  )
  LOOP
    -- Insert course with correct column names and data types
    INSERT INTO public.courses (
      title,
      instructor_name,
      rating,
      students,
      duration_hours,
      difficulty_level,
      price,
      category,
      subcategory,
      thumbnail,
      description,
      what_you_learn,
      requirements,
      skills_taught,
      skills_required,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      video_record.title,
      video_record.instructor_name,
      video_record.rating,
      video_record.students,
      ROUND(video_record.duration_minutes / 60.0), -- Convert minutes to hours as integer
      video_record.difficulty_level,
      video_record.price,
      video_record.category,
      video_record.subcategory,
      video_record.thumbnail,
      video_record.description,
      video_record.what_you_learn,
      video_record.requirements,
      video_record.skills_taught,
      video_record.skills_required,
      true,
      now(),
      now()
    )
    RETURNING id INTO course_id;
    
    -- Add to results
    results := results || jsonb_build_object(
      'course_id', course_id,
      'title', video_record.title,
      'status', 'created'
    );
    
    course_count := course_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'courses_created', course_count,
    'results', results
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'courses_created', course_count
  );
END;
$function$;