
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
  const label = url.searchParams.get('state') ? decodeURIComponent(url.searchParams.get('state') as string) : 'TalentXcel Channel';

  const clientId = Deno.env.get('TX_GOOGLE_CLIENT_ID') || '';
  const clientSecret = Deno.env.get('TX_GOOGLE_CLIENT_SECRET') || '';
  const supabaseUrl = Deno.env.get('TX_SUPABASE_URL') || '';
  const serviceRole = Deno.env.get('TX_SUPABASE_SERVICE_ROLE_KEY') || '';
  const redirectUri = `${new URL(req.url).origin}/yt-admin-youtube-callback`;

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

  if (!refreshToken) {
    return new Response('No refresh_token returned. Ensure prompt=consent and offline access.', { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRole);
  const { error } = await supabase.from('youtube_channels').insert({ label, refresh_token: refreshToken });
  if (error) {
    return new Response(`DB insert failed: ${error.message}`, { status: 500, headers: corsHeaders });
  }

  const html = `
    <html><body style="font-family: system-ui; padding: 24px;">
      <h2>YouTube channel connected ✅</h2>
      <p>Label: <b>${label}</b></p>
      <p>You can close this tab.</p>
    </body></html>
  `;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html', ...corsHeaders } });
});
