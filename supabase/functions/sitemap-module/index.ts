import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateSitemap = (urls: Array<{url: string, lastmod: string, changefreq: string, priority: number}>) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(u => `
    <url>
      <loc>${u.url}</loc>
      <lastmod>${u.lastmod}</lastmod>
      <changefreq>${u.changefreq}</changefreq>
      <priority>${u.priority}</priority>
    </url>`).join('')}
</urlset>`;
};

const getUrlsForModule = async (supabase: any, module: string) => {
  const baseUrl = 'https://talentxcel.in';
  
  switch(module) {
    case 'jobs':
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, seo_slug, updated_at')
        .eq('is_active', true)
        .eq('job_status', 'open');
      return jobs?.map((job: any) => ({
        url: `${baseUrl}/jobs/${job.seo_slug || job.id}`,
        lastmod: new Date(job.updated_at).toISOString(),
        changefreq: 'daily',
        priority: 0.8
      })) || [];

    case 'network':
      const { data: posts } = await supabase
        .from('posts')
        .select('id, slug, updated_at')
        .eq('is_published', true);
      return posts?.map((post: any) => ({
        url: `${baseUrl}/network/${post.slug || post.id}`,
        lastmod: new Date(post.updated_at).toISOString(),
        changefreq: 'weekly',
        priority: 0.7
      })) || [];

    case 'companies':
      const { data: companies } = await supabase
        .from('companies')
        .select('id, slug, updated_at')
        .eq('is_verified', true);
      return companies?.map((company: any) => ({
        url: `${baseUrl}/companies/${company.slug || company.id}`,
        lastmod: new Date(company.updated_at).toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      })) || [];

    case 'learning':
      const { data: courses } = await supabase
        .from('courses')
        .select('id, slug, updated_at')
        .eq('is_published', true);
      return courses?.map((course: any) => ({
        url: `${baseUrl}/learning/${course.slug || course.id}`,
        lastmod: new Date(course.updated_at).toISOString(),
        changefreq: 'weekly',
        priority: 0.7
      })) || [];

    case 'tools':
      return [
        { url: `${baseUrl}/tools/resume-builder`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/tools/cover-letter`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/tools/salary-calculator`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/tools/ats-optimizer`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.7 }
      ];

    case 'services':
      return [
        { url: `${baseUrl}/services/career-coaching`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/services/interview-prep`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.6 },
        { url: `${baseUrl}/services/skill-assessment`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.6 }
      ];

    case 'talentxcel':
      return [
        { url: baseUrl, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
        { url: `${baseUrl}/about`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/contact`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/pricing`, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.6 }
      ];

    default:
      return [];
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const module = url.searchParams.get('module');

    if (!module) {
      return new Response('Module parameter required', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const urls = await getUrlsForModule(supabase, module);
    const sitemap = generateSitemap(urls);

    console.log(`Generated sitemap for ${module} with ${urls.length} URLs`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error) {
    console.error('Sitemap module error:', error);
    return new Response('Error generating sitemap', {
      status: 500,
      headers: corsHeaders,
    });
  }
});