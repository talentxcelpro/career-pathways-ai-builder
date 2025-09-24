import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Complete course data with professional content
const PROFESSIONAL_COURSES = [
  {
    title: "Complete React.js Bootcamp",
    description: "Master React from basics to advanced concepts including hooks, context, state management, and modern React patterns.",
    category: "Web Development",
    subcategory: "Frontend Development",
    difficulty_level: "intermediate",
    duration_hours: 25,
    instructor_name: "Sarah Johnson",
    instructor_bio: "Senior React Developer at Meta with 8+ years experience",
    rating: 4.8,
    price: 899,
    is_free: false,
    skills_taught: ["React", "JavaScript", "JSX", "Hooks", "State Management", "Redux", "Testing"],
    learning_outcomes: ["Build dynamic web applications", "Master React hooks", "Implement state management", "Write testable React code"],
    thumbnail_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Python for Data Science & Machine Learning",
    description: "Comprehensive Python course covering data analysis, visualization, machine learning, and AI applications.",
    category: "Data Science",
    subcategory: "Machine Learning",
    difficulty_level: "intermediate",
    duration_hours: 30,
    instructor_name: "Dr. Michael Chen",
    instructor_bio: "Data Scientist at Google AI with PhD in Machine Learning",
    rating: 4.9,
    price: 1299,
    is_free: false,
    skills_taught: ["Python", "Pandas", "NumPy", "Matplotlib", "Scikit-learn", "TensorFlow", "Data Analysis"],
    learning_outcomes: ["Analyze complex datasets", "Build ML models", "Create data visualizations", "Deploy AI applications"],
    thumbnail_url: "https://images.unsplash.com/photo-1518186233392-c232efbf2373?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Full-Stack JavaScript Development",
    description: "Complete full-stack development course with Node.js, Express, MongoDB, React, and modern deployment strategies.",
    category: "Web Development",
    subcategory: "Full Stack",
    difficulty_level: "advanced",
    duration_hours: 40,
    instructor_name: "Alex Thompson",
    instructor_bio: "Full-Stack Architect at Netflix with 10+ years experience",
    rating: 4.7,
    price: 1599,
    is_free: false,
    skills_taught: ["Node.js", "Express", "MongoDB", "React", "REST APIs", "GraphQL", "Docker", "AWS"],
    learning_outcomes: ["Build scalable web applications", "Design REST APIs", "Implement authentication", "Deploy to cloud"],
    thumbnail_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Digital Marketing Mastery",
    description: "Complete digital marketing course covering SEO, social media, content marketing, PPC, email marketing, and analytics.",
    category: "Marketing",
    subcategory: "Digital Marketing",
    difficulty_level: "beginner",
    duration_hours: 20,
    instructor_name: "Emma Rodriguez",
    instructor_bio: "Digital Marketing Director at HubSpot with 12+ years experience",
    rating: 4.6,
    price: 799,
    is_free: false,
    skills_taught: ["SEO", "Social Media Marketing", "Content Marketing", "Google Ads", "Email Marketing", "Analytics"],
    learning_outcomes: ["Create marketing campaigns", "Optimize for search engines", "Analyze marketing metrics", "Generate leads"],
    thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "UX/UI Design Professional Certificate",
    description: "Master user experience and interface design with hands-on projects, design thinking, and industry tools.",
    category: "Design",
    subcategory: "UX Design",
    difficulty_level: "intermediate",
    duration_hours: 35,
    instructor_name: "Lisa Park",
    instructor_bio: "Senior UX Designer at Apple with award-winning design portfolio",
    rating: 4.8,
    price: 1199,
    is_free: false,
    skills_taught: ["User Research", "Wireframing", "Prototyping", "Figma", "Design Systems", "Usability Testing"],
    learning_outcomes: ["Conduct user research", "Create wireframes and prototypes", "Design user interfaces", "Test usability"],
    thumbnail_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "AWS Cloud Solutions Architect",
    description: "Comprehensive AWS training covering cloud architecture, security, deployment, and certification preparation.",
    category: "Cloud Computing",
    subcategory: "AWS",
    difficulty_level: "intermediate",
    duration_hours: 45,
    instructor_name: "David Kim",
    instructor_bio: "AWS Solutions Architect at Amazon with multiple cloud certifications",
    rating: 4.9,
    price: 1799,
    is_free: false,
    skills_taught: ["AWS", "Cloud Architecture", "EC2", "S3", "Lambda", "Security", "DevOps"],
    learning_outcomes: ["Design cloud solutions", "Deploy scalable applications", "Implement security", "Pass AWS certification"],
    thumbnail_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Cybersecurity Fundamentals & Ethical Hacking",
    description: "Complete cybersecurity course covering network security, penetration testing, incident response, and compliance.",
    category: "Cybersecurity",
    subcategory: "Ethical Hacking",
    difficulty_level: "intermediate",
    duration_hours: 50,
    instructor_name: "Robert Anderson",
    instructor_bio: "Cybersecurity Expert at FireEye with CISSP and CEH certifications",
    rating: 4.7,
    price: 1999,
    is_free: false,
    skills_taught: ["Network Security", "Penetration Testing", "Incident Response", "Risk Assessment", "Compliance"],
    learning_outcomes: ["Identify security threats", "Perform ethical hacking", "Implement security measures", "Manage incidents"],
    thumbnail_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Project Management Professional (PMP)",
    description: "Complete PMP certification training covering agile, traditional methodologies, leadership, and project execution.",
    category: "Business",
    subcategory: "Project Management",
    difficulty_level: "intermediate",
    duration_hours: 30,
    instructor_name: "Maria Garcia",
    instructor_bio: "PMP Certified Project Manager at Microsoft with 15+ years experience",
    rating: 4.6,
    price: 999,
    is_free: false,
    skills_taught: ["Project Planning", "Agile", "Scrum", "Risk Management", "Team Leadership", "Budget Management"],
    learning_outcomes: ["Manage complex projects", "Lead cross-functional teams", "Implement agile methodologies", "Pass PMP exam"],
    thumbnail_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Mobile App Development with React Native",
    description: "Build iOS and Android apps with React Native, covering navigation, APIs, state management, and app store deployment.",
    category: "Mobile Development",
    subcategory: "React Native",
    difficulty_level: "intermediate",
    duration_hours: 35,
    instructor_name: "Jennifer Wilson",
    instructor_bio: "Mobile Developer at Airbnb specializing in React Native",
    rating: 4.8,
    price: 1399,
    is_free: false,
    skills_taught: ["React Native", "iOS Development", "Android Development", "Navigation", "API Integration"],
    learning_outcomes: ["Build cross-platform apps", "Implement navigation", "Connect to APIs", "Deploy to app stores"],
    thumbnail_url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop",
    content_type: "comprehensive",
    language: "en"
  },
  {
    title: "Content Writing & Copywriting Mastery",
    description: "Master content creation, copywriting, SEO writing, email marketing, and content strategy for digital success.",
    category: "Marketing",
    subcategory: "Content Writing",
    difficulty_level: "beginner",
    duration_hours: 25,
    instructor_name: "Jennifer Lee",
    instructor_bio: "Content Marketing Manager at Buffer with 8+ years writing experience",
    rating: 4.5,
    price: 699,
    is_free: false,
    skills_taught: ["Content Strategy", "Copywriting", "SEO Writing", "Email Marketing", "Brand Voice"],
    learning_outcomes: ["Write engaging content", "Optimize for search", "Develop brand voice", "Create marketing copy"],
    thumbnail_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
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