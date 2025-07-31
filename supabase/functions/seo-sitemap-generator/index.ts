import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗺️ SEO Sitemap Generator Starting...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all published SEO content
    const { data: seoContent } = await supabase
      .from('published_content')
      .select(`
        slug,
        published_at,
        seo_metadata,
        bot_generated_content (
          title,
          content_type,
          seo_keywords
        )
      `)
      .eq('publication_type', 'seo_page')
      .order('published_at', { ascending: false });

    if (!seoContent || seoContent.length === 0) {
      return new Response(JSON.stringify({ message: 'No SEO content found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate XML sitemap
    const baseUrl = 'https://talentxcel.in';
    const currentDate = new Date().toISOString();

    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Add SEO pages
    for (const content of seoContent) {
      const contentData = content.bot_generated_content as any;
      const lastmod = new Date(content.published_at).toISOString();
      
      sitemapXml += `
  <url>
    <loc>${baseUrl}/content/${content.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    // Add static pages
    const staticPages = [
      { path: '/jobs', priority: '0.9', changefreq: 'daily' },
      { path: '/network', priority: '0.8', changefreq: 'daily' },
      { path: '/learning', priority: '0.8', changefreq: 'weekly' },
      { path: '/about', priority: '0.6', changefreq: 'monthly' },
      { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    ];

    for (const page of staticPages) {
      sitemapXml += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    }

    sitemapXml += `
</urlset>`;

    // Store sitemap (you could save to storage or return directly)
    console.log(`📊 Generated sitemap with ${seoContent.length + staticPages.length + 1} URLs`);

    // Generate robots.txt content
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: ${baseUrl}/sitemap.xml

# AI-generated content is crawlable
Allow: /content/
Allow: /articles/
Allow: /posts/`;

    return new Response(
      JSON.stringify({
        success: true,
        sitemap: sitemapXml,
        robots: robotsTxt,
        stats: {
          seo_pages: seoContent.length,
          static_pages: staticPages.length,
          total_urls: seoContent.length + staticPages.length + 1
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Sitemap generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});