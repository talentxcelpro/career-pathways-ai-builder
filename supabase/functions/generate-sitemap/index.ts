import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const module = url.searchParams.get('module');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 50000; // Max URLs per sitemap

    console.log(`Generating sitemap for module: ${module}, page: ${page}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let urls: SitemapUrl[] = [];

    switch (module) {
      case 'jobs':
        urls = await generateJobsSitemap(supabase, page, limit);
        break;
      case 'companies':
        urls = await generateCompaniesSitemap(supabase, page, limit);
        break;
      case 'learning':
        urls = await generateLearningSitemap(supabase, page, limit);
        break;
      case 'network':
        urls = await generateNetworkSitemap(supabase, page, limit);
        break;
      case 'resume':
        urls = generateResumeStaticUrls();
        break;
      case 'tools':
        urls = generateToolsStaticUrls();
        break;
      case 'colleges':
        urls = await generateCollegesSitemap(supabase, page, limit);
        break;
      case 'careermap':
        urls = generateCareerMapStaticUrls();
        break;
      case 'careerpassport':
        urls = generateCareerPassportStaticUrls();
        break;
      case 'employer':
        urls = generateEmployerStaticUrls();
        break;
      case 'marketplace':
        urls = await generateMarketplaceSitemap(supabase, page, limit);
        break;
      case 'events':
        urls = await generateEventsSitemap(supabase, page, limit);
        break;
      default:
        throw new Error(`Unknown module: ${module}`);
    }

    const xml = generateSitemapXML(urls);
    
    console.log(`Generated ${urls.length} URLs for ${module}`);

    return new Response(xml, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateJobsSitemap(supabase: any, page: number, limit: number): Promise<SitemapUrl[]> {
  const offset = (page - 1) * limit;
  
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, updated_at, created_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (jobs || []).map((job: any) => {
    const slug = `${job.title}-${job.company_name}-${job.location}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      loc: `https://talentxcel.in/jobs/${slug}`,
      lastmod: new Date(job.updated_at || job.created_at).toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.9',
    };
  });
}

async function generateCompaniesSitemap(supabase: any, page: number, limit: number): Promise<SitemapUrl[]> {
  const offset = (page - 1) * limit;
  
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }

  return (companies || []).map((company: any) => {
    const slug = company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    return {
      loc: `https://talentxcel.in/companies/${slug}`,
      lastmod: new Date(company.updated_at || company.created_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7',
    };
  });
}

async function generateLearningSitemap(supabase: any, page: number, limit: number): Promise<SitemapUrl[]> {
  const offset = (page - 1) * limit;
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, updated_at, created_at')
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  return (courses || []).map((course: any) => {
    const slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    return {
      loc: `https://talentxcel.in/learning/courses/${slug}`,
      lastmod: new Date(course.updated_at || course.created_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    };
  });
}

async function generateNetworkSitemap(supabase: any, page: number, limit: number): Promise<SitemapUrl[]> {
  const offset = (page - 1) * limit;
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, updated_at')
    .not('username', 'is', null)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return (profiles || []).map((profile: any) => ({
    loc: `https://talentxcel.in/${profile.username}`,
    lastmod: new Date(profile.updated_at).toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.6',
  }));
}

async function generateCollegesSitemap(supabase: any, page: number, limit: number): Promise<SitemapUrl[]> {
  // Placeholder - implement when colleges table exists
  return [];
}

async function generateMarketplaceSitemap(supabase: any, page: number, limit: number): Promise<SitemapUrl[]> {
  const offset = (page - 1) * limit;
  
  const { data: services, error } = await supabase
    .from('service_offerings')
    .select('id, title, updated_at, created_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return (services || []).map((service: any) => {
    const slug = service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    return {
      loc: `https://talentxcel.in/marketplace/services/${slug}`,
      lastmod: new Date(service.updated_at || service.created_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.7',
    };
  });
}

async function generateEventsSitemap(supabase: any, page: number, limit: number): Promise<SitemapUrl[]> {
  // Placeholder - implement when events table exists
  return [];
}

function generateResumeStaticUrls(): SitemapUrl[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    { loc: 'https://talentxcel.in/resume/templates', lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://talentxcel.in/resume/examples', lastmod: today, changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://talentxcel.in/resume/guides', lastmod: today, changefreq: 'weekly', priority: '0.7' },
  ];
}

function generateToolsStaticUrls(): SitemapUrl[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    { loc: 'https://talentxcel.in/tools', lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: 'https://talentxcel.in/tools/cover-letter', lastmod: today, changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://talentxcel.in/tools/salary', lastmod: today, changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://talentxcel.in/tools/ats-check', lastmod: today, changefreq: 'weekly', priority: '0.7' },
    { loc: 'https://talentxcel.in/tools/job-match', lastmod: today, changefreq: 'weekly', priority: '0.7' },
  ];
}

function generateCareerMapStaticUrls(): SitemapUrl[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    { loc: 'https://talentxcel.in/careermap', lastmod: today, changefreq: 'weekly', priority: '0.7' },
  ];
}

function generateCareerPassportStaticUrls(): SitemapUrl[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    { loc: 'https://talentxcel.in/careerpassport/public', lastmod: today, changefreq: 'weekly', priority: '0.6' },
  ];
}

function generateEmployerStaticUrls(): SitemapUrl[] {
  const today = new Date().toISOString().split('T')[0];
  
  return [
    { loc: 'https://talentxcel.in/employer', lastmod: today, changefreq: 'weekly', priority: '0.6' },
  ];
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries}
</urlset>`;
}
