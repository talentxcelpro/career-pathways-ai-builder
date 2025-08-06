import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Job {
  id: string;
  seo_slug: string;
  title: string;
  location: string;
  updated_at: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    console.log('🗺️ Generating enhanced sitemap with SEO-friendly URLs...');

    // Static pages with priorities and change frequencies
    const staticPages = [
      { url: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
      { url: '/jobs', lastmod: new Date().toISOString(), changefreq: 'hourly', priority: '0.9' },
      { url: '/companies', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.8' },
      { url: '/learning', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.8' },
      { url: '/tools', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.7' },
      { url: '/career-map', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.7' },
      { url: '/network', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.6' },
      { url: '/about', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
      { url: '/contact', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: '0.5' },
      { url: '/privacy', lastmod: new Date().toISOString(), changefreq: 'yearly', priority: '0.3' },
      { url: '/terms', lastmod: new Date().toISOString(), changefreq: 'yearly', priority: '0.3' },
    ];

    // Fetch active jobs with SEO slugs
    const { data: jobsData, error: jobsError } = await supabaseClient
      .from('jobs')
      .select('id, seo_slug, title, location, updated_at, created_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(10000); // Limit for performance

    if (jobsError) {
      console.error('❌ Error fetching jobs:', jobsError);
    }

    // Fetch companies
    const { data: companiesData, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError);
    }

    // SEO landing pages for top cities
    const topCities = [
      'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
      'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur',
      'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna',
      'vadodara', 'ghaziabad'
    ];

    const topIndustries = [
      'it', 'banking', 'healthcare', 'manufacturing', 'retail',
      'education', 'media', 'real-estate'
    ];

    const topRoles = [
      'software-engineer', 'data-analyst', 'product-manager', 'sales-executive',
      'marketing-manager', 'business-analyst', 'hr-manager', 'financial-analyst'
    ];

    const seoPages = [
      // City job pages
      ...topCities.map(city => ({
        url: `/jobs/in/${city}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.8'
      })),
      // Industry pages
      ...topIndustries.map(industry => ({
        url: `/industry/${industry}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.7'
      })),
      // Role + city combinations (top combinations only)
      ...topRoles.slice(0, 5).flatMap(role =>
        topCities.slice(0, 10).map(city => ({
          url: `/jobs/${role}/in/${city}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: '0.6'
        }))
      ),
    ];

    console.log(`📊 Sitemap stats:
    - Static pages: ${staticPages.length}
    - Job pages: ${jobsData?.length || 0}
    - Company pages: ${companiesData?.length || 0}
    - SEO landing pages: ${seoPages.length}
    - Total URLs: ${staticPages.length + (jobsData?.length || 0) + (companiesData?.length || 0) + seoPages.length}`);

    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>https://talentxcel.in${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add job pages with SEO-friendly URLs
    if (jobsData) {
      jobsData.forEach((job: Job) => {
        const jobUrl = job.seo_slug ? `/jobs/${job.seo_slug}` : `/jobs/${job.id}`;
        sitemap += `
  <url>
    <loc>https://talentxcel.in${jobUrl}</loc>
    <lastmod>${job.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }

    // Add company pages
    if (companiesData) {
      companiesData.forEach((company: Company) => {
        sitemap += `
  <url>
    <loc>https://talentxcel.in/companies/${company.id}</loc>
    <lastmod>${company.updated_at}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });
    }

    // Add SEO landing pages
    seoPages.forEach(page => {
      sitemap += `
  <url>
    <loc>https://talentxcel.in${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // Return XML sitemap with proper headers
    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('❌ Sitemap generation error:', error);
    
    // Return a minimal fallback sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://talentxcel.in/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://talentxcel.in/jobs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  }
});