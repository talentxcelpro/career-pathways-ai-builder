import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface DbCourse {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_hours: number;
  instructor_name: string;
  rating: number;
  price: number;
  is_free: boolean;
  skills_taught: string[];
  learning_outcomes: string[];
  curriculum: any;
}

const SAMPLE_COURSES: DbCourse[] = [
  {
    title: "Complete React.js Bootcamp",
    description: "Master React from basics to advanced concepts including hooks, context, and state management.",
    category: "Web Development",
    difficulty_level: "intermediate",
    duration_hours: 20,
    instructor_name: "Sarah Johnson",
    rating: 4.8,
    price: 899,
    is_free: false,
    skills_taught: ["React", "JavaScript", "JSX", "Hooks", "State Management"],
    learning_outcomes: ["Build dynamic web applications", "Master React hooks", "Implement state management"],
    curriculum: {
      modules: [
        { title: "React Fundamentals", duration: 300 },
        { title: "Advanced Hooks", duration: 400 },
        { title: "State Management", duration: 500 }
      ]
    }
  },
  {
    title: "Python for Data Science",
    description: "Learn Python programming specifically for data analysis and machine learning applications.",
    category: "Data Science",
    difficulty_level: "beginner",
    duration_hours: 15,
    instructor_name: "Dr. Michael Chen",
    rating: 4.7,
    price: 749,
    is_free: false,
    skills_taught: ["Python", "Pandas", "NumPy", "Matplotlib", "Data Analysis"],
    learning_outcomes: ["Analyze data with Python", "Create visualizations", "Build ML models"],
    curriculum: {
      modules: [
        { title: "Python Basics", duration: 200 },
        { title: "Data Manipulation", duration: 350 },
        { title: "Machine Learning", duration: 350 }
      ]
    }
  },
  {
    title: "Digital Marketing Fundamentals",
    description: "Comprehensive guide to modern digital marketing strategies and tools.",
    category: "Marketing",
    difficulty_level: "beginner",
    duration_hours: 10,
    instructor_name: "Emma Rodriguez",
    rating: 4.6,
    price: 0,
    is_free: true,
    skills_taught: ["SEO", "Social Media Marketing", "Content Marketing", "Google Ads"],
    learning_outcomes: ["Create marketing campaigns", "Optimize for search engines", "Analyze marketing metrics"],
    curriculum: {
      modules: [
        { title: "Marketing Strategy", duration: 200 },
        { title: "SEO & Content", duration: 200 },
        { title: "Paid Advertising", duration: 200 }
      ]
    }
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting simplified course population...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Check existing courses
    const existingTitles = SAMPLE_COURSES.map(c => c.title);
    const { data: existingCourses } = await supabaseClient
      .from('courses')
      .select('title')
      .in('title', existingTitles);
    
    const existingTitleSet = new Set(existingCourses?.map((c: any) => c.title) || []);
    console.log(`📋 Found ${existingTitleSet.size} existing courses`);

    // Filter out existing courses
    const newCourses = SAMPLE_COURSES.filter(course => !existingTitleSet.has(course.title));
    console.log(`➕ Will create ${newCourses.length} new courses`);

    if (newCourses.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "All courses already exist",
          details: {
            total_processed: SAMPLE_COURSES.length,
            successful: 0,
            errors: 0,
            skipped: SAMPLE_COURSES.length,
            error_details: []
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    // Insert new courses one by one with detailed logging
    for (const course of newCourses) {
      try {
        console.log(`📝 Inserting: "${course.title}"`);
        
        const { error: insertError } = await supabaseClient
          .from('courses')
          .insert([course]);
        
        if (insertError) {
          console.error(`❌ Error inserting "${course.title}":`, insertError);
          errors.push(`${course.title}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Created: "${course.title}"`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`💥 Exception inserting "${course.title}":`, err);
        errors.push(`${course.title}: ${err.message}`);
        errorCount++;
      }
    }

    const response = {
      success: errorCount === 0,
      message: `Successfully created ${successCount} courses`,
      details: {
        total_processed: newCourses.length,
        successful: successCount,
        errors: errorCount,
        error_details: errors
      }
    };

    console.log('✅ Course population completed:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error: any) {
    console.error('💥 Mass course population failed:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      message: 'Failed to populate courses'
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});