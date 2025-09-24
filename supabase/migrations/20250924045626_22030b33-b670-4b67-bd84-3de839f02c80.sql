-- Enhanced course batch creation with complete courseware structure
CREATE OR REPLACE FUNCTION create_course_batch(
  p_batch_name TEXT DEFAULT 'AI Generated Batch',
  p_courses_per_batch INTEGER DEFAULT 5
) RETURNS JSONB AS $$
DECLARE
  course_templates JSONB;
  template JSONB;
  new_course_id UUID;
  module_data JSONB;
  lesson_data JSONB;
  courses_created INTEGER := 0;
  batch_result JSONB;
BEGIN
  -- Define comprehensive course templates with modules and lessons
  course_templates := '[
    {
      "title": "Full Stack Web Development with React & Node.js",
      "description": "Master modern web development from frontend to backend",
      "instructor_name": "TalentXcel Academy",
      "difficulty_level": "intermediate",
      "duration_hours": 40,
      "price": 299.99,
      "thumbnail_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
      "category": "Web Development",
      "subcategory": "Full Stack",
      "learning_outcomes": ["Build complete web applications", "Master React hooks and state management", "Create REST APIs with Node.js", "Deploy applications to production"],
      "modules": [
        {
          "title": "Frontend Fundamentals",
          "description": "Learn HTML, CSS, and JavaScript basics",
          "order": 1,
          "duration": 10,
          "lessons": [
            {
              "title": "HTML5 Structure and Semantics",
              "content": "Learn modern HTML5 elements and semantic markup for better accessibility and SEO.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=UB1O30fR-EE",
              "duration": 25,
              "order": 1,
              "is_free": true
            },
            {
              "title": "CSS Grid and Flexbox",
              "content": "Master modern CSS layout techniques with Grid and Flexbox for responsive designs.",
              "type": "video", 
              "video_url": "https://www.youtube.com/watch?v=jV8B24rSN5o",
              "duration": 30,
              "order": 2,
              "is_free": false
            },
            {
              "title": "JavaScript ES6+ Features",
              "content": "Explore modern JavaScript features including arrow functions, destructuring, and async/await.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=NCwa_xi0Uuc",
              "duration": 35,
              "order": 3,
              "is_free": false
            }
          ]
        },
        {
          "title": "React Development",
          "description": "Build dynamic user interfaces with React",
          "order": 2,
          "duration": 15,
          "lessons": [
            {
              "title": "React Components and JSX",
              "content": "Understanding React components, JSX syntax, and component composition patterns.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
              "duration": 40,
              "order": 1,
              "is_free": false
            },
            {
              "title": "State Management with Hooks",
              "content": "Master useState, useEffect, and other React hooks for state management.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=O6P86uwfdR0",
              "duration": 45,
              "order": 2,
              "is_free": false
            }
          ]
        },
        {
          "title": "Backend with Node.js",
          "description": "Create robust server-side applications",
          "order": 3,
          "duration": 15,
          "lessons": [
            {
              "title": "Node.js and Express Setup",
              "content": "Setting up Node.js development environment and creating Express servers.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=L72fhGm1tfE",
              "duration": 30,
              "order": 1,
              "is_free": false
            },
            {
              "title": "RESTful API Development",
              "content": "Design and implement RESTful APIs with proper HTTP methods and status codes.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=pKd0Rpw7O48",
              "duration": 50,
              "order": 2,
              "is_free": false
            }
          ]
        }
      ]
    },
    {
      "title": "Data Science & Machine Learning with Python",
      "description": "Complete data science journey from basics to advanced ML",
      "instructor_name": "TalentXcel Academy",
      "difficulty_level": "beginner",
      "duration_hours": 35,
      "price": 249.99,
      "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
      "category": "Data Science",
      "subcategory": "Machine Learning",
      "learning_outcomes": ["Master Python for data analysis", "Build machine learning models", "Visualize data effectively", "Deploy ML models"],
      "modules": [
        {
          "title": "Python for Data Science",
          "description": "Learn Python libraries for data manipulation",
          "order": 1,
          "duration": 12,
          "lessons": [
            {
              "title": "NumPy for Numerical Computing",
              "content": "Master NumPy arrays, operations, and mathematical functions for data science.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=QUT1VHiLmmI",
              "duration": 35,
              "order": 1,
              "is_free": true
            },
            {
              "title": "Pandas for Data Manipulation",
              "content": "Learn data cleaning, transformation, and analysis with Pandas DataFrames.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=vmEHCJofslg",
              "duration": 40,
              "order": 2,
              "is_free": false
            }
          ]
        },
        {
          "title": "Data Visualization",
          "description": "Create compelling data visualizations",
          "order": 2,
          "duration": 10,
          "lessons": [
            {
              "title": "Matplotlib Fundamentals",
              "content": "Create static plots and charts with Matplotlib for data visualization.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=3Xc3CA655Y4",
              "duration": 30,
              "order": 1,
              "is_free": false
            },
            {
              "title": "Interactive Plots with Plotly",
              "content": "Build interactive and dynamic visualizations using Plotly.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=GGL6U0k8WYA",
              "duration": 25,
              "order": 2,
              "is_free": false
            }
          ]
        },
        {
          "title": "Machine Learning",
          "description": "Build and deploy ML models",
          "order": 3,
          "duration": 13,
          "lessons": [
            {
              "title": "Scikit-learn Basics",
              "content": "Introduction to machine learning with scikit-learn library.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=pqNCD_5r0IU",
              "duration": 45,
              "order": 1,
              "is_free": false
            }
          ]
        }
      ]
    },
    {
      "title": "Digital Marketing Mastery",
      "description": "Comprehensive digital marketing strategies and tools",
      "instructor_name": "TalentXcel Academy", 
      "difficulty_level": "beginner",
      "duration_hours": 25,
      "price": 199.99,
      "thumbnail_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
      "category": "Marketing",
      "subcategory": "Digital Marketing",
      "learning_outcomes": ["Create effective marketing campaigns", "Master social media marketing", "Understand SEO and SEM", "Analyze marketing metrics"],
      "modules": [
        {
          "title": "Marketing Fundamentals",
          "description": "Core marketing concepts and strategies",
          "order": 1,
          "duration": 8,
          "lessons": [
            {
              "title": "Digital Marketing Overview",
              "content": "Understanding the digital marketing landscape and key channels.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=bELvqoLzSOo",
              "duration": 20,
              "order": 1,
              "is_free": true
            },
            {
              "title": "Target Audience Research",
              "content": "How to identify and understand your target audience for effective marketing.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=QVQVuJb8ie0", 
              "duration": 25,
              "order": 2,
              "is_free": false
            }
          ]
        },
        {
          "title": "Social Media Marketing",
          "description": "Leverage social platforms for business growth",
          "order": 2,
          "duration": 10,
          "lessons": [
            {
              "title": "Facebook and Instagram Marketing",
              "content": "Create effective campaigns on Facebook and Instagram platforms.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=L4em8VgLsR4",
              "duration": 30,
              "order": 1,
              "is_free": false
            }
          ]
        },
        {
          "title": "SEO and Content Marketing",
          "description": "Optimize content for search engines",
          "order": 3,
          "duration": 7,
          "lessons": [
            {
              "title": "SEO Fundamentals",
              "content": "Learn the basics of search engine optimization and keyword research.",
              "type": "video",
              "video_url": "https://www.youtube.com/watch?v=xsVTqzratPs",
              "duration": 35,
              "order": 1,
              "is_free": false
            }
          ]
        }
      ]
    }
  ]'::JSONB;

  -- Create courses with complete hierarchy
  FOR template IN SELECT * FROM jsonb_array_elements(course_templates) LOOP
    EXIT WHEN courses_created >= p_courses_per_batch;
    
    -- Insert course
    INSERT INTO courses (
      title, description, instructor_name, difficulty_level, duration_hours,
      price, thumbnail_url, category, subcategory, learning_outcomes,
      is_active, is_free, created_at, updated_at
    ) VALUES (
      template->>'title',
      template->>'description', 
      template->>'instructor_name',
      template->>'difficulty_level',
      (template->>'duration_hours')::INTEGER,
      (template->>'price')::NUMERIC,
      template->>'thumbnail_url',
      template->>'category',
      template->>'subcategory',
      template->'learning_outcomes',
      true,
      false,
      now(),
      now()
    ) RETURNING id INTO new_course_id;

    -- Create modules and lessons
    FOR module_data IN SELECT * FROM jsonb_array_elements(template->'modules') LOOP
      DECLARE
        new_module_id UUID;
      BEGIN
        -- Insert module
        INSERT INTO course_modules (
          course_id, title, description, module_order, duration_minutes
        ) VALUES (
          new_course_id,
          module_data->>'title',
          module_data->>'description', 
          (module_data->>'order')::INTEGER,
          (module_data->>'duration')::INTEGER * 60
        ) RETURNING id INTO new_module_id;

        -- Create lessons for this module
        FOR lesson_data IN SELECT * FROM jsonb_array_elements(module_data->'lessons') LOOP
          INSERT INTO course_lessons (
            module_id, title, content, lesson_type, video_url,
            duration_minutes, lesson_order, is_free
          ) VALUES (
            new_module_id,
            lesson_data->>'title',
            lesson_data->>'content',
            lesson_data->>'type',
            lesson_data->>'video_url',
            (lesson_data->>'duration')::INTEGER,
            (lesson_data->>'order')::INTEGER,
            (lesson_data->>'is_free')::BOOLEAN
          );
        END LOOP;
      END;
    END LOOP;

    courses_created := courses_created + 1;
  END LOOP;

  -- Return result
  batch_result := jsonb_build_object(
    'success', true,
    'message', 'Course batch created successfully with complete courseware',
    'batch_name', p_batch_name,
    'courses_created', courses_created,
    'details', 'Courses created with modules, lessons, and YouTube video integration'
  );

  RETURN batch_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'batch_name', p_batch_name,
    'courses_created', courses_created
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;