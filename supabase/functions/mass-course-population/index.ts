import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Course {
  title: string;
  description: string;
  category: string;
  level: string;
  duration_minutes: number;
  instructor_name: string;
  rating: number;
  price: number;
  is_free: boolean;
  skills_covered: string[];
  learning_objectives: string[];
  course_content: any;
}

const COURSE_DATA: Course[] = [
  {
    title: "Complete React.js Bootcamp",
    description: "Master React from basics to advanced concepts including hooks, context, and state management.",
    category: "Web Development",
    level: "intermediate",
    duration_minutes: 1200,
    instructor_name: "Sarah Johnson",
    rating: 4.8,
    price: 899,
    is_free: false,
    skills_covered: ["React", "JavaScript", "JSX", "Hooks", "State Management"],
    learning_objectives: ["Build dynamic web applications", "Master React hooks", "Implement state management"],
    course_content: {
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
    level: "beginner",
    duration_minutes: 900,
    instructor_name: "Dr. Michael Chen",
    rating: 4.7,
    price: 749,
    is_free: false,
    skills_covered: ["Python", "Pandas", "NumPy", "Matplotlib", "Data Analysis"],
    learning_objectives: ["Analyze data with Python", "Create visualizations", "Build ML models"],
    course_content: {
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
    level: "beginner",
    duration_minutes: 600,
    instructor_name: "Emma Rodriguez",
    rating: 4.6,
    price: 0,
    is_free: true,
    skills_covered: ["SEO", "Social Media Marketing", "Content Marketing", "Google Ads"],
    learning_objectives: ["Create marketing campaigns", "Optimize for search engines", "Analyze marketing metrics"],
    course_content: {
      modules: [
        { title: "Marketing Strategy", duration: 200 },
        { title: "SEO & Content", duration: 200 },
        { title: "Paid Advertising", duration: 200 }
      ]
    }
  },
  {
    title: "Full-Stack JavaScript Development",
    description: "End-to-end web development with Node.js, Express, and modern frontend frameworks.",
    category: "Web Development",
    level: "advanced",
    duration_minutes: 1500,
    instructor_name: "Alex Thompson",
    rating: 4.9,
    price: 1299,
    is_free: false,
    skills_covered: ["Node.js", "Express", "MongoDB", "React", "REST APIs"],
    learning_objectives: ["Build full-stack applications", "Design REST APIs", "Deploy applications"],
    course_content: {
      modules: [
        { title: "Backend Development", duration: 600 },
        { title: "Database Design", duration: 300 },
        { title: "Frontend Integration", duration: 600 }
      ]
    }
  },
  {
    title: "UX/UI Design Masterclass",
    description: "Learn user experience design principles and create stunning user interfaces.",
    category: "Design",
    level: "intermediate",
    duration_minutes: 800,
    instructor_name: "Lisa Park",
    rating: 4.8,
    price: 649,
    is_free: false,
    skills_covered: ["User Research", "Wireframing", "Prototyping", "Figma", "Design Systems"],
    learning_objectives: ["Conduct user research", "Create wireframes and prototypes", "Design user interfaces"],
    course_content: {
      modules: [
        { title: "UX Research", duration: 300 },
        { title: "Design Process", duration: 250 },
        { title: "UI Design", duration: 250 }
      ]
    }
  },
  {
    title: "Machine Learning with TensorFlow",
    description: "Deep dive into machine learning algorithms and neural networks using TensorFlow.",
    category: "Data Science",
    level: "advanced",
    duration_minutes: 1100,
    instructor_name: "Dr. James Wilson",
    rating: 4.7,
    price: 999,
    is_free: false,
    skills_covered: ["TensorFlow", "Neural Networks", "Deep Learning", "Python", "AI"],
    learning_objectives: ["Build neural networks", "Train ML models", "Deploy AI applications"],
    course_content: {
      modules: [
        { title: "ML Fundamentals", duration: 400 },
        { title: "Deep Learning", duration: 400 },
        { title: "Model Deployment", duration: 300 }
      ]
    }
  },
  {
    title: "Cybersecurity Essentials",
    description: "Essential cybersecurity concepts and practices for modern organizations.",
    category: "Technology",
    level: "beginner",
    duration_minutes: 700,
    instructor_name: "Robert Anderson",
    rating: 4.5,
    price: 0,
    is_free: true,
    skills_covered: ["Network Security", "Encryption", "Risk Assessment", "Security Protocols"],
    learning_objectives: ["Identify security threats", "Implement security measures", "Conduct risk assessments"],
    course_content: {
      modules: [
        { title: "Security Fundamentals", duration: 250 },
        { title: "Network Security", duration: 250 },
        { title: "Threat Management", duration: 200 }
      ]
    }
  },
  {
    title: "Project Management Professional",
    description: "Comprehensive project management training covering agile and traditional methodologies.",
    category: "Business",
    level: "intermediate",
    duration_minutes: 950,
    instructor_name: "Maria Garcia",
    rating: 4.6,
    price: 799,
    is_free: false,
    skills_covered: ["Project Planning", "Agile", "Scrum", "Risk Management", "Team Leadership"],
    learning_objectives: ["Manage complex projects", "Lead cross-functional teams", "Implement agile methodologies"],
    course_content: {
      modules: [
        { title: "Project Fundamentals", duration: 300 },
        { title: "Agile Methodologies", duration: 350 },
        { title: "Leadership Skills", duration: 300 }
      ]
    }
  },
  {
    title: "Cloud Computing with AWS",
    description: "Master Amazon Web Services and cloud infrastructure deployment.",
    category: "Technology",
    level: "intermediate",
    duration_minutes: 1000,
    instructor_name: "David Kim",
    rating: 4.8,
    price: 899,
    is_free: false,
    skills_covered: ["AWS", "Cloud Architecture", "EC2", "S3", "DevOps"],
    learning_objectives: ["Design cloud solutions", "Deploy scalable applications", "Optimize cloud costs"],
    course_content: {
      modules: [
        { title: "AWS Fundamentals", duration: 350 },
        { title: "Cloud Architecture", duration: 350 },
        { title: "Advanced Services", duration: 300 }
      ]
    }
  },
  {
    title: "Content Writing & Copywriting",
    description: "Learn to create compelling content that converts and engages audiences.",
    category: "Marketing",
    level: "beginner",
    duration_minutes: 500,
    instructor_name: "Jennifer Lee",
    rating: 4.4,
    price: 0,
    is_free: true,
    skills_covered: ["Content Strategy", "Copywriting", "SEO Writing", "Brand Voice"],
    learning_objectives: ["Write engaging content", "Optimize for search", "Develop brand voice"],
    course_content: {
      modules: [
        { title: "Writing Fundamentals", duration: 200 },
        { title: "SEO Content", duration: 150 },
        { title: "Conversion Copy", duration: 150 }
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
    console.log('Starting mass course population...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process courses in batches
    const batchSize = 5;
    for (let i = 0; i < COURSE_DATA.length; i += batchSize) {
      const batch = COURSE_DATA.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} courses...`);

      for (const courseData of batch) {
        try {
          // Check if course already exists
          const { data: existingCourse } = await supabaseClient
            .from('courses')
            .select('id')
            .eq('title', courseData.title)
            .single();

          if (existingCourse) {
            console.log(`Course "${courseData.title}" already exists, skipping...`);
            continue;
          }

          // Insert new course
          const { error: insertError } = await supabaseClient
            .from('courses')
            .insert([courseData]);

          if (insertError) {
            console.error(`Error inserting course "${courseData.title}":`, insertError);
            errors.push(`${courseData.title}: ${insertError.message}`);
            errorCount++;
          } else {
            console.log(`Successfully created course: "${courseData.title}"`);
            successCount++;
          }
        } catch (error) {
          console.error(`Exception processing course "${courseData.title}":`, error);
          errors.push(`${courseData.title}: ${error.message}`);
          errorCount++;
        }
      }

      // Small delay between batches to avoid overwhelming the database
      if (i + batchSize < COURSE_DATA.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const response = {
      success: errorCount === 0,
      message: `Successfully created ${successCount} courses in batch New!`,
      details: {
        total_processed: COURSE_DATA.length,
        successful: successCount,
        errors: errorCount,
        error_details: errors
      }
    };

    console.log('Course population completed:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Mass course population failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to populate courses'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});