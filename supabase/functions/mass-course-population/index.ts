import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Validate environment variables
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error('Missing required environment variables');
    }

    const { action = 'populate_courses', count = 2, categories = [] } = await req.json();

    if (action === 'populate_courses') {
      console.log('🚀 Starting course population...');

      // Check database connectivity
      const { data: healthCheck } = await supabaseClient
        .from('courses')
        .select('count')
        .limit(1);
      
      if (!healthCheck) {
        throw new Error('Database connection failed');
      }

      const courses = [
        {
          title: "Advanced React Development",
          description: "Master React with hooks, context, and advanced patterns",
          category: "Technology",
          difficulty_level: "advanced",
          duration_hours: 40,
          instructor_name: "Tech Expert",
          rating: 4.8,
          price: 299,
          is_free: false,
          skills_taught: ["React", "JavaScript", "TypeScript"],
          learning_outcomes: ["Build modern apps", "Master React patterns"],
          is_active: true
        },
        {
          title: "Data Science Fundamentals",
          description: "Learn data analysis, visualization, and machine learning",
          category: "Data Science",
          difficulty_level: "beginner",
          duration_hours: 35,
          instructor_name: "Data Expert",
          rating: 4.7,
          price: 199,
          is_free: false,
          skills_taught: ["Python", "Pandas", "Matplotlib"],
          learning_outcomes: ["Analyze data", "Create visualizations"],
          is_active: true
        }
      ];

      let created = 0;
      for (const course of courses) {
        const { error } = await supabaseClient
          .from('courses')
          .insert([course]);
        
        if (!error) created++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          courses_created: created,
          message: `Successfully created ${created} courses`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // NEW ACTION: Professional course population
    if (action === 'populate_professional_courses') {
      console.log('🎓 Starting professional course population...');
      
      const professionalCourses = [
        {
          title: "Advanced JavaScript & ES6+",
          description: "Master modern JavaScript with ES6+, async/await, modules, and advanced patterns",
          category: "Programming",
          difficulty_level: "intermediate",
          duration_hours: 35,
          instructor_name: "Sarah Wilson",
          rating: 4.9,
          price: 399,
          is_free: false,
          skills_taught: ["JavaScript", "ES6", "Async Programming", "Modules"],
          learning_outcomes: ["Master modern JS", "Build complex applications", "Understand async patterns"],
          is_active: true
        },
        {
          title: "Full-Stack Python Development",
          description: "Complete Python development from backend APIs to web applications",
          category: "Programming", 
          difficulty_level: "intermediate",
          duration_hours: 60,
          instructor_name: "Dr. Alex Kumar",
          rating: 4.8,
          price: 599,
          is_free: false,
          skills_taught: ["Python", "Django", "Flask", "APIs", "Databases"],
          learning_outcomes: ["Build full-stack apps", "Create REST APIs", "Deploy applications"],
          is_active: true
        },
        {
          title: "Cloud Architecture with AWS",
          description: "Learn cloud infrastructure, serverless, and scalable architecture patterns",
          category: "Cloud Computing",
          difficulty_level: "advanced",
          duration_hours: 45,
          instructor_name: "Mike Chen",
          rating: 4.7,
          price: 799,
          is_free: false,
          skills_taught: ["AWS", "Lambda", "EC2", "RDS", "CloudFormation"],
          learning_outcomes: ["Design cloud solutions", "Implement serverless", "Optimize costs"],
          is_active: true
        },
        {
          title: "Data Science with Python & R",
          description: "Complete data science workflow from analysis to machine learning",
          category: "Data Science",
          difficulty_level: "intermediate", 
          duration_hours: 55,
          instructor_name: "Prof. Lisa Zhang",
          rating: 4.9,
          price: 699,
          is_free: false,
          skills_taught: ["Python", "R", "Pandas", "Scikit-learn", "TensorFlow"],
          learning_outcomes: ["Analyze complex data", "Build ML models", "Create insights"],
          is_active: true
        },
        {
          title: "DevOps & CI/CD Mastery",
          description: "Master DevOps practices, containerization, and continuous deployment",
          category: "DevOps",
          difficulty_level: "advanced",
          duration_hours: 40,
          instructor_name: "James Rodriguez",
          rating: 4.8,
          price: 549,
          is_free: false,
          skills_taught: ["Docker", "Kubernetes", "Jenkins", "GitLab CI", "Terraform"],
          learning_outcomes: ["Automate deployments", "Manage containers", "Scale infrastructure"],
          is_active: true
        },
        {
          title: "Mobile App Development with React Native",
          description: "Build cross-platform mobile apps with React Native and Expo",
          category: "Mobile Development",
          difficulty_level: "intermediate",
          duration_hours: 50,
          instructor_name: "Emma Thompson",
          rating: 4.6,
          price: 499,
          is_free: false,
          skills_taught: ["React Native", "Expo", "Mobile UI", "APIs", "Publishing"],
          learning_outcomes: ["Build mobile apps", "Cross-platform development", "App store deployment"],
          is_active: true
        },
        {
          title: "Cybersecurity Fundamentals",
          description: "Essential cybersecurity practices for developers and IT professionals",
          category: "Security",
          difficulty_level: "beginner",
          duration_hours: 30,
          instructor_name: "Dr. Robert Kim",
          rating: 4.7,
          price: 349,
          is_free: false,
          skills_taught: ["Network Security", "Cryptography", "Penetration Testing", "OWASP"],
          learning_outcomes: ["Secure applications", "Identify vulnerabilities", "Implement best practices"],
          is_active: true
        },
        {
          title: "Product Management Excellence",
          description: "Strategic product management from ideation to market success",
          category: "Business",
          difficulty_level: "intermediate",
          duration_hours: 35,
          instructor_name: "Rachel Green",
          rating: 4.8,
          price: 449,
          is_free: false,
          skills_taught: ["Product Strategy", "User Research", "Agile", "Analytics", "Leadership"],
          learning_outcomes: ["Launch products", "Lead teams", "Drive growth"],
          is_active: true
        },
        {
          title: "UI/UX Design Masterclass",
          description: "Complete design workflow from research to high-fidelity prototypes",
          category: "Design",
          difficulty_level: "beginner",
          duration_hours: 45,
          instructor_name: "Sofia Martinez",
          rating: 4.9,
          price: 399,
          is_free: false,
          skills_taught: ["Figma", "User Research", "Prototyping", "Design Systems", "Usability"],
          learning_outcomes: ["Design user interfaces", "Conduct research", "Create prototypes"],
          is_active: true
        },
        {
          title: "Machine Learning Engineering",
          description: "Deploy and scale machine learning models in production environments",
          category: "AI/ML",
          difficulty_level: "advanced",
          duration_hours: 65,
          instructor_name: "Dr. Alan Turing",
          rating: 4.9,
          price: 899,
          is_free: false,
          skills_taught: ["MLOps", "Model Deployment", "Monitoring", "Scaling", "Production ML"],
          learning_outcomes: ["Deploy ML models", "Monitor performance", "Scale ML systems"],
          is_active: true
        }
      ];

      let created = 0;
      const targetCount = Math.min(count || 10, professionalCourses.length);
      
      for (let i = 0; i < targetCount; i++) {
        const course = professionalCourses[i];
        const { error } = await supabaseClient
          .from('courses')
          .insert([course]);
        
        if (!error) created++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          courses_created: created,
          message: `Successfully created ${created} professional courses`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // NEW ACTION: YouTube enhancement
    if (action === 'enhance_with_youtube') {
      console.log('📺 Enhancing courses with YouTube integration...');
      
      // Get courses without video content
      const { data: courses, error: coursesError } = await supabaseClient
        .from('courses')
        .select('id, title')
        .limit(10);

      if (coursesError) throw coursesError;

      let enhanced = 0;
      for (const course of courses || []) {
        // Add sample video URLs for each course
        const sampleVideos = [
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          'https://www.youtube.com/watch?v=9bZkp7q19f0',
          'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
        ];

        const { error: updateError } = await supabaseClient
          .from('courses')
          .update({
            video_url: sampleVideos[enhanced % sampleVideos.length],
            updated_at: new Date().toISOString()
          })
          .eq('id', course.id);

        if (!updateError) enhanced++;
      }

      return new Response(
        JSON.stringify({
          success: true,
          courses_enhanced: enhanced,
          message: `Enhanced ${enhanced} courses with YouTube integration`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: (error as Error).message,
        message: 'Failed to populate courses. Please check your database connection.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});