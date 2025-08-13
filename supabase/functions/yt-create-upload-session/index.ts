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
  const youtubeApiKey = Deno.env.get('TX_YOUTUBE_API_KEY') || '';
  
  if (!supabaseUrl || !serviceRole || !youtubeApiKey) {
    return new Response(JSON.stringify({ error: 'Missing required secrets' }), {
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

  const { 
    title, 
    description, 
    privacyStatus, 
    fileSize, 
    contentType,
    category,
    tags = [],
    location,
    durationSec
  } = await req.json();

  if (!title || !fileSize || !contentType || !category) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check if user has admin role for admin categories
  const adminCategories = ['course', 'employer', 'college'];
  if (adminCategories.includes(category)) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions for this category' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Get platform YouTube refresh token
  const { data: ytConnection } = await supabase
    .from('youtube_connections')
    .select('refresh_token, access_token, expires_at')
    .eq('owner', 'platform')
    .single();

  if (!ytConnection) {
    return new Response(JSON.stringify({ error: 'YouTube connection not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let accessToken = ytConnection.access_token;
  
  // Refresh token if expired
  if (!accessToken || (ytConnection.expires_at && new Date(ytConnection.expires_at) <= new Date())) {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: ytConnection.refresh_token,
        client_id: Deno.env.get('TX_GOOGLE_CLIENT_ID') || '',
        client_secret: Deno.env.get('TX_GOOGLE_CLIENT_SECRET') || '',
      }),
    });

    if (!tokenResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to refresh YouTube token' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;
    
    // Update stored token
    await supabase
      .from('youtube_connections')
      .update({
        access_token: accessToken,
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('owner', 'platform');
  }

  // Create YouTube resumable upload session
  const uploadResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Length': fileSize.toString(),
      'X-Upload-Content-Type': contentType,
    },
    body: JSON.stringify({
      snippet: {
        title,
        description: description || '',
        tags: tags || [],
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: privacyStatus || 'unlisted',
        selfDeclaredMadeForKids: false,
      },
    }),
  });

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.text();
    console.error('YouTube upload session creation failed:', errorData);
    return new Response(JSON.stringify({ error: 'Failed to create YouTube upload session' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const uploadUrl = uploadResponse.headers.get('location');
  const ytDraftId = crypto.randomUUID(); // Generate a draft ID for tracking

  return new Response(JSON.stringify({ 
    uploadUrl, 
    ytDraftId,
    maxDuration: category === 'reel' ? 60 : undefined
  }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});