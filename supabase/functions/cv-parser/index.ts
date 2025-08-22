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
    
    const { fileUrl, fileName, fileType, extractedText: providedText, forceReparse } = requestBody || {};
    batchId = requestBody?.batchId; // Assign to outer scope variable
    
    console.log('📨 Extracted values:', {
      fileUrl: fileUrl || 'UNDEFINED',
      fileName: fileName || 'UNDEFINED', 
      fileType: fileType || 'UNDEFINED',
      providedTextLength: providedText?.length || 0,
      batchId: batchId || 'UNDEFINED',
      forceReparse: !!forceReparse
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

      const arrayBuffer = await fileResponse.arrayBuffer();
      
      if (fileType.includes('pdf')) {
        // For PDFs, try multi-encoding text extraction and direct email scan
        try {
          const uint8Array = new Uint8Array(arrayBuffer);
          let combined = '';

          // 1) UTF-8 decode and collect text objects
          const utf8 = new TextDecoder().decode(uint8Array);
          const textObjMatches = utf8.match(/\((.*?)\)/g);
          if (textObjMatches) combined += ' ' + textObjMatches.map(m => m.slice(1, -1)).join(' ');

          // 2) Append raw utf8 content (for hidden mailto or inline emails)
          combined += ' ' + utf8;

          // 3) Try UTF-16 decodes (common in PDFs)
          try { combined += ' ' + new TextDecoder('utf-16le').decode(uint8Array); } catch {}
          try { combined += ' ' + new TextDecoder('utf-16be').decode(uint8Array); } catch {}

          // 4) Pull any direct email-like substrings from the combined text
          const emailSnippets = combined.match(/[A-Za-z0-9._%+-\s]+@\s*[A-Za-z0-9.-\s]+\s*\.\s*[A-Za-z]{2,}/gi) || [];
          if (emailSnippets.length) combined += ' ' + emailSnippets.join(' ');

          extractedText = combined.trim() || `PDF from ${fileName} (limited extraction)`;
          console.log('📄 PDF text extracted (combined):', extractedText.substring(0, 200));
        } catch (pdfError) {
          console.warn('PDF extraction failed:', pdfError);
          extractedText = `PDF from ${fileName} (extraction failed)`;
        }
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

// Clean and normalize candidate name and derive headline for profile
function cleanExtractedName(raw: string, fullText: string): string {
  if (!raw) return '';
  let name = raw.trim();
  // Remove anything after common separators
  name = name.replace(/\s*\|\s*.*$/, '');
  // Stop at contact keywords that sometimes get appended
  name = name.replace(/\b(email|e-mail|phone|contact|linkedin|github|portfolio|location)[:\s].*$/i, '').trim();
  // Also handle cases like "Amit Gupta Email"
  name = name.replace(/\b(email|e-mail)\b.*$/i, '').trim();
  // Collapse extra spaces
  name = name.replace(/\s{2,}/g, ' ').trim();
  // If too many words, keep the first few that are likely the name
  const words = name.split(' ').filter(Boolean);
  if (words.length > 4) name = words.slice(0, 3).join(' ');
  // Fallback: try to infer from first line of the text
  if (name.length < 3 && fullText) {
    const m = fullText.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
    if (m?.[1]) name = m[1].trim();
  }
  return name;
}

function getHeadlineFromParsed(data: any): string | null {
  try {
    if (data?.work_experience?.length) {
      const first = data.work_experience[0];
      if (first?.position) {
        return first.company ? `${first.position} at ${first.company}` : first.position;
      }
    }
    if (typeof data?.professional_summary === 'string' && data.professional_summary.length > 0) {
      const firstLine = data.professional_summary.split(/\n|\. /)[0];
      return firstLine.length > 120 ? firstLine.slice(0, 117) + '...' : firstLine;
    }
    return null;
  } catch {
    return null;
  }
}

const nameCandidates = [parsedCV.personal_info?.full_name, contactFromText.name, nameFromFile].filter(Boolean) as string[];
let normalizedName = '';
for (const candidate of nameCandidates) {
  normalizedName = cleanExtractedName(candidate, extractedText || '');
  if (normalizedName) break;
}
if (!normalizedName) normalizedName = extractNameFromFileName(fileName) || 'Candidate';
parsedCV.personal_info = parsedCV.personal_info || {};
parsedCV.personal_info.full_name = normalizedName;

const derivedHeadline = getHeadlineFromParsed(parsedCV);

console.log('✅ CV parsed successfully:', normalizedName);
console.log('🔍 Extracted email from parsing:', parsedCV.personal_info?.email);
console.log('🔍 Raw text preview:', extractedText?.substring(0, 500));

    // Create or find user profile (only create with real email addresses)
    let userId;
    const safeName = parsedCV.personal_info?.full_name || extractNameFromFileName(fileName) || 'Candidate';
    const providedEmail = parsedCV.personal_info?.email || null;
    
    // Check if email looks fake (contains upload.local, example.com, etc.)
    const isFakeEmail = providedEmail && (
      providedEmail.includes('@upload.local') || 
      providedEmail.includes('@example.com') || 
      providedEmail.includes('@test.com') ||
      providedEmail.includes('[email') ||
      providedEmail === 'user@example.com'
    );
    
    if (!providedEmail || isFakeEmail) {
      console.log('⚠️ No valid email found in CV (found:', providedEmail, '), trying enhanced extraction');

      const normalizeEmailObfuscation = (txt: string) => {
        if (!txt) return '';
        return txt
          .replace(/[–—]/g, '-')
          .replace(/\[(?:at|AT)\]|\((?:at|AT)\)|\s+(?:at|AT)\s+/g, '@')
          .replace(/\[(?:dot|DOT)\]|\((?:dot|DOT)\)|\s+(?:dot|DOT)\s+/g, '.')
          .replace(/\s*\(at\)\s*/gi, '@')
          .replace(/\s*\(dot\)\s*/gi, '.')
          .replace(/\s*@\s*/g, '@')
          .replace(/\s*\.\s*/g, '.')
          .replace(/\u200B|\u200C|\u200D|\u2060/g, '') // zero-width chars
          .replace(/\s{2,}/g, ' ');
      };

      const stripTrailingPunct = (email: string) => email.replace(/[),;:\.]+$/g, '');
      const isLikelyReal = (email: string) => email && /.+@.+\..+/.test(email) &&
        !/(@upload\.local|@example\.com|@test\.com|\[email|user@example\.com)/i.test(email);

      const textNorm = normalizeEmailObfuscation(extractedText || '');

      // 1) Strict regex
      let found = (textNorm.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])
        .map(stripTrailingPunct)
        .find(isLikelyReal);

      // 2) Labeled patterns (Email:, Email ID -, E-mail —)
      if (!found) {
        const labelMatch = textNorm.match(/(?:email\s*(?:id)?|e-mail|mail)\s*[:\-–—]\s*([^\s]+)\b/gi);
        if (labelMatch) {
          for (const m of labelMatch) {
            const candidate = stripTrailingPunct((m.split(/[:\-–—]/).pop() || '').trim());
            if (isLikelyReal(candidate)) { found = candidate; break; }
          }
        }
      }

      // 3) Try file name
      if (!found) {
        const fromFileName = extractEmailFromFileName?.(fileName);
        if (fromFileName && isLikelyReal(fromFileName)) found = fromFileName;
      }

      // 4) Very loose reconstruction like "name at gmail dot com"
      if (!found) {
        const loose = textNorm.match(/[A-Z0-9._%+-]+\s*[@]\s*[A-Z0-9.-]+\s*[.]\s*[A-Z]{2,}/gi);
        if (loose?.length) found = stripTrailingPunct(loose[0].replace(/\s+/g, ''));
      }

      if (found) {
        console.log('✅ Found real email via enhanced extraction:', found);
        parsedCV.personal_info = parsedCV.personal_info || {};
        parsedCV.personal_info.email = found;
      } else {
        console.log('⚠️ No email found after enhanced extraction; generating temporary email');
        const tempEmail = `${generateSlug(safeName)}.${Date.now()}@no-contact.temp`;
        parsedCV.personal_info = parsedCV.personal_info || {};
        parsedCV.personal_info.email = tempEmail;
        console.log('✅ Generated temporary email for processing:', tempEmail);
      }
    }
    
    const emailToUse = parsedCV.personal_info?.email;

    // Check if user already exists
    let existingProfile: any = null;
    const isTemp = isTempEmail(emailToUse || '');

    if (!isTemp) {
      // First try by real email
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, location, about, headline, linkedin_url, github_url, portfolio_url')
        .eq('email', emailToUse)
        .maybeSingle();
      existingProfile = profileByEmail;

      // If not found by email, try to upgrade a temp-email profile that matches the name
      if (!existingProfile) {
        const { data: tempNameProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('full_name', safeName)
          .ilike('email', '%.temp')
          .maybeSingle();
        if (tempNameProfile) {
          userId = tempNameProfile.id;
          const { error: updEmailErr } = await supabase
            .from('profiles')
            .update({ email: emailToUse, updated_at: new Date().toISOString() })
            .eq('id', userId);
          if (updEmailErr) {
            console.warn('Failed to update temp email to real:', updEmailErr);
          } else {
            console.log('✅ Upgraded temp email to real for profile:', userId);
          }
          existingProfile = { id: userId, email: emailToUse };
        }
      }
    } else {
      // Temp email case: avoid duplicates by matching on name (and optionally location)
      const { data: profileByName } = await supabase
        .from('profiles')
        .select('id, full_name, email, location, phone, about, headline, linkedin_url, github_url, portfolio_url')
        .eq('full_name', safeName)
        .maybeSingle();
      existingProfile = profileByName || null;
    }

    if (existingProfile) {
      userId = existingProfile.id;
      console.log('📝 Found existing profile for:', emailToUse);
      // Merge parsed data into existing profile without overwriting non-empty fields
      const proposed = {
        full_name: safeName,
        phone: parsedCV.personal_info?.phone || null,
        location: parsedCV.personal_info?.location || null,
        about: parsedCV.professional_summary || null,
        headline: derivedHeadline,
        linkedin_url: parsedCV.personal_info?.linkedin_url || null,
        github_url: parsedCV.personal_info?.github_url || null,
        portfolio_url: parsedCV.personal_info?.portfolio_url || null,
        updated_at: new Date().toISOString(),
      } as Record<string, any>;

      const updatePayload: Record<string, any> = {};
      for (const [key, value] of Object.entries(proposed)) {
        const current = (existingProfile as any)[key];
        const isNameFixNeeded = key === 'full_name' && current && /email/i.test(String(current));
        if (value && (isNameFixNeeded || !current || String(current).trim() === '')) {
          updatePayload[key] = value;
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId);
        if (updateErr) {
          console.warn('Profile update warning:', updateErr);
        } else {
          console.log('🔄 Profile updated with fields:', Object.keys(updatePayload));
        }
      } else {
        console.log('ℹ️ Existing profile already populated; no updates applied.');
      }
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
            headline: derivedHeadline,
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

    // Store CV file record (skip when forceReparse)
    let cvFile: any = null;
    if (!forceReparse) {
      const { data: cvInserted, error: cvError } = await supabase
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
      cvFile = cvInserted;

      // Update batch progress (best-effort)
      try {
        await supabase.rpc('increment_batch_progress', {
          batch_id: batchId,
          success: true
        });
      } catch (e) {
        console.warn('increment_batch_progress RPC failed (ignored):', e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      userId,
      cvFileId: cvFile?.id || null,
      extractedData: parsedCV,
      parsedCV, // backward compatible key
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

function isTempEmail(email: string): boolean {
  if (!email) return false;
  return /@(no-contact\.temp|contact-extracted\.temp)$/i.test(email) || email.endsWith('.temp');
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
  // Normalize common obfuscations and zero-width characters
  const normalize = (t: string) => (t || '')
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '') // zero-width
    .replace(/[–—]/g, '-')
    // at/dot variants
    .replace(/\[(?:at)\]|\((?:at)\)|\s+(?:at)\s+/gi, '@')
    .replace(/\[(?:dot)\]|\((?:dot)\)|\s+(?:dot)\s+/gi, '.')
    .replace(/\s*\(at\)\s*/gi, '@')
    .replace(/\s*\(dot\)\s*/gi, '.')
    .replace(/\s*@\s*/g, '@')
    .replace(/\s*\.\s*/g, '.')
    .replace(/\s{2,}/g, ' ');

  const textN = normalize(text);
  let validEmail: string | null = null;

  const isReal = (e: string) => !!e && /.+@.+\..+/.test(e) && !/(upload\.local|example\.com|test\.com|domain\.com|yourcompany\.com|placeholder)/i.test(e);

  // 1) Strict email
  const strict = textN.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || [];
  validEmail = strict.find(isReal) || null;

  // 2) Labeled forms
  if (!validEmail) {
    const labelMatches = textN.match(/(?:email\s*(?:id)?|e-mail|mail|contact\s*email)\s*[:\-–—]?\s*([^\s]+)\b/gi) || [];
    for (const m of labelMatches) {
      const candidate = (m.split(/[:\-–—]/).pop() || '').trim();
      if (isReal(candidate)) { validEmail = candidate; break; }
    }
  }

  // 3) Spaced email like "a b c @ g m a i l . c o m"
  if (!validEmail) {
    const spaced = textN.match(/[A-Za-z0-9._%+\-\s]+@\s*[A-Za-z0-9.\-\s]+\s*\.\s*[A-Za-z]{2,}/gi) || [];
    for (const s of spaced) {
      const collapsed = s.replace(/\s+/g, '');
      if (isReal(collapsed)) { validEmail = collapsed; break; }
    }
  }

  // 4) Reconstruct patterns like "name at gmail dot com"
  if (!validEmail) {
    const atDot = text
      .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
      .replace(/\s+(?:at)\s+/gi, '@')
      .replace(/\s+(?:dot)\s+/gi, '.')
      .replace(/\s*@\s*/g, '@')
      .replace(/\s*\.\s*/g, '.');
    const found = atDot.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (found && isReal(found[0])) validEmail = found[0];
  }

  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?[0-9]{1,4}\)?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/);
  const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-_/]+/i);
  const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);

  return {
    email: validEmail || undefined,
    phone: phoneMatch?.[0],
    linkedin: linkedinMatch?.[0],
    name: nameMatch?.[1],
    skills: []
  };
}