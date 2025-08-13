
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function buildGoogleAuthUrl(params: Record<string, string>) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const label = url.searchParams.get('label') || 'TalentXcel Channel';

  const clientId = Deno.env.get('YT_OAUTH_CLIENT_ID') || '';
  const redirectBase = new URL(req.url).origin;
  const redirectUri = `${redirectBase}/yt-admin-youtube-callback`;

  if (!clientId) {
    return new Response('Missing YT_OAUTH_CLIENT_ID secret', { status: 500, headers: corsHeaders });
  }

  const authUrl = buildGoogleAuthUrl({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: encodeURIComponent(label),
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
      ...corsHeaders,
    },
  });
});
