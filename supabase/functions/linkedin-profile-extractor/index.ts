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

    const { sessionToken, linkedinData, action = 'extract' } = await req.json();

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
        // Extract and normalize LinkedIn profile data
        const extractedData = {
          full_name: linkedinData.name || '',
          title: linkedinData.headline || '',
          about: linkedinData.summary || '',
          location: linkedinData.location || '',
          linkedin_url: linkedinData.profileUrl || '',
          profile_picture_url: linkedinData.profilePicture || '',
          skills: linkedinData.skills || [],
          experience: linkedinData.experience || [],
          education: linkedinData.education || [],
          languages: linkedinData.languages || [],
          certifications: linkedinData.certifications || [],
          extracted_at: new Date().toISOString(),
          source: 'linkedin_extension'
        };

        // Store extracted data
        const { data: extraction, error: extractError } = await supabase
          .from('linkedin_extractions')
          .insert({
            user_id: userId,
            raw_data: linkedinData,
            extracted_data: extractedData,
            extraction_quality: calculateExtractionQuality(extractedData),
            status: 'completed'
          })
          .select()
          .single();

        if (extractError) {
          console.error('LinkedIn extraction error:', extractError);
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
        // Sync LinkedIn data to TalentXcel profile
        const { extractionId, fields } = linkedinData;

        const { data: extraction, error: fetchError } = await supabase
          .from('linkedin_extractions')
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
        if (fields.includes('linkedin_url') && extractedData.linkedin_url) {
          updateData.linkedin_url = extractedData.linkedin_url;
        }
        if (fields.includes('skills') && extractedData.skills) {
          updateData.skills = extractedData.skills;
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

        // Award TXC for LinkedIn sync
        await supabase.functions.invoke('extension-txc-miner', {
          body: {
            userId,
            activity: 'linkedin_profile_sync',
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

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('LinkedIn profile extractor error:', error);
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