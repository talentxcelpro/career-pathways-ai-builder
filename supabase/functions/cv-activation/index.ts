import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'activate', cvFileIds = [], batchId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('CV Activation request:', { action, cvFileIds: cvFileIds.length, batchId });

    if (action === 'activate') {
      return await activateCVUsers(supabase, cvFileIds, batchId);
    } else if (action === 'batch_process') {
      return await processBatchActivation(supabase, batchId);
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('CV activation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'CV activation failed',
        details: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Extract email from CV parsing results with multiple fallback patterns
 */
function extractEmailFromCV(parsingResults: any): string | null {
  if (!parsingResults) return null;
  
  // Try different common patterns
  const patterns = [
    parsingResults.profile?.email,
    parsingResults.personalInfo?.email, 
    parsingResults.contact?.email,
    parsingResults.ats?.profile?.email
  ];
  
  for (const email of patterns) {
    if (email && typeof email === 'string' && email.includes('@')) {
      return email.trim().toLowerCase();
    }
  }
  
  // Search in raw text for email pattern
  const rawText = JSON.stringify(parsingResults);
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0].toLowerCase() : null;
}

/**
 * Generate a professional summary from CV data
 */
function generateSummary(parsingResults: any): string {
  try {
    const profile = parsingResults.profile || parsingResults.ats?.profile || {};
    const experience = parsingResults.experience || parsingResults.ats?.experience || [];
    const skills = parsingResults.skills || parsingResults.ats?.skills || [];
    
    let summary = '';
    
    // Add experience summary
    if (experience.length > 0) {
      const latestJob = experience[0];
      const yearsExp = experience.length;
      summary += `Experienced professional with ${yearsExp}+ years in ${latestJob.title || 'various roles'}. `;
    }
    
    // Add skills
    if (skills.length > 0) {
      const topSkills = skills.slice(0, 5).join(', ');
      summary += `Skilled in ${topSkills}. `;
    }
    
    // Add location if available
    if (profile.location) {
      summary += `Based in ${profile.location}. `;
    }
    
    return summary || 'Professional seeking new opportunities.';
  } catch (error) {
    console.warn('Error generating summary:', error);
    return 'Professional seeking new opportunities.';
  }
}

/**
 * Activate specific CV users
 */
async function activateCVUsers(supabase: any, cvFileIds: string[], batchId?: string) {
  const results = { activated: 0, failed: 0, errors: [] as string[] };
  
  // Get CV files to process
  let query = supabase
    .from('cv_files')
    .select('id, original_filename, parsing_results, file_url')
    .eq('parsing_status', 'completed')
    .not('parsing_results', 'is', null);
    
  if (cvFileIds.length > 0) {
    query = query.in('id', cvFileIds);
  } else if (batchId) {
    query = query.eq('batch_id', batchId);
  } else {
    throw new Error('Either cvFileIds or batchId must be provided');
  }
  
  const { data: cvFiles, error: fetchError } = await query;
  
  if (fetchError) {
    throw fetchError;
  }
  
  console.log(`Processing ${cvFiles?.length || 0} CV files for activation`);
  
  if (!cvFiles || cvFiles.length === 0) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'No CV files found to process',
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Process CVs in chunks to avoid overwhelming the system
  const CHUNK_SIZE = 10;
  
  for (let i = 0; i < cvFiles.length; i += CHUNK_SIZE) {
    const chunk = cvFiles.slice(i, i + CHUNK_SIZE);
    
    const chunkPromises = chunk.map(async (cvFile: any) => {
      try {
        const email = extractEmailFromCV(cvFile.parsing_results);
        if (!email) {
          console.log('No email found in CV:', cvFile.original_filename);
          return { success: false, error: 'No email found' };
        }
        
        // Check if user already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', email)
          .single();
          
        if (existingProfile) {
          console.log('User already exists:', email);
          return { success: false, error: 'User already exists' };
        }
        
        // Extract profile data from CV
        const parsingResults = cvFile.parsing_results;
        const profile = parsingResults.profile || parsingResults.ats?.profile || {};
        const experience = parsingResults.experience || parsingResults.ats?.experience || [];
        
        // Create pre-filled profile
        const profileData = {
          email,
          full_name: profile.fullName || profile.name || 'Professional',
          title: experience[0]?.title || experience[0]?.position || 'Professional',
          location: profile.location || 'Not specified',
          about: generateSummary(parsingResults),
          resume_url: cvFile.file_url,
          source: 'cv_upload',
          activation_status: 'pending',
          cv_file_id: cvFile.id,
          profile_visibility: 'public',
          skills: parsingResults.skills || [],
          experience_years: experience.length || 0,
          current_company: experience[0]?.company || null,
          industry: experience[0]?.industry || null
        };
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return { success: false, error: insertError.message };
        }
        
        console.log('✅ CV user activated:', email, newProfile.id);
        return { success: true, profileId: newProfile.id, email };
        
      } catch (error) {
        console.error('Error processing CV:', error);
        return { success: false, error: (error as Error).message };
      }
    });
    
    const chunkResults = await Promise.allSettled(chunkPromises);
    
    chunkResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.activated++;
        } else {
          results.failed++;
          results.errors.push(result.value.error);
        }
      } else {
        results.failed++;
        results.errors.push(result.reason?.message || 'Unknown error');
      }
    });
    
    // Small delay between chunks
    if (i + CHUNK_SIZE < cvFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`✅ Activation complete: ${results.activated} activated, ${results.failed} failed`);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Activated ${results.activated} users, ${results.failed} failed`,
      results 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Process entire batch for activation
 */
async function processBatchActivation(supabase: any, batchId: string) {
  console.log('Processing batch activation for:', batchId);
  
  // Get all completed CVs from batch
  const { data: batchData, error: batchError } = await supabase
    .from('bulk_upload_batches')
    .select(`
      id,
      batch_name,
      total_files,
      cv_files!inner (
        id,
        original_filename,
        parsing_status,
        parsing_results,
        file_url
      )
    `)
    .eq('id', batchId)
    .eq('cv_files.parsing_status', 'completed')
    .single();
    
  if (batchError) {
    throw batchError;
  }
  
  if (!batchData?.cv_files?.length) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'No completed CVs found in batch',
        results: { activated: 0, failed: 0, errors: [] }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Process all CVs in the batch
  const cvFileIds = batchData.cv_files.map((cv: any) => cv.id);
  return await activateCVUsers(supabase, cvFileIds);
}