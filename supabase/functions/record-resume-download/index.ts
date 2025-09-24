import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Record a free (first) download without payment, increments per-user resume download count
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeId } = await req.json();
    if (!resumeId) throw new Error('resumeId is required');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error('Invalid user');

    const { data: existing } = await supabase
      .from('resume_downloads')
      .select('id, download_count')
      .eq('user_id', userData.user.id)
      .eq('resume_id', resumeId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({
        success: true,
        download_count: existing.download_count,
        message: 'Download already recorded.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await supabase.from('resume_downloads').insert({
      user_id: userData.user.id,
      resume_id: resumeId,
      download_count: 1,
      last_download_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, download_count: 1 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('record-resume-download error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Failed to record download' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});