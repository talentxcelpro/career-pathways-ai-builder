import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'index';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const baseUrl = 'https://talentxcel.in';
    const currentDate = new Date().toISOString().split('T')[0];

    if (type === 'index') {
      // Generate sitemap index
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/functions/v1/sitemap-generator?type=main</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/functions/v1/sitemap-generator?type=jobs</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/functions/v1/sitemap-generator?type=network</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/functions/v1/sitemap-generator?type=companies</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

      return new Response(sitemapIndex, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    if (type === 'main') {
      // Static pages sitemap
      const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'daily' },
        { path: '/jobs', priority: '0.9', changefreq: 'daily' },
        { path: '/network', priority: '0.9', changefreq: 'daily' },
        { path: '/companies', priority: '0.8', changefreq: 'daily' },
        { path: '/learning', priority: '0.8', changefreq: 'weekly' },
        { path: '/tools', priority: '0.7', changefreq: 'weekly' },
        { path: '/resume-builder', priority: '0.7', changefreq: 'weekly' },
        { path: '/career-map', priority: '0.6', changefreq: 'weekly' },
        { path: '/about', priority: '0.5', changefreq: 'monthly' },
        { path: '/contact', priority: '0.5', changefreq: 'monthly' },
      ];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      for (const page of staticPages) {
        sitemap += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      }

      sitemap += `
</urlset>`;

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    if (type === 'jobs') {
      // Jobs sitemap - fetch from database
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, created_at, updated_at')
        .eq('status', 'active')
        .limit(5000);

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      if (jobs) {
        for (const job of jobs) {
          const lastmod = new Date(job.updated_at || job.created_at).toISOString().split('T')[0];
          const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          sitemap += `
  <url>
    <loc>${baseUrl}/jobs/${slug}-${job.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        }
      }

      sitemap += `
</urlset>`;

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    if (type === 'network') {
      // Network/profiles sitemap
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, updated_at, created_at')
        .not('display_name', 'is', null)
        .limit(5000);

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      if (profiles) {
        for (const profile of profiles) {
          const lastmod = new Date(profile.updated_at || profile.created_at).toISOString().split('T')[0];
          const slug = profile.display_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || profile.id;
          sitemap += `
  <url>
    <loc>${baseUrl}/network/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }
      }

      sitemap += `
</urlset>`;

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    if (type === 'companies') {
      // Companies sitemap
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, updated_at, created_at')
        .limit(5000);

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      if (companies) {
        for (const company of companies) {
          const lastmod = new Date(company.updated_at || company.created_at).toISOString().split('T')[0];
          const slug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          sitemap += `
  <url>
    <loc>${baseUrl}/companies/${slug}-${company.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
      }

      sitemap += `
</urlset>`;

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // Fallback - return basic sitemap
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(basicSitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://talentxcel.in/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(errorSitemap, {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
});