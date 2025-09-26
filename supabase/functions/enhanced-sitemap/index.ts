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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const baseUrl = 'https://talentxcel.in';
    const sitemapEntries: SitemapEntry[] = [];

    // Static high-priority pages
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/jobs', priority: 0.9, changefreq: 'hourly' as const },
      { path: '/companies', priority: 0.8, changefreq: 'daily' as const },
      { path: '/learning', priority: 0.7, changefreq: 'weekly' as const },
      { path: '/network', priority: 0.7, changefreq: 'daily' as const },
      { path: '/tools', priority: 0.6, changefreq: 'weekly' as const },
      { path: '/career-guidance', priority: 0.8, changefreq: 'weekly' as const },
      { path: '/about', priority: 0.5, changefreq: 'monthly' as const },
      { path: '/contact', priority: 0.5, changefreq: 'monthly' as const },
    ];

    staticPages.forEach(page => {
      sitemapEntries.push({
        loc: `${baseUrl}${page.path}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority
      });
    });

    // Dynamic job listings
    try {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, seo_slug, updated_at, posted_at')
        .eq('is_active', true)
        .eq('job_status', 'open')
        .limit(10000); // Limit for performance

      if (jobs) {
        jobs.forEach(job => {
          const slug = job.seo_slug || `job-${job.id}`;
          sitemapEntries.push({
            loc: `${baseUrl}/jobs/${slug}`,
            lastmod: job.updated_at ? new Date(job.updated_at).toISOString().split('T')[0] : new Date(job.posted_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.8
          });
        });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }

    // Dynamic company pages
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, slug, updated_at, created_at')
        .eq('is_active', true)
        .limit(5000);

      if (companies) {
        companies.forEach(company => {
          const slug = company.slug || `company-${company.id}`;
          sitemapEntries.push({
            loc: `${baseUrl}/companies/${slug}`,
            lastmod: company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : new Date(company.created_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.7
          });
        });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }

    // Learning content
    try {
      const { data: courses } = await supabase
        .from('courses')
        .select('id, slug, updated_at, created_at')
        .eq('is_published', true)
        .limit(2000);

      if (courses) {
        courses.forEach(course => {
          const slug = course.slug || `course-${course.id}`;
          sitemapEntries.push({
            loc: `${baseUrl}/learning/${slug}`,
            lastmod: course.updated_at ? new Date(course.updated_at).toISOString().split('T')[0] : new Date(course.created_at).toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.6
          });
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }

    // Location-based job pages
    const locations = [
      'bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 'kolkata',
      'gurgaon', 'noida', 'ahmedabad', 'jaipur', 'kochi', 'coimbatore', 'indore'
    ];

    locations.forEach(location => {
      sitemapEntries.push({
        loc: `${baseUrl}/jobs/location/${location}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.7
      });
    });

    // Role-based job pages
    const roles = [
      'software-engineer', 'data-scientist', 'product-manager', 'business-analyst',
      'marketing-manager', 'sales-executive', 'hr-manager', 'finance-analyst',
      'ui-ux-designer', 'devops-engineer', 'full-stack-developer', 'backend-developer'
    ];

    roles.forEach(role => {
      sitemapEntries.push({
        loc: `${baseUrl}/jobs/role/${role}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.7
      });
    });

    // Generate XML sitemap
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urlsetClose = '</urlset>';

    const urlEntries = sitemapEntries.map(entry => {
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

    const sitemapXml = xmlHeader + urlsetOpen + urlEntries + '\n' + urlsetClose;

    const stats = {
      total_urls: sitemapEntries.length,
      static_pages: staticPages.length,
      job_pages: sitemapEntries.filter(e => e.loc.includes('/jobs/')).length,
      company_pages: sitemapEntries.filter(e => e.loc.includes('/companies/')).length,
      location_pages: locations.length,
      role_pages: roles.length,
      generated_at: new Date().toISOString()
    };

    console.log('Enhanced sitemap generated:', stats);

    return new Response(
      JSON.stringify({
        sitemap: sitemapXml,
        stats: stats
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error generating enhanced sitemap:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate enhanced sitemap',
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