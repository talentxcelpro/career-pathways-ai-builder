import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('TX_SUPABASE_URL') || '';
  const serviceRole = Deno.env.get('TX_SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !serviceRole) {
    return new Response(JSON.stringify({ error: 'Missing Supabase secrets' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createClient(supabaseUrl, serviceRole);
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No authorization header' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get user from auth header
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid auth token' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { videoId, table, reason, details } = await req.json();

  if (!videoId || !table || !reason) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate table name
  const validTables = ['posts', 'podcasts', 'course_videos', 'employer_videos', 'college_videos'];
  if (!validTables.includes(table)) {
    return new Response(JSON.stringify({ error: 'Invalid table name' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check if video exists
  const { data: video, error: fetchError } = await supabase
    .from(table)
    .select('id')
    .eq('id', videoId)
    .single();

  if (fetchError || !video) {
    return new Response(JSON.stringify({ error: 'Video not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Create report
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      table_name: table,
      row_id: videoId,
      reason,
      details: details || null,
      status: 'open'
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    success: true, 
    reportId: data.id,
    message: 'Report submitted successfully' 
  }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});