import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const modules = [
  'talentxcel', 'network', 'jobs', 'employer', 'companies',
  'resume', 'tools', 'services', 'learning', 'colleges',
  'career-map', 'career-passport'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1';
    
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${modules.map(module => `
    <sitemap>
      <loc>${baseUrl}/sitemap-module?module=${module}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`).join('')}
</sitemapindex>`;

    return new Response(sitemapIndex, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error) {
    console.error('Sitemap index error:', error);
    return new Response('Error generating sitemap index', {
      status: 500,
      headers: corsHeaders,
    });
  }
});