import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const xmlHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
  'X-Content-Type-Options': 'nosniff',
};

serve(async (req) => {
  // Always handle CORS first
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Sitemap request received:', req.url);
    
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'index';
    
    console.log('Sitemap type requested:', type);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const baseUrl = 'https://talentxcel.in';
    const currentDate = new Date().toISOString().split('T')[0];

    // Generate sitemap based on type
    let xmlContent = '';

    switch (type) {
      case 'index':
        xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
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
        break;

      case 'main':
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

        xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        for (const page of staticPages) {
          xmlContent += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        }

        xmlContent += `
</urlset>`;
        break;

      case 'jobs':
        try {
          const { data: jobs, error } = await supabase
            .from('jobs')
            .select('id, title, created_at, updated_at')
            .eq('status', 'active')
            .limit(1000);

          if (error) {
            console.error('Jobs fetch error:', error);
            throw error;
          }

          xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

          if (jobs && jobs.length > 0) {
            for (const job of jobs) {
              const lastmod = new Date(job.updated_at || job.created_at).toISOString().split('T')[0];
              const slug = job.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'job';
              xmlContent += `
  <url>
    <loc>${baseUrl}/jobs/${slug}-${job.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            }
          }

          xmlContent += `
</urlset>`;
        } catch (error) {
          console.error('Error fetching jobs:', error);
          // Return basic jobs sitemap on error
          xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/jobs</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>`;
        }
        break;

      case 'network':
        try {
          const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, display_name, updated_at, created_at')
            .not('display_name', 'is', null)
            .limit(1000);

          if (error) {
            console.error('Profiles fetch error:', error);
            throw error;
          }

          xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

          if (profiles && profiles.length > 0) {
            for (const profile of profiles) {
              const lastmod = new Date(profile.updated_at || profile.created_at).toISOString().split('T')[0];
              const slug = profile.display_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || profile.id;
              xmlContent += `
  <url>
    <loc>${baseUrl}/network/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
            }
          }

          xmlContent += `
</urlset>`;
        } catch (error) {
          console.error('Error fetching profiles:', error);
          // Return basic network sitemap on error
          xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/network</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>`;
        }
        break;

      case 'companies':
        try {
          const { data: companies, error } = await supabase
            .from('companies')
            .select('id, name, updated_at, created_at')
            .limit(1000);

          if (error) {
            console.error('Companies fetch error:', error);
            throw error;
          }

          xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

          if (companies && companies.length > 0) {
            for (const company of companies) {
              const lastmod = new Date(company.updated_at || company.created_at).toISOString().split('T')[0];
              const slug = company.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'company';
              xmlContent += `
  <url>
    <loc>${baseUrl}/companies/${slug}-${company.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
            }
          }

          xmlContent += `
</urlset>`;
        } catch (error) {
          console.error('Error fetching companies:', error);
          // Return basic companies sitemap on error
          xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/companies</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>`;
        }
        break;

      default:
        // Default fallback sitemap
        xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;
    }

    console.log(`Generated ${type} sitemap successfully`);
    
    return new Response(xmlContent, {
      status: 200,
      headers: xmlHeaders,
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Always return valid XML even on error
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://talentxcel.in/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(errorXml, {
      status: 200, // Return 200 with valid XML instead of 500
      headers: xmlHeaders,
    });
  }
});