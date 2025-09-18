import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'index';
    
    const baseUrl = 'https://talentxcel.in';
    const now = new Date().toISOString();

    if (type === 'index') {
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=users</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=jobs</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=companies</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=posts</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=locations</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=skills</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=courses</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=tools</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap?type=industries</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

      return new Response(sitemapIndex, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    let urls: Array<{
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: number;
    }> = [];

    switch (type) {
      case 'users':
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name, updated_at')
          .eq('is_verified', true)
          .order('updated_at', { ascending: false })
          .limit(10000);

        if (users) {
          users.forEach(user => {
            const slug = user.full_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || user.id;
            urls.push(
              { loc: `${baseUrl}/users/${user.id}`, lastmod: user.updated_at || now, changefreq: 'weekly', priority: 0.8 },
              { loc: `${baseUrl}/profiles/${slug}`, lastmod: user.updated_at || now, changefreq: 'weekly', priority: 0.8 },
              { loc: `${baseUrl}/professionals/${slug}`, lastmod: user.updated_at || now, changefreq: 'weekly', priority: 0.7 },
              { loc: `${baseUrl}/experts/${slug}`, lastmod: user.updated_at || now, changefreq: 'weekly', priority: 0.7 }
            );
          });
        }
        break;

      case 'jobs':
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, title, seo_slug, updated_at')
          .eq('is_active', true)
          .eq('job_status', 'open')
          .order('created_at', { ascending: false })
          .limit(10000);

        if (jobs) {
          jobs.forEach(job => {
            const slug = job.seo_slug || job.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || job.id;
            urls.push(
              { loc: `${baseUrl}/jobs/${job.id}`, lastmod: job.updated_at || now, changefreq: 'daily', priority: 0.9 },
              { loc: `${baseUrl}/careers/${slug}`, lastmod: job.updated_at || now, changefreq: 'daily', priority: 0.9 },
              { loc: `${baseUrl}/opportunities/${slug}`, lastmod: job.updated_at || now, changefreq: 'daily', priority: 0.8 },
              { loc: `${baseUrl}/positions/${slug}`, lastmod: job.updated_at || now, changefreq: 'daily', priority: 0.8 }
            );
          });
        }
        break;

      case 'companies':
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, updated_at')
          .eq('is_verified', true)
          .order('updated_at', { ascending: false })
          .limit(5000);

        if (companies) {
          companies.forEach(company => {
            const slug = company.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || company.id;
            urls.push(
              { loc: `${baseUrl}/companies/${company.id}`, lastmod: company.updated_at || now, changefreq: 'weekly', priority: 0.8 },
              { loc: `${baseUrl}/employers/${slug}`, lastmod: company.updated_at || now, changefreq: 'weekly', priority: 0.7 },
              { loc: `${baseUrl}/organizations/${slug}`, lastmod: company.updated_at || now, changefreq: 'weekly', priority: 0.7 }
            );
          });
        }
        break;

      case 'posts':
        const { data: posts } = await supabase
          .from('posts')
          .select('id, content, updated_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5000);

        if (posts) {
          posts.forEach(post => {
            const title = post.content?.substring(0, 50)?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || post.id;
            urls.push(
              { loc: `${baseUrl}/posts/${post.id}`, lastmod: post.updated_at || now, changefreq: 'weekly', priority: 0.6 },
              { loc: `${baseUrl}/articles/${title}`, lastmod: post.updated_at || now, changefreq: 'weekly', priority: 0.6 },
              { loc: `${baseUrl}/content/${post.id}`, lastmod: post.updated_at || now, changefreq: 'weekly', priority: 0.5 }
            );
          });
        }
        break;

      case 'locations':
        const locations = [
          'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon',
          'noida', 'ahmedabad', 'jaipur', 'kochi', 'indore', 'lucknow', 'bhopal', 'chandigarh',
          'coimbatore', 'vadodara', 'nagpur', 'visakhapatnam', 'thiruvananthapuram', 'mysore'
        ];

        locations.forEach(location => {
          urls.push(
            { loc: `${baseUrl}/jobs/in/${location}`, lastmod: now, changefreq: 'daily', priority: 0.8 },
            { loc: `${baseUrl}/careers/in/${location}`, lastmod: now, changefreq: 'daily', priority: 0.8 },
            { loc: `${baseUrl}/jobs/location/${location}`, lastmod: now, changefreq: 'daily', priority: 0.7 },
            { loc: `${baseUrl}/companies/in/${location}`, lastmod: now, changefreq: 'weekly', priority: 0.7 }
          );
        });
        break;

      case 'skills':
        const skills = [
          'javascript', 'python', 'java', 'react', 'nodejs', 'angular', 'vue', 'php', 'c++', 'c#',
          'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'machine-learning', 'data-science', 'ai',
          'blockchain', 'cybersecurity', 'devops', 'fullstack', 'frontend', 'backend', 'mobile'
        ];

        skills.forEach(skill => {
          urls.push(
            { loc: `${baseUrl}/jobs/skill/${skill}`, lastmod: now, changefreq: 'daily', priority: 0.7 },
            { loc: `${baseUrl}/careers/skill/${skill}`, lastmod: now, changefreq: 'daily', priority: 0.7 },
            { loc: `${baseUrl}/experts/skill/${skill}`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
            { loc: `${baseUrl}/professionals/skill/${skill}`, lastmod: now, changefreq: 'weekly', priority: 0.6 }
          );
        });
        break;

      case 'courses':
        const categories = [
          'data-science', 'web-development', 'mobile-development', 'machine-learning', 'artificial-intelligence',
          'cloud-computing', 'cybersecurity', 'digital-marketing', 'product-management', 'ui-ux-design'
        ];

        categories.forEach(category => {
          urls.push(
            { loc: `${baseUrl}/courses/category/${category}`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
            { loc: `${baseUrl}/learning/category/${category}`, lastmod: now, changefreq: 'weekly', priority: 0.6 },
            { loc: `${baseUrl}/training/category/${category}`, lastmod: now, changefreq: 'weekly', priority: 0.5 }
          );
        });
        break;

      case 'tools':
        const tools = [
          'resume-builder', 'cover-letter-generator', 'interview-prep', 'salary-calculator', 'skill-assessment',
          'career-path-finder', 'networking-tools', 'job-alert-setup', 'profile-optimizer', 'ats-checker'
        ];

        tools.forEach(tool => {
          urls.push(
            { loc: `${baseUrl}/tools/${tool}`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
            { loc: `${baseUrl}/resources/${tool}`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
            { loc: `${baseUrl}/calculators/${tool}`, lastmod: now, changefreq: 'monthly', priority: 0.4 }
          );
        });
        break;

      case 'industries':
        const industries = [
          'technology', 'healthcare', 'finance', 'education', 'manufacturing', 'retail', 'consulting',
          'media', 'automotive', 'real-estate', 'logistics', 'pharma', 'banking', 'insurance'
        ];

        industries.forEach(industry => {
          urls.push(
            { loc: `${baseUrl}/jobs/industry/${industry}`, lastmod: now, changefreq: 'daily', priority: 0.6 },
            { loc: `${baseUrl}/careers/industry/${industry}`, lastmod: now, changefreq: 'daily', priority: 0.6 },
            { loc: `${baseUrl}/companies/industry/${industry}`, lastmod: now, changefreq: 'weekly', priority: 0.5 }
          );
        });
        break;
    }

    // Generate XML
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const xmlFooter = '</urlset>';
    
    const xmlUrls = urls.slice(0, 50000).map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

    const sitemap = `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;

    return new Response(sitemap, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Error generating mega sitemap:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});