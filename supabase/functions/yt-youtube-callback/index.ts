import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const label = url.searchParams.get('state') ? decodeURIComponent(url.searchParams.get('state') as string) : 'TalentXcel Platform';

  const clientId = Deno.env.get('TX_GOOGLE_CLIENT_ID') || '';
  const clientSecret = Deno.env.get('TX_GOOGLE_CLIENT_SECRET') || '';
  const supabaseUrl = Deno.env.get('TX_SUPABASE_URL') || '';
  const serviceRole = Deno.env.get('TX_SUPABASE_SERVICE_ROLE_KEY') || '';
  const redirectUri = `${new URL(req.url).origin}/yt-youtube-callback`;

  if (!code) return new Response('Missing code', { status: 400, headers: corsHeaders });
  if (!clientId || !clientSecret) return new Response('Missing Google OAuth secrets', { status: 500, headers: corsHeaders });
  if (!supabaseUrl || !serviceRole) return new Response('Missing Supabase secrets', { status: 500, headers: corsHeaders });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return new Response(`Token exchange failed: ${err}`, { status: 502, headers: corsHeaders });
  }

  const tokenJson = await tokenRes.json();
  const refreshToken = tokenJson.refresh_token as string | undefined;
  const accessToken = tokenJson.access_token as string;
  const expiresIn = tokenJson.expires_in as number;

  if (!refreshToken) {
    return new Response('No refresh_token returned. Ensure prompt=consent and offline access.', { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRole);
  
  // Upsert the platform YouTube connection
  const { error } = await supabase
    .from('youtube_connections')
    .upsert({
      owner: 'platform',
      access_token: accessToken,
      refresh_token: refreshToken,
      token_scope: ['https://www.googleapis.com/auth/youtube.upload'],
      expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
      updated_at: new Date().toISOString()
    });
    
  if (error) {
    return new Response(`DB upsert failed: ${error.message}`, { status: 500, headers: corsHeaders });
  }

  const html = `
    <html><body style="font-family: system-ui; padding: 24px;">
      <h2>YouTube Platform Connection Successful ✅</h2>
      <p>Label: <b>${label}</b></p>
      <p>TalentXcel can now upload videos to YouTube on behalf of users.</p>
      <p>You can close this tab.</p>
    </body></html>
  `;
  
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html', ...corsHeaders } });
});