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
    console.log(`[${requestId}] Request body parsed:`, { 
      hasTitle: !!body.title, 
      fileSize: body.fileSize, 
      contentType: body.contentType,
      privacyStatus: body.privacyStatus,
      channelIndex: body.channelIndex 
    });

    const {
      title,
      description = '',
      privacyStatus,
      channelIndex,
      fileSize,
      contentType,
    } = body;

    // Validate required fields
    if (
      !title ||
      typeof fileSize !== 'number' ||
      !contentType ||
      !privacyStatus ||
      channelIndex === undefined
    ) {
      console.log(`[${requestId}] Validation failed - missing required fields`);
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
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

    // Resolve refresh token for selected channel (0-based -> 1..5)
    const idx = Math.max(1, Math.min(5, (Number(channelIndex) || 0) + 1));
    console.log(`[${requestId}] Using channel index: ${channelIndex} -> token ${idx}`);
    
    const refreshToken = Deno.env.get(`YT_CHANNEL_REFRESH_TOKEN_${idx}`);
    const clientId = Deno.env.get('YT_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('YT_OAUTH_CLIENT_SECRET');

    if (!refreshToken || !clientId || !clientSecret) {
      console.log(`[${requestId}] Missing OAuth credentials:`, {
        hasRefreshToken: !!refreshToken,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        tokenIndex: idx
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

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Success! Upload session created in ${duration}ms`);

    return new Response(
      JSON.stringify({ uploadUrl }),
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
