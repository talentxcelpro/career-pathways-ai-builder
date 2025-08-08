import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface CVParsingRequest {
  fileUrl: string;
  fileName: string;
  fileType: string;
  batchId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check and usage help
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'cv-parser is running',
        expectedPayload: {
          fileUrl: 'https://<project>.supabase.co/storage/v1/object/public/documents/cv-uploads/<batchId>/<file>.pdf',
          fileName: 'John_Doe_Resume.pdf',
          fileType: 'application/pdf',
          batchId: 'uuid from uploadBatch response'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let batchId: string | undefined; // Declare outside try block for error handling

  try {
    console.log('🔍 REQUEST DEBUG - Method:', req.method);
    console.log('🔍 REQUEST DEBUG - Headers:', Object.fromEntries(req.headers.entries()));
    
    const rawText = await req.text();
    console.log('🔍 REQUEST DEBUG - Raw text body:', rawText);
    
    let requestBody;
    try {
      requestBody = JSON.parse(rawText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.log('🔍 Raw body that failed to parse:', rawText);
      throw new Error(`Invalid JSON: ${parseError.message}`);
    }
    
    console.log('📨 Parsed request body type:', typeof requestBody);
    console.log('📨 Parsed request body:', requestBody);
    console.log('📨 Request body keys:', Object.keys(requestBody || {}));
    
    const { fileUrl, fileName, fileType } = requestBody || {};
    batchId = requestBody?.batchId; // Assign to outer scope variable
    
    console.log('📨 Extracted values:', {
      fileUrl: fileUrl || 'UNDEFINED',
      fileName: fileName || 'UNDEFINED', 
      fileType: fileType || 'UNDEFINED',
      batchId: batchId || 'UNDEFINED'
    });
    
    // Validate required fields
    if (!fileUrl || !fileName || !fileType || !batchId) {
      const errorMsg = `Missing required fields: fileUrl=${!!fileUrl}, fileName=${!!fileName}, fileType=${!!fileType}, batchId=${!!batchId}`;
      console.error('❌ Validation failed:', errorMsg);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body',
          details: errorMsg,
          expected: {
            fileUrl: 'https://<project>.supabase.co/storage/v1/object/public/documents/cv-uploads/<batchId>/<file>.pdf',
            fileName: 'John_Doe_Resume.pdf',
            fileType: 'application/pdf',
            batchId: 'uuid from uploadBatch response'
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('🔄 Processing CV:', fileName);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('🔧 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasOpenAIKey: !!Deno.env.get('OPENAI_API_KEY')
    });
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key (optional for mock mode)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

    // Download the file content
    console.log('📥 Attempting to download file from:', fileUrl);
    const fileResponse = await fetch(fileUrl);
    console.log('📥 File download response status:', fileResponse.status);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`);
    }

    // For now, we'll use a simplified text extraction approach
    // In production, you'd want to use libraries like pdf-parse or mammoth
    let extractedText = '';
    
    if (fileType.includes('pdf')) {
      // For PDF files, we'll extract text using a simplified approach
      // In production, integrate with pdf-parse or similar library
      extractedText = `PDF content from ${fileName} - This is a placeholder for actual PDF text extraction`;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      // For Word files, we'll extract text using mammoth or similar
      extractedText = `Word document content from ${fileName} - This is a placeholder for actual Word text extraction`;
    } else {
      throw new Error('Unsupported file type');
    }

    // For testing, let's use mock data instead of OpenAI to isolate the issue
    console.log('🤖 Using mock CV data for testing...');
    
    const parsedCV = {
      personal_info: {
        full_name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        phone: '+1234567890',
        location: 'Test City, Test State',
        linkedin_url: 'https://linkedin.com/in/testuser',
        github_url: null,
        portfolio_url: null
      },
      professional_summary: 'Experienced professional with strong background in technology.',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      work_experience: [],
      education: [],
      certifications: [],
      languages: ['English'],
      years_of_experience: 3,
      preferred_job_titles: ['Software Developer'],
      availability_status: 'open_to_opportunities'
    };

    /* TEMPORARILY DISABLED - OpenAI parsing
    // Use OpenAI to parse the CV content
    const parseResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional CV parser. Extract structured data from the CV text and return it as JSON with the following schema:
            {
              "personal_info": {
                "full_name": "string",
                "email": "string",
                "phone": "string",
                "location": "string",
                "linkedin_url": "string",
                "github_url": "string",
                "portfolio_url": "string"
              },
              "professional_summary": "string",
              "skills": ["array of skills"],
              "work_experience": [
                {
                  "company": "string",
                  "position": "string",
                  "start_date": "YYYY-MM",
                  "end_date": "YYYY-MM or current",
                  "location": "string",
                  "responsibilities": ["array of responsibilities"],
                  "key_achievements": ["array of achievements"]
                }
              ],
              "education": [
                {
                  "institution": "string",
                  "degree": "string",
                  "graduation_date": "YYYY-MM-DD",
                  "gpa_honors": "string",
                  "relevant_coursework": ["array of courses"],
                  "academic_projects": ["array of projects"]
                }
              ],
              "certifications": ["array of certifications"],
              "languages": ["array of languages"],
              "years_of_experience": "number",
              "preferred_job_titles": ["array of job titles"],
              "availability_status": "open_to_opportunities"
            }
            
            Extract as much relevant information as possible. If information is not available, use null or appropriate defaults.`
          },
          {
            role: 'user',
            content: `Please parse this CV content:\n\n${extractedText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    */

    console.log('✅ CV parsed successfully with mock data:', parsedCV.personal_info?.full_name || 'Unknown');

    // Create or find user profile
    let userId;
    const email = parsedCV.personal_info?.email;
    
    if (email) {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingProfile) {
        userId = existingProfile.id;
        console.log('📝 Found existing profile for:', email);
      } else {
        // Create new profile with a UUID that doesn't need to reference auth.users
        const newUserId = crypto.randomUUID();
        console.log('👤 About to create new profile for:', email, 'with ID:', newUserId);
        console.log('📋 Profile will be standalone (not linked to auth.users)');
        
        try {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: newUserId,
              email: email,
              full_name: parsedCV.personal_info?.full_name || 'Unknown',
              phone: parsedCV.personal_info?.phone,
              location: parsedCV.personal_info?.location,
              about: parsedCV.professional_summary,
              linkedin_url: parsedCV.personal_info?.linkedin_url,
              github_url: parsedCV.personal_info?.github_url,
              portfolio_url: parsedCV.personal_info?.portfolio_url,
              skills: parsedCV.skills || [],
              experience_years: parsedCV.years_of_experience || 0,
              is_profile_public: true,
              vanity_url: generateSlug(parsedCV.personal_info?.full_name || 'user') + '-' + newUserId.slice(0, 8),
              username: generateUsername(parsedCV.personal_info?.full_name || 'user'),
              looking_for_job: true,
              preferences: {
                certifications: parsedCV.certifications || [],
                languages: parsedCV.languages || [],
                availability_status: parsedCV.availability_status || 'open_to_opportunities'
              }
            })
            .select()
            .single();

          if (profileError) {
            console.error('❌ Profile creation failed:', profileError);
            console.error('❌ Profile error code:', profileError.code);
            console.error('❌ Profile error details:', JSON.stringify(profileError, null, 2));
            
            // Check if it's a unique constraint violation
            if (profileError.code === '23505') {
              console.log('🔄 Unique constraint violation, retrying with different identifiers...');
              const retryUserId = crypto.randomUUID();
              const { data: retryProfile, error: retryError } = await supabase
                .from('profiles')
                .insert({
                  id: retryUserId,
                  email: email,
                  full_name: parsedCV.personal_info?.full_name || 'Unknown',
                  phone: parsedCV.personal_info?.phone,
                  location: parsedCV.personal_info?.location,
                  about: parsedCV.professional_summary,
                  vanity_url: generateSlug(parsedCV.personal_info?.full_name || 'user') + '-' + retryUserId.slice(0, 8),
                  username: generateUsername(parsedCV.personal_info?.full_name || 'user') + '-' + retryUserId.slice(0, 4),
                  looking_for_job: true
                })
                .select()
                .single();
                
              if (retryError) {
                console.error('❌ Retry profile creation also failed:', retryError);
                throw new Error(`Profile creation failed after retry: ${retryError.message}`);
              }
              
              if (!retryProfile || !retryProfile.id) {
                throw new Error('Profile creation succeeded but no profile data returned');
              }
              
              userId = retryProfile.id;
              console.log('✅ Profile created successfully on retry with ID:', userId);
            } else {
              throw new Error(`Profile creation failed: ${profileError.message}`);
            }
          } else {
            if (!newProfile || !newProfile.id) {
              throw new Error('Profile creation succeeded but no profile data returned');
            }
            userId = newProfile.id;
            console.log('✅ Profile created successfully with ID:', userId);
          }
          
          // Verify the profile actually exists before proceeding
          console.log('🔍 Verifying profile exists in database...');
          const { data: verifyProfile, error: verifyError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('id', userId)
            .single();
            
          if (verifyError || !verifyProfile) {
            throw new Error(`Profile verification failed: ${verifyError?.message || 'Profile not found'}`);
          }
          
          console.log('✅ Profile verified in database:', verifyProfile);
          
        } catch (profileCreationError) {
          console.error('❌ Complete profile creation process failed:', profileCreationError);
          throw profileCreationError;
        }

        // Add a small delay to ensure profile is fully committed before creating career passport
        await new Promise(resolve => setTimeout(resolve, 100));

        // Manually create career passport record since we disabled the trigger
        try {
          console.log('📋 Creating career passport for user:', userId);
          
          // First check if career passport already exists to avoid duplicates
          const { data: existingPassport } = await supabase
            .from('career_passport')
            .select('id')
            .eq('user_id', userId)
            .single();
            
          if (!existingPassport) {
            const { error: careerPassportError } = await supabase
              .from('career_passport')
              .insert({
                user_id: userId,
                completion_percentage: 25, // Basic completion for CV upload
                career_readiness_score: 0
              });
              
            if (careerPassportError) {
              console.error('❌ Career passport creation failed:', careerPassportError);
              console.error('❌ Career passport error details:', JSON.stringify(careerPassportError, null, 2));
              // Don't throw here - profile creation succeeded, this is just supplementary
            } else {
              console.log('✅ Career passport created successfully');
            }
          } else {
            console.log('📋 Career passport already exists for user');
          }
        } catch (careerError) {
          console.error('❌ Career passport creation error:', careerError);
          // Continue processing even if career passport fails
        }

        // Add work experience - FIXED: using correct column names
        if (parsedCV.work_experience?.length > 0) {
          const workExperience = parsedCV.work_experience.map((exp: any) => ({
            user_id: userId,
            company_name: exp.company,
            job_title: exp.position,
            start_date: exp.start_date ? `${exp.start_date}-01` : null,
            end_date: exp.end_date && exp.end_date !== 'current' ? `${exp.end_date}-01` : null,
            location: exp.location,
            responsibilities: exp.responsibilities || [], // FIXED: using responsibilities instead of description
            key_achievements: exp.key_achievements || [], // FIXED: using key_achievements instead of achievements
            technologies_used: exp.technologies_used || []
          }));

          await supabase.from('work_experience').insert(workExperience);
        }

        // Add education - FIXED: using correct column names
        if (parsedCV.education?.length > 0) {
          const education = parsedCV.education.map((edu: any) => ({
            user_id: userId,
            institution: edu.institution, // FIXED: using institution instead of institution_name
            degree: edu.degree,
            graduation_date: edu.graduation_date ? edu.graduation_date : null, // FIXED: using graduation_date instead of start_year/end_year
            gpa_honors: edu.gpa_honors,
            relevant_coursework: edu.relevant_coursework || [],
            academic_projects: edu.academic_projects || []
          }));

          await supabase.from('education').insert(education);
        }

        // Add job preferences
        if (parsedCV.preferred_job_titles?.length > 0) {
          await supabase.from('job_preferences').insert({
            user_id: userId,
            preferred_job_titles: parsedCV.preferred_job_titles,
            employment_types: ['full_time'],
            remote_work_preference: 'hybrid'
          });
        }
      }
    } else {
      throw new Error('No email found in CV - cannot create profile');
    }

    // Store CV file record
    const { data: cvFile, error: cvError } = await supabase
      .from('cv_files')
      .insert({
        user_id: userId,
        original_filename: fileName,
        file_url: fileUrl,
        file_type: fileType,
        parsing_status: 'completed',
        parsed_at: new Date().toISOString(),
        parsing_results: parsedCV,
        is_primary: true
      })
      .select()
      .single();

    if (cvError) {
      console.error('Failed to store CV file record:', cvError);
      throw cvError;
    }

    // Update batch progress
    await supabase.rpc('increment_batch_progress', {
      batch_id: batchId,
      success: true
    });

    return new Response(JSON.stringify({
      success: true,
      userId,
      cvFileId: cvFile.id,
      extractedData: parsedCV,
      message: `Successfully processed CV for ${parsedCV.personal_info?.full_name || 'candidate'}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ CV parsing error:', error);
    
    // Try to update batch progress even on failure
    try {
      if (batchId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase.rpc('increment_batch_progress', {
          batch_id: batchId,
          success: false
        });
      }
    } catch (batchError) {
      console.error('Failed to update batch progress on error:', batchError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'CV parsing failed',
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function generateUsername(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  
  return base + Math.random().toString(36).substr(2, 5);
}