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

  const {
    ytDraftId,
    ytVideoId,
    title,
    description,
    tags = [],
    category,
    visibility = 'public',
    thumbnailUrl
  } = await req.json();

  if (!ytVideoId || !title || !category) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const watchUrl = `https://www.youtube.com/watch?v=${ytVideoId}`;
  const thumb = thumbnailUrl || `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`;

  // Determine which table to insert into based on category
  let tableName: string;
  let insertData: any = {
    title,
    description,
    tags,
    video_url: watchUrl,
    yt_video_id: ytVideoId,
    thumbnail_url: thumb,
    visibility,
    created_at: new Date().toISOString()
  };

  switch (category) {
    case 'reel':
      tableName = 'posts';
      insertData = {
        user_id: user.id,
        content: title,
        media_urls: [watchUrl],
        post_type: 'video',
        tags: tags,
        created_at: new Date().toISOString()
      };
      break;
    case 'podcast':
      tableName = 'podcasts';
      insertData = {
        ...insertData,
        user_id: user.id,
        category: 'General' // Default category
      };
      break;
    case 'course':
      tableName = 'course_videos';
      insertData = {
        ...insertData,
        admin_id: user.id
      };
      break;
    case 'employer':
      tableName = 'employer_videos';
      insertData = {
        ...insertData,
        admin_id: user.id
      };
      break;
    case 'college':
      tableName = 'college_videos';
      insertData = {
        ...insertData,
        admin_id: user.id
      };
      break;
    default:
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }

  // Check permissions for admin categories
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

  // Insert the video record
  const { data, error } = await supabase
    .from(tableName)
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Database insert error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    videoId: data.id, 
    watchUrl, 
    table: tableName, 
    rowId: data.id 
  }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});