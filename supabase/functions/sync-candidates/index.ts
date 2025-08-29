import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://dthlgsnakhoftinssokm.supabase.co';
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

    const supabaseClient = createClient(
      supabaseUrl,
      serviceRole || anonKey,
      serviceRole
        ? {}
        : { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    );

    console.log('Starting candidate sync...');

    // Skip clearing existing candidates to avoid requiring elevated permissions
    // Optionally, a periodic cleanup function can be implemented separately.

    // Sync applied resumes from job_applications + profiles
    const { data: appliedCandidates, error: appliedError } = await supabaseClient
      .from('job_applications')
      .select(`
        id,
        user_id,
        job_id,
        resume_url,
        applied_at,
        application_data,
        profiles!inner (
          id,
          full_name,
          email,
          headline,
          about,
          location,
          skills,
          profile_photo_url,
          linkedin_url,
          experience,
          education
        ),
        jobs!fk_job_applications_job_id (
          title,
          company_name
        )
      `);

    if (appliedError) {
      console.error('Error fetching applied candidates:', appliedError);
      throw appliedError;
    }

    console.log(`Found ${appliedCandidates?.length || 0} applied candidates`);

    // Sync platform CVs from profiles
    const { data: platformCandidates, error: platformError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        headline,
        about,
        location,
        skills,
        profile_photo_url,
        linkedin_url,
        experience,
        education,
        resume_url,
        is_profile_public
      `)
      .neq('user_role', 'employer')
      .eq('is_profile_public', true)
      .or('resume_url.neq.,about.neq.,skills.not.is.null');

    if (platformError) {
      console.error('Error fetching platform candidates:', platformError);
      throw platformError;
    }

    console.log(`Found ${platformCandidates?.length || 0} platform candidates`);

    // Prepare applied candidates for insertion
    const appliedCandidatesData = appliedCandidates?.map(app => ({
      user_id: app.user_id,
      name: app.profiles.full_name || 'Unknown',
      email: app.profiles.email,
      title: app.profiles.headline || 'No title specified',
      company: app.jobs.company_name || 'Unknown Company',
      skills: app.profiles.skills || [],
      description: app.profiles.about || '',
      resume_url: app.resume_url || app.profiles.resume_url,
      location: app.profiles.location,
      experience: app.profiles.experience,
      education: app.profiles.education,
      profile_photo_url: app.profiles.profile_photo_url,
      linkedin_url: app.profiles.linkedin_url,
      applied: true,
      source: 'application',
      job_id: app.job_id,
      applied_at: app.applied_at,
      source_metadata: {
        application_id: app.id,
        application_data: app.application_data
      }
    })) || [];

    // Prepare platform candidates for insertion
    const platformCandidatesData = platformCandidates?.map(profile => ({
      user_id: profile.id,
      name: profile.full_name || 'Unknown',
      email: profile.email,
      title: profile.headline || 'No title specified',
      company: 'Seeking Opportunities',
      skills: profile.skills || [],
      description: profile.about || '',
      resume_url: profile.resume_url,
      location: profile.location,
      experience: profile.experience,
      education: profile.education,
      profile_photo_url: profile.profile_photo_url,
      linkedin_url: profile.linkedin_url,
      applied: false,
      source: 'platform',
      job_id: null,
      applied_at: null,
      source_metadata: {
        profile_id: profile.id
      }
    })) || [];

    // Insert applied candidates
    if (appliedCandidatesData.length > 0) {
      const { error: insertAppliedError } = await supabaseClient
        .from('candidates')
        .insert(appliedCandidatesData);

      if (insertAppliedError) {
        console.error('Error inserting applied candidates:', insertAppliedError);
        throw insertAppliedError;
      }
    }

    // Insert platform candidates (avoid duplicates with applied candidates)
    const platformCandidatesFiltered = platformCandidatesData.filter(
      platform => !appliedCandidatesData.some(applied => applied.user_id === platform.user_id)
    );

    if (platformCandidatesFiltered.length > 0) {
      const { error: insertPlatformError } = await supabaseClient
        .from('candidates')
        .insert(platformCandidatesFiltered);

      if (insertPlatformError) {
        console.error('Error inserting platform candidates:', insertPlatformError);
        throw insertPlatformError;
      }
    }

    const totalSynced = appliedCandidatesData.length + platformCandidatesFiltered.length;
    console.log(`Successfully synced ${totalSynced} candidates`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: {
          applied: appliedCandidatesData.length,
          platform: platformCandidatesFiltered.length,
          total: totalSynced
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-candidates function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});