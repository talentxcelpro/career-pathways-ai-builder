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

    const { action = 'populate_courses' } = await req.json();

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
        error: error.message,
        message: 'Failed to populate courses. Please check your database connection.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});