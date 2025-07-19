import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  console.log('Upload resume function called with method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing environment configuration' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User verified:', user.id);

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing file:', file.name, 'for user:', userId);

    // For now, create a mock resume entry with parsed data
    const mockParsedData = {
      personalInfo: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY"
      },
      summary: "Experienced software developer with 5+ years of experience in full-stack development.",
      workExperience: [
        {
          title: "Senior Software Developer",
          company: "Tech Corp",
          location: "New York, NY",
          startDate: "2020-01",
          endDate: "Present",
          bullets: [
            "Led development of React-based web applications",
            "Improved system performance by 40%",
            "Mentored junior developers"
          ]
        }
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "University of Technology",
          location: "Boston, MA",
          startDate: "2015-09",
          endDate: "2019-05"
        }
      ],
      skills: ["JavaScript", "React", "Node.js", "Python", "SQL"]
    };

    // Calculate a mock ATS score
    const atsScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100

    // Insert into ai_resumes table
    const { data: resumeData, error: insertError } = await supabase
      .from('ai_resumes')
      .insert({
        user_id: userId,
        title: `Resume - ${file.name}`,
        content: mockParsedData,
        ats_score: atsScore,
        is_primary: false,
        is_public: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting resume:', insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to save resume: ' + insertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Resume saved successfully:', resumeData.id);

    return new Response(
      JSON.stringify({
        success: true,
        resumeId: resumeData.id,
        atsScore: atsScore,
        parsedData: mockParsedData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upload function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error: ' + error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});