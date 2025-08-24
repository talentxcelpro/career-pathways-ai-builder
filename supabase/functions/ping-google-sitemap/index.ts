import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sitemapUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/sitemap-index';
    const encodedSitemapUrl = encodeURIComponent(sitemapUrl);
    
    // Ping Google
    const googleResponse = await fetch(`https://www.google.com/ping?sitemap=${encodedSitemapUrl}`);
    console.log(`Google ping status: ${googleResponse.status}`);
    
    // Ping Bing
    const bingResponse = await fetch(`https://www.bing.com/ping?sitemap=${encodedSitemapUrl}`);
    console.log(`Bing ping status: ${bingResponse.status}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Search engines notified successfully',
      google_status: googleResponse.status,
      bing_status: bingResponse.status,
      sitemap_url: sitemapUrl,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Ping error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});