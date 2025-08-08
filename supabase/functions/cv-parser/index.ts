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
    
    const { fileUrl, fileName, fileType, extractedText: providedText } = requestBody || {};
    batchId = requestBody?.batchId; // Assign to outer scope variable
    
    console.log('📨 Extracted values:', {
      fileUrl: fileUrl || 'UNDEFINED',
      fileName: fileName || 'UNDEFINED', 
      fileType: fileType || 'UNDEFINED',
      providedTextLength: providedText?.length || 0,
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

    // Prefer client-provided extracted text if present to avoid heavy server parsing
    let extractedText: string = providedText || '';

    if (!extractedText) {
      // Fallback: attempt to download for basic placeholder extraction
      console.log('📥 Attempting to download file from:', fileUrl);
      const fileResponse = await fetch(fileUrl);
      console.log('📥 File download response status:', fileResponse.status);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`);
      }

      if (fileType.includes('pdf')) {
        extractedText = `PDF from ${fileName} (client did not provide text)`;
      } else if (fileType.includes('word') || fileType.includes('doc')) {
        extractedText = `DOC/DOCX from ${fileName} (client did not provide text)`;
      } else {
        throw new Error('Unsupported file type');
      }
    }

    // Build initial parsed data using filename heuristics and basic regex (no mocks)
    const nameFromFile = extractNameFromFileName(fileName);
    const contactFromText = extractContactInfo(extractedText || '');

    let parsedCV: any = {
      personal_info: {
        full_name: contactFromText.name || nameFromFile || null,
        email: contactFromText.email || null,
        phone: contactFromText.phone || null,
        location: contactFromText.location || null,
        linkedin_url: contactFromText.linkedin || null,
        github_url: null,
        portfolio_url: null
      },
      professional_summary: null,
      skills: contactFromText.skills || [],
      work_experience: [],
      education: [],
      certifications: [],
      languages: [],
      years_of_experience: null,
      preferred_job_titles: [],
      availability_status: null
    };

    // Use OpenAI to enhance parsing when available
    if (openaiApiKey && extractedText && extractedText.length > 50) {
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              {
                role: 'system',
                content: 'You are a professional CV parser. Return ONLY valid JSON matching the schema.'
              },
              {
                role: 'user',
                content: `Parse this resume text and return JSON with the exact schema keys below.\n\nSchema:\n{\n  "personal_info": {\n    "full_name": "string|null", "email": "string|null", "phone": "string|null", "location": "string|null", "linkedin_url": "string|null", "github_url": "string|null", "portfolio_url": "string|null"\n  },\n  "professional_summary": "string|null",\n  "skills": ["string"],\n  "work_experience": [{"company":"string","position":"string","start_date":"YYYY-MM|null","end_date":"YYYY-MM|current|null","location":"string|null","responsibilities":["string"],"key_achievements":["string"]}],\n  "education": [{"institution":"string","degree":"string","graduation_date":"YYYY-MM-DD|null","gpa_honors":"string|null","relevant_coursework":["string"],"academic_projects":["string"]}],\n  "certifications": ["string"],\n  "languages": ["string"],\n  "years_of_experience": "number|null",\n  "preferred_job_titles": ["string"],\n  "availability_status": "string|null"\n}\n\nResume:\n${extractedText}`
              }
            ],
            temperature: 0.1,
            max_tokens: 1800
          }),
        });
        const ai = await resp.json();
        const content = ai.choices?.[0]?.message?.content || '';
        const cleaned = content.replace(/^```json\s*|\s*```$/g, '').trim();
        const aiParsed = JSON.parse(cleaned);
        parsedCV = {
          ...parsedCV,
          ...aiParsed,
          personal_info: { ...(parsedCV.personal_info || {}), ...(aiParsed.personal_info || {}) }
        };
        console.log('🤖 OpenAI parsing applied');
      } catch (e) {
        console.warn('OpenAI parsing failed, using heuristics:', (e as any)?.message || e);
      }
    }

    console.log('✅ CV parsed successfully:', parsedCV.personal_info?.full_name || extractNameFromFileName(fileName) || 'Unknown');

    // Create or find user profile (avoid mocks; allow missing email by generating a unique upload address)
    let userId;
    const safeName = parsedCV.personal_info?.full_name || extractNameFromFileName(fileName) || 'Candidate';
    const providedEmail = parsedCV.personal_info?.email || null;
    const emailToUse = providedEmail || `${generateSlug(safeName)}.${crypto.randomUUID().slice(0,8)}@upload.local`;

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailToUse)
      .single();

    if (existingProfile) {
      userId = existingProfile.id;
      console.log('📝 Found existing profile for:', emailToUse);
    } else {
      const newUserId = crypto.randomUUID();
      console.log('👤 Creating new profile for:', emailToUse, 'ID:', newUserId);

      try {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUserId,
            email: emailToUse,
            full_name: safeName,
            phone: parsedCV.personal_info?.phone,
            location: parsedCV.personal_info?.location,
            about: parsedCV.professional_summary,
            linkedin_url: parsedCV.personal_info?.linkedin_url,
            github_url: parsedCV.personal_info?.github_url,
            portfolio_url: parsedCV.personal_info?.portfolio_url,
            skills: parsedCV.skills || [],
            experience_years: parsedCV.years_of_experience || 0,
            is_profile_public: true,
            vanity_url: generateSlug(safeName) + '-' + newUserId.slice(0, 8),
            username: generateUsername(safeName),
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
          throw profileError;
        }
        if (!newProfile?.id) throw new Error('Profile creation succeeded but no data returned');
        userId = newProfile.id;
        console.log('✅ Profile created with ID:', userId);
      } catch (profileCreationError) {
        console.error('❌ Complete profile creation process failed:', profileCreationError);
        throw profileCreationError;
      }

      // Small delay to ensure commit
      await new Promise(resolve => setTimeout(resolve, 80));

      // Create career passport if missing
      try {
        const { data: existingPassport } = await supabase
          .from('career_passport')
          .select('id')
          .eq('user_id', userId)
          .single();
        if (!existingPassport) {
          const { error: cpErr } = await supabase
            .from('career_passport')
            .insert({ user_id: userId, completion_percentage: 15, career_readiness_score: 0 });
          if (cpErr) console.warn('Career passport create warning:', cpErr);
        }
      } catch (cpCatch) {
        console.warn('Career passport check failed:', cpCatch);
      }

      // Optional inserts if present
      if (parsedCV.work_experience?.length > 0) {
        const workExperience = parsedCV.work_experience.map((exp: any) => ({
          user_id: userId,
          company_name: exp.company,
          job_title: exp.position,
          start_date: exp.start_date ? `${exp.start_date}-01` : null,
          end_date: exp.end_date && exp.end_date !== 'current' ? `${exp.end_date}-01` : null,
          location: exp.location,
          responsibilities: exp.responsibilities || [],
          key_achievements: exp.key_achievements || [],
          technologies_used: exp.technologies_used || []
        }));
        await supabase.from('work_experience').insert(workExperience);
      }

      if (parsedCV.education?.length > 0) {
        const education = parsedCV.education.map((edu: any) => ({
          user_id: userId,
          institution: edu.institution,
          degree: edu.degree,
          graduation_date: edu.graduation_date ? edu.graduation_date : null,
          gpa_honors: edu.gpa_honors,
          relevant_coursework: edu.relevant_coursework || [],
          academic_projects: edu.academic_projects || []
        }));
        await supabase.from('education').insert(education);
      }

      if (parsedCV.preferred_job_titles?.length > 0) {
        await supabase.from('job_preferences').insert({
          user_id: userId,
          preferred_job_titles: parsedCV.preferred_job_titles,
          employment_types: ['full_time'],
          remote_work_preference: 'hybrid'
        });
      }
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

function extractNameFromFileName(fileName: string): string | null {
  try {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split(/[\s_\-]+/).filter(Boolean);
    // Heuristic: take first 2-3 words that look like names
    const filtered = parts
      .filter(p => /^[A-Za-z][A-Za-z.'-]*$/.test(p))
      .slice(0, 3)
      .join(' ');
    return filtered || null;
  } catch {
    return null;
  }
}

function extractContactInfo(text: string): { email?: string; phone?: string; linkedin?: string; location?: string; name?: string; skills?: string[] } {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/\+?[0-9][0-9\s().-]{7,}/);
  const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-_/]+/i);
  // Very light heuristics; real parsing will replace this
  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    linkedin: linkedinMatch?.[0],
    skills: []
  };
}