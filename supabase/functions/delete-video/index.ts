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

  const { category, rowId } = await req.json();

  if (!category || !rowId) {
    return new Response(JSON.stringify({ error: 'Missing category or rowId' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Determine table name based on category
  let tableName: string;
  let userColumn: string;

  switch (category) {
    case 'reel':
      tableName = 'posts';
      userColumn = 'user_id';
      break;
    case 'podcast':
      tableName = 'podcasts';
      userColumn = 'user_id';
      break;
    case 'course':
      tableName = 'course_videos';
      userColumn = 'admin_id';
      break;
    case 'employer':
      tableName = 'employer_videos';
      userColumn = 'admin_id';
      break;
    case 'college':
      tableName = 'college_videos';
      userColumn = 'admin_id';
      break;
    default:
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }

  // Get the video record to check ownership and get YouTube video ID
  const { data: video, error: fetchError } = await supabase
    .from(tableName)
    .select('*, yt_video_id')
    .eq('id', rowId)
    .single();

  if (fetchError || !video) {
    return new Response(JSON.stringify({ error: 'Video not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check if user owns the video or is admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const isAdmin = userRole?.role === 'admin';
  const isOwner = video[userColumn] === user.id;

  if (!isAdmin && !isOwner) {
    return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Soft delete the video record
  const { error: deleteError } = await supabase
    .from(tableName)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', rowId);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Optionally delete from YouTube if platform owns the video
  if (video.yt_video_id) {
    try {
      const { data: ytConnection } = await supabase
        .from('youtube_connections')
        .select('access_token, refresh_token, expires_at')
        .eq('owner', 'platform')
        .single();

      if (ytConnection) {
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

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            accessToken = tokenData.access_token;
          }
        }

        if (accessToken) {
          // Delete from YouTube
          const deleteResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${video.yt_video_id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          console.log(`YouTube deletion attempt for ${video.yt_video_id}:`, deleteResponse.status);
        }
      }
    } catch (error) {
      // YouTube deletion failed, but database deletion succeeded
      console.error('YouTube deletion failed:', error);
    }
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Video deleted successfully' 
  }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});