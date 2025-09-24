import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, naukriData, action = 'extract' } = await req.json();

    // Validate session
    const { data: session, error: sessionError } = await supabase
      .from('chrome_extension_sessions')
      .select('user_id')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = session.user_id;

    switch (action) {
      case 'extract': {
        // Extract and normalize Naukri profile data
        const extractedData = {
          full_name: naukriData.candidateName || '',
          title: naukriData.currentDesignation || '',
          about: naukriData.profileSummary || '',
          location: naukriData.currentLocation || '',
          naukri_url: naukriData.profileUrl || '',
          profile_picture_url: naukriData.profilePhoto || '',
          skills: naukriData.keySkills || [],
          experience: naukriData.workExperience || [],
          education: naukriData.education || [],
          certifications: naukriData.certifications || [],
          current_salary: naukriData.currentSalary || null,
          expected_salary: naukriData.expectedSalary || null,
          notice_period: naukriData.noticePeriod || '',
          total_experience: naukriData.totalExperience || '',
          extracted_at: new Date().toISOString(),
          source: 'naukri_extension'
        };

        // Store extracted data
        const { data: extraction, error: extractError } = await supabase
          .from('naukri_extractions')
          .insert({
            user_id: userId,
            raw_data: naukriData,
            extracted_data: extractedData,
            extraction_quality: calculateExtractionQuality(extractedData),
            status: 'completed'
          })
          .select()
          .single();

        if (extractError) {
          console.error('Naukri extraction error:', extractError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to store extraction' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            extractedData,
            extractionId: extraction.id,
            quality: extraction.extraction_quality
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync': {
        // Sync Naukri data to TalentXcel profile
        const { extractionId, fields } = naukriData;

        const { data: extraction, error: fetchError } = await supabase
          .from('naukri_extractions')
          .select('extracted_data')
          .eq('id', extractionId)
          .eq('user_id', userId)
          .single();

        if (fetchError || !extraction) {
          return new Response(
            JSON.stringify({ success: false, error: 'Extraction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const updateData: any = {};
        const extractedData = extraction.extracted_data;

        // Map selected fields to profile fields
        if (fields.includes('name') && extractedData.full_name) {
          updateData.full_name = extractedData.full_name;
        }
        if (fields.includes('title') && extractedData.title) {
          updateData.title = extractedData.title;
        }
        if (fields.includes('about') && extractedData.about) {
          updateData.about = extractedData.about;
        }
        if (fields.includes('location') && extractedData.location) {
          updateData.location = extractedData.location;
        }
        if (fields.includes('naukri_url') && extractedData.naukri_url) {
          updateData.naukri_url = extractedData.naukri_url;
        }
        if (fields.includes('skills') && extractedData.skills) {
          updateData.skills = extractedData.skills;
        }
        if (fields.includes('experience') && extractedData.experience) {
          updateData.experience = extractedData.experience;
        }
        if (fields.includes('education') && extractedData.education) {
          updateData.education = extractedData.education;
        }
        if (fields.includes('current_salary') && extractedData.current_salary) {
          updateData.current_salary = extractedData.current_salary;
        }
        if (fields.includes('expected_salary') && extractedData.expected_salary) {
          updateData.expected_salary = extractedData.expected_salary;
        }

        updateData.updated_at = new Date().toISOString();

        // Update profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (updateError) {
          console.error('Profile update error:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Award TXC for Naukri sync
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'naukri_profile_sync',
            metadata: { fields: fields.length }
          }
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Profile synced successfully',
            updatedFields: Object.keys(updateData)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'job_alerts': {
        // Set up job alerts based on Naukri preferences
        const { keywords, locations, experience, salary } = naukriData;

        const alertConfig = {
          user_id: userId,
          platform: 'naukri',
          keywords: keywords || [],
          locations: locations || [],
          experience_range: experience || '',
          salary_range: salary || '',
          is_active: true,
          created_at: new Date().toISOString()
        };

        const { data: alert, error: alertError } = await supabase
          .from('job_alerts')
          .insert(alertConfig)
          .select()
          .single();

        if (alertError) {
          console.error('Job alert creation error:', alertError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create job alert' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            alert,
            message: 'Job alert created successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Naukri profile sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateExtractionQuality(data: any): number {
  let score = 0;
  const fields = ['full_name', 'title', 'about', 'location', 'skills', 'experience'];
  
  fields.forEach(field => {
    if (data[field] && data[field].length > 0) {
      score += 1;
    }
  });
  
  return Math.round((score / fields.length) * 100);
}