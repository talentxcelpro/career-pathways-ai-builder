
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url);
    const sitemapType = url.searchParams.get('type') || 'main';
    const baseUrl = 'https://talentxcel.in';

    console.log(`Generating sitemap type: ${sitemapType}`);

    if (sitemapType === 'index') {
      // Generate sitemap index
      const now = new Date().toISOString();
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/jobs-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/companies-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/courses-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/seo-pages-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/news-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

      return new Response(sitemapIndex, {
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    if (sitemapType === 'jobs') {
      // Generate jobs sitemap
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, updated_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(5000);

      const xmlUrls = jobs?.map(job => `  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${job.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n') || '';

      const jobsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

      return new Response(jobsSitemap, { headers: corsHeaders });
    }

    if (sitemapType === 'companies') {
      // Generate companies sitemap
      const { data: companies } = await supabase
        .from('companies')
        .select('id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(2000);

      const xmlUrls = companies?.map(company => `  <url>
    <loc>${baseUrl}/companies/${company.id}</loc>
    <lastmod>${company.updated_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n') || '';

      const companiesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

      return new Response(companiesSitemap, { headers: corsHeaders });
    }

    if (sitemapType === 'seo-pages') {
      // Generate SEO landing pages sitemap
      const now = new Date().toISOString();
      const seoPages = [
        // Jobs by location
        ...['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune']
          .map(location => `  <url>
    <loc>${baseUrl}/jobs/location/${location}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`),
        
        // Jobs by role
        ...['software-engineer', 'data-scientist', 'product-manager', 'devops-engineer']
          .map(role => `  <url>
    <loc>${baseUrl}/jobs/role/${role}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`),

        // Salary guides
        ...['software-engineer', 'data-scientist', 'product-manager']
          .map(role => `  <url>
    <loc>${baseUrl}/salary/${role}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
      ];

      const seoSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${seoPages.join('\n')}
</urlset>`;

      return new Response(seoSitemap, { headers: corsHeaders });
    }

    // Default main sitemap
    const staticPages = [
      { url: '/', priority: 1.0, changefreq: 'daily' },
      { url: '/jobs', priority: 0.9, changefreq: 'daily' },
      { url: '/companies', priority: 0.8, changefreq: 'weekly' },
      { url: '/learning', priority: 0.8, changefreq: 'daily' },
      { url: '/network', priority: 0.7, changefreq: 'daily' },
      { url: '/tools', priority: 0.7, changefreq: 'weekly' },
      { url: '/career-map', priority: 0.7, changefreq: 'weekly' },
      { url: '/colleges', priority: 0.6, changefreq: 'monthly' },
      { url: '/about', priority: 0.5, changefreq: 'monthly' },
      { url: '/contact', priority: 0.5, changefreq: 'monthly' },
    ];

    const now = new Date().toISOString();
    const xmlUrls = staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

    const mainSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

    return new Response(mainSitemap, { headers: corsHeaders });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`, {
      status: 500,
      headers: corsHeaders
    });
  }
})
