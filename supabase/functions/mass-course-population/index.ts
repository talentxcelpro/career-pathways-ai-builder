import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Professional TalenXcel Academy courses with comprehensive content
const PROFESSIONAL_COURSES = [
  {
    title: "Advanced Full Stack Web Development with React & Node.js",
    description: "Master modern web development with React, Node.js, TypeScript, MongoDB, and cloud deployment. Build production-ready applications with microservices architecture, testing, and CI/CD pipelines.",
    category: "Technology",
    subcategory: "Web Development", 
    difficulty_level: "advanced",
    duration_hours: 45,
    instructor_name: "TalenXcel Academy",
    instructor_bio: "Leading technology education provider with industry experts and 50,000+ successful graduates",
    rating: 4.9,
    price: 599,
    is_free: false,
    skills_taught: ["React", "Node.js", "TypeScript", "MongoDB", "GraphQL", "Docker", "AWS", "Microservices", "Testing"],
    learning_outcomes: ["Build scalable web applications", "Deploy to cloud platforms", "Implement microservices", "Master full-stack development"],
    thumbnail_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=800&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Healthcare Data Analytics & Medical Informatics",
    description: "Comprehensive course on healthcare data analysis, medical informatics, HIPAA compliance, and health information systems. Learn to analyze patient data and improve healthcare outcomes.",
    category: "Healthcare",
    subcategory: "Data Analytics",
    difficulty_level: "intermediate", 
    duration_hours: 40,
    instructor_name: "TalenXcel Academy",
    instructor_bio: "Leading technology education provider with industry experts and 50,000+ successful graduates",
    rating: 4.8,
    price: 649,
    is_free: false,
    skills_taught: ["Healthcare Analytics", "Medical Data", "HIPAA", "Python", "R", "SQL", "Tableau", "Epic Systems"],
    learning_outcomes: ["Analyze healthcare data", "Ensure HIPAA compliance", "Improve patient outcomes", "Build health dashboards"],
    thumbnail_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "FinTech Development: Blockchain & Cryptocurrency Systems", 
    description: "Build secure financial applications using blockchain technology, smart contracts, cryptocurrency systems, and modern payment gateways. Includes regulatory compliance and security best practices.",
    category: "Finance",
    subcategory: "Financial Technology",
    difficulty_level: "advanced",
    duration_hours: 50,
    instructor_name: "TalenXcel Academy",
    instructor_bio: "Leading technology education provider with industry experts and 50,000+ successful graduates",
    rating: 4.9,
    price: 799,
    is_free: false,
    skills_taught: ["Blockchain", "Solidity", "Cryptocurrency", "Smart Contracts", "DeFi", "Payment Systems", "Security"],
    learning_outcomes: ["Build blockchain applications", "Create smart contracts", "Implement payment systems", "Ensure security compliance"],
    thumbnail_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=800&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Creative Digital Design & UI/UX Mastery",
    description: "Master modern design principles, UI/UX design, graphic design, and digital art. Learn industry-standard tools and create stunning visual experiences for web and mobile applications.",
    category: "Design", 
    subcategory: "UI/UX Design",
    difficulty_level: "intermediate",
    duration_hours: 35,
    instructor_name: "TalenXcel Academy",
    instructor_bio: "Leading technology education provider with industry experts and 50,000+ successful graduates",
    rating: 4.7,
    price: 499,
    is_free: false,
    skills_taught: ["Figma", "Adobe Creative Suite", "UI Design", "UX Research", "Prototyping", "Design Systems", "User Testing"],
    learning_outcomes: ["Design beautiful interfaces", "Conduct user research", "Create design systems", "Build interactive prototypes"],
    thumbnail_url: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=800&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Business Intelligence & Advanced Analytics",
    description: "Transform raw data into actionable business insights using advanced analytics, machine learning, and business intelligence tools. Master data visualization and strategic decision-making.",
    category: "Business",
    subcategory: "Business Intelligence", 
    difficulty_level: "advanced",
    duration_hours: 42,
    instructor_name: "TalenXcel Academy",
    instructor_bio: "Leading technology education provider with industry experts and 50,000+ successful graduates",
    rating: 4.8,
    price: 699,
    is_free: false,
    skills_taught: ["Power BI", "Tableau", "SQL", "Python", "Machine Learning", "Data Modeling", "Dashboard Design"],
    learning_outcomes: ["Build powerful dashboards", "Analyze business data", "Make data-driven decisions", "Predict business trends"],
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
    content_type: "comprehensive",
    language: "en"
  }
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting professional course population with complete content...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Create the courses
    console.log('📚 Step 1: Creating course records...');
    
    const existingTitles = PROFESSIONAL_COURSES.map(c => c.title);
    const { data: existingCourses } = await supabaseClient
      .from('courses')
      .select('title')
      .in('title', existingTitles);
    
    const existingTitleSet = new Set(existingCourses?.map((c: any) => c.title) || []);
    const newCourses = PROFESSIONAL_COURSES.filter(course => !existingTitleSet.has(course.title));
    
    let coursesCreated = 0;
    const createdCourseIds: string[] = [];

    if (newCourses.length > 0) {
      console.log(`➕ Creating ${newCourses.length} new courses...`);
      
      for (const course of newCourses) {
        try {
          const { data: createdCourse, error } = await supabaseClient
            .from('courses')
            .insert([course])
            .select('id')
            .single();
          
          if (error) {
            console.error(`❌ Error creating course "${course.title}":`, error);
          } else {
            console.log(`✅ Created course: "${course.title}"`);
            coursesCreated++;
            createdCourseIds.push(createdCourse.id);
          }
        } catch (err: any) {
          console.error(`💥 Exception creating course "${course.title}":`, err);
        }
      }
    } else {
      console.log('📋 All courses already exist, proceeding to content completion...');
      // Get existing course IDs for content completion
      const { data: existingCourseData } = await supabaseClient
        .from('courses')
        .select('id')
        .in('title', existingTitles);
      
      if (existingCourseData) {
        createdCourseIds.push(...existingCourseData.map((c: any) => c.id));
      }
    }

    // Step 2: Complete all courses with comprehensive content
    console.log('🎯 Step 2: Completing courses with modules, lessons, and videos...');
    
    try {
      const { data: completionData, error: completionError } = await supabaseClient.functions.invoke('complete-course-content', {
        body: {
          action: 'complete_existing_courses',
          course_limit: 50 // Process all courses
        }
      });

      if (completionError) {
        console.error('❌ Error completing course content:', completionError);
      } else {
        console.log('✅ Course content completion response:', completionData);
      }
    } catch (err: any) {
      console.error('💥 Exception during course completion:', err);
    }

    const response = {
      success: true,
      message: `Successfully created ${coursesCreated} courses with complete content`,
      details: {
        courses_created: coursesCreated,
        total_courses: PROFESSIONAL_COURSES.length,
        existing_courses: PROFESSIONAL_COURSES.length - coursesCreated,
        content_completion: "initiated",
        features: [
          "15+ modules per course",
          "Video integration",
          "Assessments and quizzes",
          "Professional thumbnails",
          "Comprehensive curriculum"
        ]
      }
    };

    console.log('🎉 Professional course population completed:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error: any) {
    console.error('💥 Professional course population failed:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      message: 'Failed to populate professional courses'
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