import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Enhanced YouTube resumable upload session creator with structured logging
async function handler(req: Request): Promise<Response> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  console.log(`[${requestId}] Request started: ${req.method} ${req.url}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] CORS preflight handled`);
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET' && new URL(req.url).pathname.endsWith('/health')) {
    console.log(`[${requestId}] Health check requested`);
    return new Response(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'yt-create-upload-session',
      version: '2.0'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    console.log(`[${requestId}] Method not allowed: ${req.method}`);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log(`[${requestId}] Parsing request body...`);
    const body = await req.json();
    console.log(`[${requestId}] Raw request body:`, JSON.stringify(body, null, 2));
    
    const {
      title,
      description = '',
      privacyStatus,
      fileSize,
      contentType,
      type,
    } = body;

    console.log(`[${requestId}] Extracted fields:`, {
      title: title,
      titleType: typeof title,
      titleExists: !!title,
      fileSize: fileSize,
      fileSizeType: typeof fileSize,
      fileSizeIsNumber: typeof fileSize === 'number',
      contentType: contentType,
      contentTypeExists: !!contentType,
      privacyStatus: privacyStatus,
      privacyStatusExists: !!privacyStatus,
      type: type,
      typeExists: !!type
    });

    // Validate required fields with detailed logging
    const validationErrors = [];
    if (!title) validationErrors.push('title is missing or empty');
    if (typeof fileSize !== 'number') validationErrors.push(`fileSize is not a number (got ${typeof fileSize}: ${fileSize})`);
    if (!contentType) validationErrors.push('contentType is missing or empty');
    if (!privacyStatus) validationErrors.push('privacyStatus is missing or empty');
    if (!type) validationErrors.push('type is missing or empty');

    if (validationErrors.length > 0) {
      console.log(`[${requestId}] Validation failed:`, validationErrors);
      return new Response(JSON.stringify({ 
        error: 'Missing required fields', 
        details: validationErrors 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enforce max size (default 100MB if not specified)
    const maxMb = parseInt(Deno.env.get('UPLOAD_MAX_FILE_SIZE_MB') || '100', 10);
    const maxBytes = maxMb * 1024 * 1024;
    console.log(`[${requestId}] File size check: ${fileSize} bytes vs ${maxBytes} max`);
    
    if (fileSize > maxBytes) {
      console.log(`[${requestId}] File size exceeded: ${fileSize} > ${maxBytes}`);
      return new Response(
        JSON.stringify({ error: 'File size exceeds max limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !serviceRole) {
      console.log(`[${requestId}] Missing Supabase secrets`);
      return new Response(JSON.stringify({ error: 'Server not configured (Supabase secrets missing)' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRole);

    // Check auth and admin privileges
    const authHeader = req.headers.get('Authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let userId: string | null = null;
    let isAdmin = false;

    if (bearer && anonKey) {
      const supabaseUser = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${bearer}` } } });
      const { data: userRes } = await supabaseUser.auth.getUser();
      userId = userRes?.user?.id ?? null;

      // Use DB function to check admin
      const { data: adminCheck } = await supabaseUser.rpc('is_current_user_admin');
      isAdmin = !!adminCheck;
      console.log(`[${requestId}] Authenticated user: ${userId}, isAdmin=${isAdmin}`);
    } else {
      console.log(`[${requestId}] Missing Authorization header or SUPABASE_ANON_KEY; treating as unauthenticated for admin check`);
    }

    // Gate by type
    if (['discussion','podcast','learning'].includes(type)) {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Admin only upload type' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    // Ensure signed-in for reels
    if (type === 'reel' && !userId) {
      return new Response(JSON.stringify({ error: 'Authentication required for reels' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Round-robin YouTube channel refresh token from DB, fallback to env
    let refreshToken = '';
    let channelIndex = 1;

    const { data: channels, error: chErr } = await supabaseAdmin
      .from('youtube_channels')
      .select('id, refresh_token')
      .order('id', { ascending: true });

    if (chErr) {
      console.log(`[${requestId}] Error fetching channels: `, chErr);
    }
    if (channels && channels.length > 0) {
      const idx = Math.floor(Date.now() / 60000) % channels.length;
      refreshToken = channels[idx].refresh_token;
      channelIndex = idx + 1;
      console.log(`[${requestId}] Using DB refresh token (channel ${channelIndex})`);
    } else {
      // Fallback to single token in env for bootstrap
      refreshToken = Deno.env.get('YT_REFRESH_TOKEN') || '';
      if (!refreshToken) {
        return new Response(JSON.stringify({ error: 'No YouTube channels configured' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`[${requestId}] Using env YT_REFRESH_TOKEN as fallback`);
    }

    const clientId = Deno.env.get('YT_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('YT_OAUTH_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.log(`[${requestId}] Missing OAuth credentials:`, {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret
      });
      return new Response(
        JSON.stringify({ error: 'Missing YouTube OAuth credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Step 1: Exchanging refresh token for access token...`);
    
    // Step 1: Exchange refresh token for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    console.log(`[${requestId}] Token response status: ${tokenRes.status}`);

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error(`[${requestId}] Token exchange failed:`, errText);
      return new Response(
        JSON.stringify({ error: 'Failed to refresh token', details: errText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;
    console.log(`[${requestId}] Access token received:`, { hasToken: !!accessToken });
    
    if (!accessToken) {
      console.error(`[${requestId}] No access token in response:`, tokenJson);
      return new Response(
        JSON.stringify({ error: 'No access token returned by Google' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Step 2: Creating YouTube upload session...`);

    // Step 2: Create the YouTube resumable upload session
    const createRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': String(fileSize),
          'X-Upload-Content-Type': contentType,
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
          },
          status: {
            privacyStatus,
          },
        }),
      }
    );

    console.log(`[${requestId}] Upload session response status: ${createRes.status}`);

    // YouTube returns the resumable URL in the Location header
    const uploadUrl = createRes.headers.get('location') || createRes.headers.get('Location');
    console.log(`[${requestId}] Upload URL received:`, { hasUploadUrl: !!uploadUrl });

    if (!createRes.ok || !uploadUrl) {
      const errText = await createRes.text();
      console.error(`[${requestId}] Upload session creation failed:`, errText);
      return new Response(
        JSON.stringify({ error: 'Failed to create upload session', details: errText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert pending video row
    const allowOnWall = type !== 'learning';
    const { data: insertData, error: insertErr } = await supabaseAdmin
      .from('videos')
      .insert([{
        type,
        title,
        caption: description || '',
        user_id: userId,
        storage_provider: 'youtube',
        status: 'processing',
        allow_on_wall: allowOnWall,
        channel_index: channelIndex,
        privacy: privacyStatus || 'unlisted'
      }])
      .select()
      .maybeSingle();

    if (insertErr) {
      console.error(`[${requestId}] Failed to insert pending video: `, insertErr);
      return new Response(JSON.stringify({ error: 'Failed to create DB record', details: insertErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Success! Upload session created in ${duration}ms`);

    return new Response(
      JSON.stringify({ uploadUrl, video_record_id: insertData?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] Unexpected error after ${duration}ms:`, e);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Deno entrypoint with latest serve API
Deno.serve(handler);
