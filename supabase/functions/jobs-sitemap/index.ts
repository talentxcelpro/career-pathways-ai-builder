import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const generateSitemapXML = (entries: SitemapEntry[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = '</urlset>';

  const urlEntries = entries.map(entry => {
    let urlXml = `  <url>\n    <loc>${entry.loc}</loc>\n`;
    
    if (entry.lastmod) {
      urlXml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    
    if (entry.changefreq) {
      urlXml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    
    if (entry.priority) {
      urlXml += `    <priority>${entry.priority}</priority>\n`;
    }
    
    urlXml += `  </url>`;
    return urlXml;
  }).join('\n');

  return xmlHeader + urlsetOpen + urlEntries + '\n' + urlsetClose;
};

const generateSitemapIndex = (sitemapUrls: string[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapIndexClose = '</sitemapindex>';

  const sitemapEntries = sitemapUrls.map(url => 
    `  <sitemap>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </sitemap>`
  ).join('\n');

  return xmlHeader + sitemapIndexOpen + sitemapEntries + '\n' + sitemapIndexClose;
};

const generateJobSlug = (title: string, company: string, location: string): string => {
  const cleanText = (text: string) => text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const titleSlug = cleanText(title);
  const companySlug = cleanText(company);
  const locationSlug = location ? cleanText(location) : 'remote';

  // Format: job-title-company-location
  return `${titleSlug}-${companySlug}-${locationSlug}`.substring(0, 100);
};

const getJobPriority = (postedDate: string): number => {
  const posted = new Date(postedDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) return 0.9;      // Fresh jobs (last 7 days)
  if (daysDiff <= 30) return 0.8;     // Recent jobs (last 30 days)
  if (daysDiff <= 90) return 0.7;     // Older jobs (last 3 months)
  return 0.6;                         // Very old jobs
};

const getJobChangeFreq = (postedDate: string): 'daily' | 'weekly' | 'monthly' => {
  const posted = new Date(postedDate);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 7) return 'daily';    // Fresh jobs update daily
  if (daysDiff <= 30) return 'weekly';  // Recent jobs update weekly
  return 'monthly';                     // Older jobs update monthly
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const baseUrl = 'https://talentxcel.in';
    const url = new URL(req.url);
    const sitemapType = url.searchParams.get('type') || 'index';

    // Generate main jobs sitemap index
    if (sitemapType === 'index') {
      // First, get total job count to determine number of sub-sitemaps
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open');

      const jobsPerSitemap = 10000; // Reduced for better performance
      const totalSitemaps = Math.ceil((totalJobs || 0) / jobsPerSitemap);
      
      const sitemapUrls: string[] = [];
      for (let i = 1; i <= Math.max(totalSitemaps, 5); i++) {
        sitemapUrls.push(`${baseUrl}/sitemap-jobs-${i}.xml`);
      }

      const sitemapIndex = generateSitemapIndex(sitemapUrls);

      return new Response(sitemapIndex, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate jobs sub-sitemap
    if (sitemapType === 'jobs') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = 10000;
      const offset = (page - 1) * limit;

      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          location,
          posted_at,
          updated_at,
          seo_slug,
          companies (
            name
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .order('posted_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const sitemapEntries: SitemapEntry[] = jobs?.map(job => {
        const companyName = (job.companies as any)?.name || job.company_name || 'company';
        const location = job.location || 'remote';
        
        // Use existing SEO slug or generate one
        const slug = job.seo_slug || generateJobSlug(job.title, companyName, location);
        
        return {
          loc: `${baseUrl}/jobs/${slug}`,
          lastmod: new Date(job.updated_at || job.posted_at).toISOString().split('T')[0],
          changefreq: getJobChangeFreq(job.posted_at),
          priority: getJobPriority(job.posted_at)
        };
      }) || [];

      const sitemap = generateSitemapXML(sitemapEntries);

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate category-based sitemaps
    if (sitemapType === 'category') {
      const category = url.searchParams.get('category') || 'engineering';
      
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          location,
          posted_at,
          updated_at,
          seo_slug,
          role_category,
          companies (
            name
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .ilike('role_category', `%${category}%`)
        .order('posted_at', { ascending: false })
        .limit(10000);

      const sitemapEntries: SitemapEntry[] = jobs?.map(job => {
        const companyName = (job.companies as any)?.name || job.company_name || 'company';
        const location = job.location || 'remote';
        const slug = job.seo_slug || generateJobSlug(job.title, companyName, location);
        
        return {
          loc: `${baseUrl}/jobs/${slug}`,
          lastmod: new Date(job.updated_at || job.posted_at).toISOString().split('T')[0],
          changefreq: getJobChangeFreq(job.posted_at),
          priority: getJobPriority(job.posted_at)
        };
      }) || [];

      const sitemap = generateSitemapXML(sitemapEntries);

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate date-based sitemaps
    if (sitemapType === 'date') {
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          location,
          posted_at,
          updated_at,
          seo_slug,
          companies (
            name
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .gte('posted_at', `${date}T00:00:00`)
        .lt('posted_at', `${date}T23:59:59`)
        .order('posted_at', { ascending: false })
        .limit(10000);

      const sitemapEntries: SitemapEntry[] = jobs?.map(job => {
        const companyName = (job.companies as any)?.name || job.company_name || 'company';
        const location = job.location || 'remote';
        const slug = job.seo_slug || generateJobSlug(job.title, companyName, location);
        
        return {
          loc: `${baseUrl}/jobs/${slug}`,
          lastmod: new Date(job.updated_at || job.posted_at).toISOString().split('T')[0],
          changefreq: 'daily',
          priority: 0.9 // Fresh jobs get high priority
        };
      }) || [];

      const sitemap = generateSitemapXML(sitemapEntries);

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid sitemap type' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error generating jobs sitemap:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate jobs sitemap',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});