import { corsHeaders } from "../_shared/cors.ts";

// Create a YouTube resumable upload session.
// Expects JSON body: { title, description?, privacyStatus?, channelIndex?, fileSize, contentType? }
// Returns: { uploadUrl }
export async function handler(req: Request): Promise<Response> {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      title,
      description = '',
      privacyStatus = 'unlisted',
      channelIndex = 1,
      fileSize,
      contentType = 'video/mp4',
    } = await req.json();

    if (!title || !fileSize || typeof fileSize !== 'number') {
      return new Response(JSON.stringify({ error: 'title and numeric fileSize are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enforce optional max size
    const maxMb = Number(Deno.env.get('UPLOAD_MAX_FILE_SIZE_MB') || '0');
    if (maxMb > 0) {
      const maxBytes = maxMb * 1024 * 1024;
      if (fileSize > maxBytes) {
        return new Response(
          JSON.stringify({ error: `File too large. Max ${maxMb} MB`, code: 'file_too_large' }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Resolve refresh token for selected channel
    const idx = Math.max(1, Math.min(5, Number(channelIndex) || 1));
    const refreshToken = Deno.env.get(`YT_CHANNEL_REFRESH_TOKEN_${idx}`);
    const clientId = Deno.env.get('YT_OAUTH_CLIENT_ID');
    const clientSecret = Deno.env.get('YT_OAUTH_CLIENT_SECRET');

    if (!clientId || !clientSecret || !refreshToken) {
      return new Response(
        JSON.stringify({ error: 'YouTube OAuth secrets missing for requested channel' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return new Response(
        JSON.stringify({ error: 'Failed to fetch access token', details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token as string;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No access token returned by Google' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // YouTube returns the resumable URL in the Location header
    const uploadUrl = createRes.headers.get('location') || createRes.headers.get('Location');

    if (!createRes.ok || !uploadUrl) {
      const errText = await createRes.text();
      return new Response(
        JSON.stringify({ error: 'Failed to create YouTube upload session', details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ uploadUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Deno entrypoint
Deno.serve(handler);
