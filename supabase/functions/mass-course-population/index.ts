import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Timeout configuration
const FUNCTION_TIMEOUT = 45000; // 45 seconds
const BATCH_SIZE = 3; // Smaller batches for stability
const BATCH_DELAY = 50; // Minimal delay between batches

interface CourseData {
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

const COURSE_DATA: CourseData[] = [
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

// Create a timeout wrapper for the main operation
async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );
  return Promise.race([operation, timeoutPromise]);
}

// Function to convert CourseData to DbCourse format
function convertToDbFormat(courseData: CourseData): DbCourse {
  return {
    title: courseData.title,
    description: courseData.description,
    category: courseData.category,
    difficulty_level: courseData.level, // Map level to difficulty_level
    duration_hours: Math.round(courseData.duration_minutes / 60), // Convert minutes to hours
    instructor_name: courseData.instructor_name,
    rating: courseData.rating,
    price: courseData.price,
    is_free: courseData.is_free,
    skills_taught: courseData.skills_covered, // Map skills_covered to skills_taught
    learning_outcomes: courseData.learning_objectives, // Map learning_objectives to learning_outcomes
    curriculum: courseData.course_content // Map course_content to curriculum
  };
}

// Optimized batch processing function
async function processBatchOptimized(
  supabaseClient: any,
  batch: CourseData[],
  batchNumber: number
): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
  console.log(`🔄 Processing batch ${batchNumber} (${batch.length} courses)`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];
  
  try {
    // Get all existing course titles in one query
    const existingTitles = batch.map(c => c.title);
    const { data: existingCourses } = await supabaseClient
      .from('courses')
      .select('title')
      .in('title', existingTitles);
    
    const existingTitleSet = new Set(existingCourses?.map((c: any) => c.title) || []);
    
    // Filter out existing courses and convert to DB format
    const newCourses = batch
      .filter(course => !existingTitleSet.has(course.title))
      .map(convertToDbFormat);
    
    if (newCourses.length === 0) {
      console.log(`📋 All courses in batch ${batchNumber} already exist, skipping...`);
      return { successCount: 0, errorCount: 0, errors: [] };
    }
    
    // Insert all new courses in a single batch operation
    const { data: insertedCourses, error: batchInsertError } = await supabaseClient
      .from('courses')
      .insert(newCourses)
      .select('title');
    
    if (batchInsertError) {
      console.error(`❌ Batch insert error for batch ${batchNumber}:`, batchInsertError);
      
      // Fallback: try inserting courses individually
      console.log(`🔄 Falling back to individual inserts for batch ${batchNumber}`);
      
      // For individual inserts, we need to convert back to original format to get titles
      const originalNewCourses = batch.filter(course => !existingTitleSet.has(course.title));
      
      for (let i = 0; i < newCourses.length; i++) {
        const dbCourse = newCourses[i];
        const originalCourse = originalNewCourses[i];
        
        try {
          const { error: individualError } = await supabaseClient
            .from('courses')
            .insert([dbCourse]);
          
          if (individualError) {
            console.error(`❌ Error inserting "${originalCourse.title}":`, individualError);
            errors.push(`${originalCourse.title}: ${individualError.message}`);
            errorCount++;
          } else {
            console.log(`✅ Created: "${originalCourse.title}"`);
            successCount++;
          }
        } catch (err: any) {
          console.error(`💥 Exception inserting "${originalCourse.title}":`, err);
          errors.push(`${originalCourse.title}: ${err.message}`);
          errorCount++;
        }
      }
    } else {
      // Batch insert successful
      successCount = insertedCourses?.length || newCourses.length;
      console.log(`✅ Batch ${batchNumber} completed: ${successCount} courses created`);
    }
    
    // Log skipped courses
    const skippedCount = batch.length - newCourses.length;
    if (skippedCount > 0) {
      console.log(`📋 Skipped ${skippedCount} existing courses in batch ${batchNumber}`);
    }
    
  } catch (err: any) {
    console.error(`💥 Batch ${batchNumber} processing failed:`, err);
    errors.push(`Batch ${batchNumber}: ${err.message}`);
    errorCount = batch.length;
  }
  
  return { successCount, errorCount, errors };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting optimized mass course population...');
    console.log(`📊 Configuration: ${COURSE_DATA.length} total courses, batch size: ${BATCH_SIZE}`);

    const operationPromise = (async () => {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      let totalSuccessCount = 0;
      let totalErrorCount = 0;
      const allErrors: string[] = [];
      
      const startTime = Date.now();

      // Process courses in optimized batches
      const totalBatches = Math.ceil(COURSE_DATA.length / BATCH_SIZE);
      
      for (let i = 0; i < COURSE_DATA.length; i += BATCH_SIZE) {
        const batch = COURSE_DATA.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        
        console.log(`🔄 Processing batch ${batchNumber}/${totalBatches}...`);
        
        const batchResult = await processBatchOptimized(supabaseClient, batch, batchNumber);
        
        totalSuccessCount += batchResult.successCount;
        totalErrorCount += batchResult.errorCount;
        allErrors.push(...batchResult.errors);
        
        // Progress logging
        const progress = ((i + BATCH_SIZE) / COURSE_DATA.length * 100).toFixed(1);
        console.log(`📈 Progress: ${progress}% (${totalSuccessCount} created, ${totalErrorCount} errors)`);
        
        // Small delay between batches for stability
        if (i + BATCH_SIZE < COURSE_DATA.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`⏱️ Total processing time: ${processingTime}ms`);

      const response = {
        success: totalErrorCount === 0,
        message: `Successfully created ${totalSuccessCount} courses`,
        details: {
          total_processed: COURSE_DATA.length,
          successful: totalSuccessCount,
          errors: totalErrorCount,
          processing_time_ms: processingTime,
          batches_processed: totalBatches,
          error_details: allErrors.slice(0, 10) // Limit error details to prevent large responses
        }
      };

      console.log('✅ Course population completed:', response);
      return response;
    })();

    // Apply timeout wrapper
    const result = await withTimeout(operationPromise, FUNCTION_TIMEOUT);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error: any) {
    console.error('💥 Mass course population failed:', error);
    
    const isTimeout = error.message.includes('timed out');
    const errorResponse = {
      success: false,
      error: error.message,
      message: isTimeout ? 'Operation timed out - please try again' : 'Failed to populate courses',
      timeout: isTimeout
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isTimeout ? 408 : 500,
      },
    );
  }
});