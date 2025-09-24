-- Fix the create_course_batch function to match component call
DROP FUNCTION IF EXISTS public.create_course_batch(jsonb);
DROP FUNCTION IF EXISTS public.create_course_batch(text, text, text[], text);
DROP FUNCTION IF EXISTS public.create_course_batch(text, integer);

-- Create the correct function with proper parameter handling
CREATE OR REPLACE FUNCTION public.create_course_batch(
  p_batch_name text DEFAULT 'Auto-Generated Batch',
  p_courses_per_batch integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  course_id UUID;
  results jsonb := '[]'::jsonb;
  course_count INTEGER := 0;
  batch_number INTEGER := 1;
  sample_courses jsonb := '[
    {
      "title": "Complete Web Development Bootcamp",
      "instructor_name": "John Smith",
      "rating": 4.8,
      "enrolled_count": 15420,
      "duration_hours": 60,
      "difficulty_level": "beginner",
      "price": 99,
      "category": "Development",
      "subcategory": "Web Development",
      "thumbnail_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
      "description": "Learn full-stack web development from scratch with hands-on projects.",
      "what_you_learn": ["HTML fundamentals", "CSS styling", "JavaScript programming"],
      "requirements": ["Basic computer skills", "Internet connection"],
      "skills_taught": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
      "skills_required": ["Basic computer literacy"]
    },
    {
      "title": "Advanced React Development",
      "instructor_name": "Sarah Johnson", 
      "rating": 4.9,
      "enrolled_count": 8350,
      "duration_hours": 40,
      "difficulty_level": "advanced",
      "price": 149,
      "category": "Development",
      "subcategory": "Frontend",
      "thumbnail_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      "description": "Master advanced React patterns and performance optimization.",
      "what_you_learn": ["Advanced React patterns", "Performance optimization", "Testing strategies"],
      "requirements": ["React basics", "JavaScript ES6+"],
      "skills_taught": ["React", "Redux", "Testing", "Performance"],
      "skills_required": ["React fundamentals", "JavaScript"]
    },
    {
      "title": "Data Science with Python",
      "instructor_name": "Dr. Michael Chen",
      "rating": 4.7, 
      "enrolled_count": 12480,
      "duration_hours": 80,
      "difficulty_level": "intermediate",
      "price": 129,
      "category": "Data Science",
      "subcategory": "Machine Learning",
      "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      "description": "Complete data science course with Python and machine learning.",
      "what_you_learn": ["Data analysis", "Machine learning", "Data visualization"],
      "requirements": ["Basic Python", "Statistics knowledge"],
      "skills_taught": ["Python", "Pandas", "Scikit-learn", "Data Viz"],
      "skills_required": ["Python basics", "Mathematics"]
    }
  ]'::jsonb;
  course_template jsonb;
BEGIN
  -- Generate a batch number (simple increment)
  SELECT COALESCE(MAX(CAST(SUBSTRING(title FROM 'Batch (\d+)') AS INTEGER)), 0) + 1 
  INTO batch_number 
  FROM public.courses 
  WHERE title ~ 'Batch \d+';
  
  -- If no batch name provided or empty, generate one
  IF p_batch_name IS NULL OR p_batch_name = '' THEN
    p_batch_name := 'Auto-Generated Batch ' || batch_number;
  END IF;
  
  -- Create courses from sample data
  FOR course_template IN SELECT value FROM jsonb_array_elements(sample_courses)
  LOOP
    EXIT WHEN course_count >= p_courses_per_batch;
    
    -- Insert course with all required fields
    INSERT INTO public.courses (
      title,
      instructor_name,
      rating,
      enrolled_count,
      duration_hours,
      difficulty_level,
      price,
      category,
      subcategory,
      thumbnail_url,
      description,
      what_you_learn,
      requirements,
      skills_taught,
      skills_required,
      is_active,
      published,
      is_free,
      created_at,
      updated_at
    ) VALUES (
      (course_template->>'title') || ' - ' || p_batch_name,
      course_template->>'instructor_name',
      (course_template->>'rating')::numeric,
      (course_template->>'enrolled_count')::integer,
      (course_template->>'duration_hours')::integer,
      course_template->>'difficulty_level',
      (course_template->>'price')::numeric,
      course_template->>'category',
      course_template->>'subcategory',
      course_template->>'thumbnail_url',
      course_template->>'description',
      ARRAY(SELECT jsonb_array_elements_text(course_template->'what_you_learn')),
      ARRAY(SELECT jsonb_array_elements_text(course_template->'requirements')),
      ARRAY(SELECT jsonb_array_elements_text(course_template->'skills_taught')),
      ARRAY(SELECT jsonb_array_elements_text(course_template->'skills_required')),
      true,
      true,
      (course_template->>'price')::numeric = 0,
      now(),
      now()
    )
    RETURNING id INTO course_id;
    
    -- Add to results
    results := results || jsonb_build_object(
      'course_id', course_id,
      'title', (course_template->>'title') || ' - ' || p_batch_name,
      'status', 'created'
    );
    
    course_count := course_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'courses_created', course_count,
    'batch_name', p_batch_name,
    'batch_number', batch_number,
    'results', results
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'courses_created', course_count,
    'batch_name', COALESCE(p_batch_name, 'Unknown'),
    'batch_number', batch_number
  );
END;
$function$;