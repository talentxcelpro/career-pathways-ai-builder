
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64 encoded file
  userId: string;
}

Deno.serve(async (req) => {
  console.log('📥 Upload resume function called with method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
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
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('❌ User verification failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User verified:', user.id);

    // Parse JSON request body
    const requestData: UploadRequest = await req.json();
    console.log('📋 Request data received:', {
      fileName: requestData.fileName,
      fileType: requestData.fileType,
      fileSize: requestData.fileSize,
      userId: requestData.userId,
      hasFileData: !!requestData.fileData
    });

    // Validate request data
    if (!requestData.fileName || !requestData.fileType || !requestData.fileData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required file data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (requestData.userId !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID mismatch' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Processing file:', requestData.fileName, 'for user:', requestData.userId);

    // For now, create a mock resume entry with parsed data
    // In a real implementation, you would:
    // 1. Decode the base64 file data
    // 2. Use AI/OCR to extract text content
    // 3. Parse the content into structured data
    // 4. Calculate ATS score based on content analysis
    
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

    // Calculate a mock ATS score based on file type and size
    let atsScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
    
    // Bonus points for PDF (better ATS compatibility)
    if (requestData.fileType === 'application/pdf') {
      atsScore = Math.min(atsScore + 5, 100);
    }

    console.log('📊 Generated ATS score:', atsScore);

    // Insert into ai_resumes table
    const { data: resumeData, error: insertError } = await supabase
      .from('ai_resumes')
      .insert({
        user_id: requestData.userId,
        title: `Resume - ${requestData.fileName}`,
        content: mockParsedData,
        ats_score: atsScore,
        is_primary: false,
        is_public: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting resume:', insertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to save resume data' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Resume saved successfully with ID:', resumeData.id);

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
    console.error('💥 Upload function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
