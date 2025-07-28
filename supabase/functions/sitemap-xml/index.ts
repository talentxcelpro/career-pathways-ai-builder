import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating sitemap.xml from database...');

    // Get all active page combinations
    const { data: pages, error } = await supabase
      .from('seo_page_combinations')
      .select('path, priority, updated_at')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
      throw new Error('Failed to fetch pages for sitemap');
    }

    // Static important pages
    const staticPages = [
      { path: '/', priority: 1.0, lastmod: new Date().toISOString() },
      { path: '/jobs', priority: 0.9, lastmod: new Date().toISOString() },
      { path: '/companies', priority: 0.8, lastmod: new Date().toISOString() },
      { path: '/learning', priority: 0.7, lastmod: new Date().toISOString() },
      { path: '/profile', priority: 0.6, lastmod: new Date().toISOString() },
    ];

    // Combine all pages
    const allPages = [
      ...staticPages,
      ...(pages || []).map(page => ({
        path: page.path,
        priority: page.priority || 0.8,
        lastmod: page.updated_at || new Date().toISOString()
      }))
    ];

    // Generate XML
    const baseUrl = 'https://talentxcel.in';
    const urls = allPages.map(page => {
      const lastmod = new Date(page.lastmod).toISOString().split('T')[0]; // YYYY-MM-DD format
      return `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`;
    }).join('\n');

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    console.log(`Generated sitemap with ${allPages.length} URLs`);

    return new Response(sitemapXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://talentxcel.in/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  }
});