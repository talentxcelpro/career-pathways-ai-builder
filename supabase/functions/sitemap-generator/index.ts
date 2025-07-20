import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SitemapConfig {
  baseUrl: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Sitemap generator called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type = 'main', lastmod } = await req.json().catch(() => ({}));

    let sitemap = '';

    switch (type) {
      case 'main':
        sitemap = await generateMainSitemap(supabase);
        break;
      case 'jobs':
        sitemap = await generateJobsSitemap(supabase);
        break;
      case 'companies':
        sitemap = await generateCompaniesSitemap(supabase);
        break;
      case 'courses':
        sitemap = await generateCoursesSitemap(supabase);
        break;
      case 'seo-pages':
        sitemap = await generateSEOPagesSitemap(supabase);
        break;
      case 'index':
        sitemap = generateSitemapIndex();
        break;
      default:
        sitemap = await generateMainSitemap(supabase);
    }

    // Store sitemap in cache
    await supabase.from('seo_cache').upsert({
      cache_key: `sitemap_${type}`,
      content: { sitemap },
      page_type: 'sitemap',
      page_id: type,
      expires_at: getExpirationDate(24 * 60), // 24 hours
      is_fresh: true,
      hit_count: 0
    }, {
      onConflict: 'cache_key'
    });

    console.log(`Generated ${type} sitemap with ${sitemap.split('<url>').length - 1} URLs`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateMainSitemap(supabase: any): Promise<string> {
  const baseUrl = 'https://talentxcel.in';
  
  const staticPages = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/jobs', changefreq: 'hourly', priority: '0.9' },
    { loc: '/companies', changefreq: 'daily', priority: '0.8' },
    { loc: '/learning', changefreq: 'weekly', priority: '0.8' },
    { loc: '/network', changefreq: 'daily', priority: '0.7' },
    { loc: '/salary', changefreq: 'weekly', priority: '0.6' },
    { loc: '/social', changefreq: 'weekly', priority: '0.5' }
  ];

  let urls = staticPages.map(page => 
    `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function generateJobsSitemap(supabase: any): Promise<string> {
  const baseUrl = 'https://talentxcel.in';
  
  // Get active jobs (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, updated_at, created_at')
    .eq('is_active', true)
    .gte('created_at', sixMonthsAgo.toISOString())
    .order('updated_at', { ascending: false })
    .limit(50000);

  if (!jobs || jobs.length === 0) {
    return generateEmptySitemap();
  }

  const urls = jobs.map((job: any) => 
    `  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${job.updated_at ? job.updated_at.split('T')[0] : job.created_at.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function generateCompaniesSitemap(supabase: any): Promise<string> {
  const baseUrl = 'https://talentxcel.in';
  
  const { data: companies } = await supabase
    .from('companies')
    .select('id, slug, updated_at, created_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(10000);

  if (!companies || companies.length === 0) {
    return generateEmptySitemap();
  }

  const urls = companies.map((company: any) => 
    `  <url>
    <loc>${baseUrl}/companies/${company.slug || company.id}</loc>
    <lastmod>${company.updated_at ? company.updated_at.split('T')[0] : company.created_at.split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function generateCoursesSitemap(supabase: any): Promise<string> {
  const baseUrl = 'https://talentxcel.in';
  
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, updated_at, created_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(10000);

  if (!courses || courses.length === 0) {
    return generateEmptySitemap();
  }

  const urls = courses.map((course: any) => 
    `  <url>
    <loc>${baseUrl}/learning/${course.id}</loc>
    <lastmod>${course.updated_at ? course.updated_at.split('T')[0] : course.created_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

async function generateSEOPagesSitemap(supabase: any): Promise<string> {
  const baseUrl = 'https://talentxcel.in';
  
  // Get unique locations, roles, and skills for SEO pages
  const locations = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'pune', 'chennai'];
  const roles = ['software-engineer', 'data-scientist', 'product-manager', 'designer'];
  const skills = ['react', 'python', 'java', 'machine-learning', 'aws'];

  const seoPages = [];

  // Location-based job pages
  locations.forEach(location => {
    seoPages.push(`/jobs/location/${location}`);
  });

  // Role-based job pages
  roles.forEach(role => {
    seoPages.push(`/jobs/role/${role}`);
  });

  // Skill-based job pages
  skills.forEach(skill => {
    seoPages.push(`/jobs/skill/${skill}`);
  });

  // Company location pages
  locations.forEach(location => {
    seoPages.push(`/companies/location/${location}`);
  });

  // Salary guides
  roles.forEach(role => {
    seoPages.push(`/salary/${role}`);
  });

  const urls = seoPages.map(page => 
    `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function generateSitemapIndex(): string {
  const baseUrl = 'https://talentxcel.in';
  const lastmod = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/jobs-sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/companies-sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/courses-sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/seo-pages-sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function generateEmptySitemap(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
}

function getExpirationDate(minutes: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}