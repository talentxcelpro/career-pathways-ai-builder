import { supabase } from "@/integrations/supabase/client";

export const generateMegaSitemap = async (): Promise<string> => {
  const baseUrl = 'https://talentxcel.in';
  const now = new Date().toISOString();
  
  let urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: 'daily' | 'weekly' | 'monthly';
    priority: number;
  }> = [];

  try {
    // Users/Profiles SEO Pages
    const { data: users } = await supabase
      .from('profiles')
      .select('id, full_name, updated_at')
      .eq('is_verified', true)
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (users) {
      users.forEach(user => {
        const slug = user.full_name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || user.id;
        urls.push(
          ...[
            { loc: `${baseUrl}/users/${user.id}`, lastmod: user.updated_at || now, changefreq: 'weekly' as const, priority: 0.8 },
            { loc: `${baseUrl}/profiles/${slug}`, lastmod: user.updated_at || now, changefreq: 'weekly' as const, priority: 0.8 },
            { loc: `${baseUrl}/professionals/${slug}`, lastmod: user.updated_at || now, changefreq: 'weekly' as const, priority: 0.7 },
            { loc: `${baseUrl}/experts/${slug}`, lastmod: user.updated_at || now, changefreq: 'weekly' as const, priority: 0.7 }
          ]
        );
      });
    }

    // Jobs SEO Pages
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, seo_slug, updated_at, company_name')
      .eq('is_active', true)
      .eq('job_status', 'open')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (jobs) {
      jobs.forEach(job => {
        const slug = job.seo_slug || job.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || job.id;
        urls.push(
          ...[
            { loc: `${baseUrl}/jobs/${job.id}`, lastmod: job.updated_at || now, changefreq: 'daily' as const, priority: 0.9 },
            { loc: `${baseUrl}/careers/${slug}`, lastmod: job.updated_at || now, changefreq: 'daily' as const, priority: 0.9 },
            { loc: `${baseUrl}/opportunities/${slug}`, lastmod: job.updated_at || now, changefreq: 'daily' as const, priority: 0.8 },
            { loc: `${baseUrl}/positions/${slug}`, lastmod: job.updated_at || now, changefreq: 'daily' as const, priority: 0.8 }
          ]
        );
      });
    }

    // Companies SEO Pages
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, updated_at')
      .eq('is_verified', true)
      .order('updated_at', { ascending: false })
      .limit(2000);

    if (companies) {
      companies.forEach(company => {
        const slug = company.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || company.id;
        urls.push(
          ...[
            { loc: `${baseUrl}/companies/${company.id}`, lastmod: company.updated_at || now, changefreq: 'weekly' as const, priority: 0.8 },
            { loc: `${baseUrl}/employers/${slug}`, lastmod: company.updated_at || now, changefreq: 'weekly' as const, priority: 0.7 },
            { loc: `${baseUrl}/organizations/${slug}`, lastmod: company.updated_at || now, changefreq: 'weekly' as const, priority: 0.7 }
          ]
        );
      });
    }

    // Posts/Articles SEO Pages
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3000);

    if (posts) {
      posts.forEach(post => {
        const title = post.content?.substring(0, 50)?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || post.id;
        urls.push(
          ...[
            { loc: `${baseUrl}/posts/${post.id}`, lastmod: post.updated_at || now, changefreq: 'weekly' as const, priority: 0.6 },
            { loc: `${baseUrl}/articles/${title}`, lastmod: post.updated_at || now, changefreq: 'weekly' as const, priority: 0.6 },
            { loc: `${baseUrl}/content/${post.id}`, lastmod: post.updated_at || now, changefreq: 'weekly' as const, priority: 0.5 }
          ]
        );
      });
    }

    // Location-based pages
    const locations = [
      'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon',
      'noida', 'ahmedabad', 'jaipur', 'kochi', 'indore', 'lucknow', 'bhopal', 'chandigarh',
      'coimbatore', 'vadodara', 'nagpur', 'visakhapatnam', 'thiruvananthapuram', 'mysore',
      'mangalore', 'salem', 'madurai', 'tiruchirappalli', 'erode', 'tirunelveli'
    ];

    locations.forEach(location => {
      urls.push(
        ...[
          { loc: `${baseUrl}/jobs/in/${location}`, lastmod: now, changefreq: 'daily' as const, priority: 0.8 },
          { loc: `${baseUrl}/careers/in/${location}`, lastmod: now, changefreq: 'daily' as const, priority: 0.8 },
          { loc: `${baseUrl}/jobs/location/${location}`, lastmod: now, changefreq: 'daily' as const, priority: 0.7 },
          { loc: `${baseUrl}/companies/in/${location}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.7 }
        ]
      );
    });

    // Skill-based pages
    const skills = [
      'javascript', 'python', 'java', 'react', 'nodejs', 'angular', 'vue', 'php', 'c++', 'c#',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'machine-learning', 'data-science', 'ai',
      'blockchain', 'cybersecurity', 'devops', 'fullstack', 'frontend', 'backend', 'mobile',
      'android', 'ios', 'flutter', 'react-native', 'sql', 'mongodb', 'postgresql', 'mysql',
      'product-management', 'project-management', 'business-analysis', 'ui-ux-design', 'graphic-design'
    ];

    skills.forEach(skill => {
      urls.push(
        ...[
          { loc: `${baseUrl}/jobs/skill/${skill}`, lastmod: now, changefreq: 'daily' as const, priority: 0.7 },
          { loc: `${baseUrl}/careers/skill/${skill}`, lastmod: now, changefreq: 'daily' as const, priority: 0.7 },
          { loc: `${baseUrl}/experts/skill/${skill}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.6 },
          { loc: `${baseUrl}/professionals/skill/${skill}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.6 }
        ]
      );
    });

    // Course categories
    const categories = [
      'data-science', 'web-development', 'mobile-development', 'machine-learning', 'artificial-intelligence',
      'cloud-computing', 'cybersecurity', 'digital-marketing', 'product-management', 'ui-ux-design',
      'blockchain', 'devops', 'software-testing', 'business-analysis', 'project-management'
    ];

    categories.forEach(category => {
      urls.push(
        ...[
          { loc: `${baseUrl}/courses/category/${category}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.6 },
          { loc: `${baseUrl}/learning/category/${category}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.6 },
          { loc: `${baseUrl}/training/category/${category}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.5 },
          { loc: `${baseUrl}/education/category/${category}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.5 }
        ]
      );
    });

    // Tools and resources
    const tools = [
      'resume-builder', 'cover-letter-generator', 'interview-prep', 'salary-calculator', 'skill-assessment',
      'career-path-finder', 'networking-tools', 'job-alert-setup', 'profile-optimizer', 'ats-checker',
      'linkedin-optimizer', 'github-analyzer', 'portfolio-builder', 'cv-scanner', 'job-tracker'
    ];

    tools.forEach(tool => {
      urls.push(
        ...[
          { loc: `${baseUrl}/tools/${tool}`, lastmod: now, changefreq: 'monthly' as const, priority: 0.5 },
          { loc: `${baseUrl}/resources/${tool}`, lastmod: now, changefreq: 'monthly' as const, priority: 0.5 },
          { loc: `${baseUrl}/calculators/${tool}`, lastmod: now, changefreq: 'monthly' as const, priority: 0.4 },
          { loc: `${baseUrl}/generators/${tool}`, lastmod: now, changefreq: 'monthly' as const, priority: 0.4 }
        ]
      );
    });

    // Industry-based pages
    const industries = [
      'technology', 'healthcare', 'finance', 'education', 'manufacturing', 'retail', 'consulting',
      'media', 'automotive', 'real-estate', 'logistics', 'pharma', 'banking', 'insurance', 'startups'
    ];

    industries.forEach(industry => {
      urls.push(
        ...[
          { loc: `${baseUrl}/jobs/industry/${industry}`, lastmod: now, changefreq: 'daily' as const, priority: 0.6 },
          { loc: `${baseUrl}/careers/industry/${industry}`, lastmod: now, changefreq: 'daily' as const, priority: 0.6 },
          { loc: `${baseUrl}/companies/industry/${industry}`, lastmod: now, changefreq: 'weekly' as const, priority: 0.5 }
        ]
      );
    });

  } catch (error) {
    console.error('Error generating mega sitemap:', error);
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

  return `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;
};

export const generateSitemapIndex = (): string => {
  const baseUrl = 'https://talentxcel.in';
  const now = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/users-sitemap.xml</loc>
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
    <loc>${baseUrl}/posts-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/locations-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/skills-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/courses-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/tools-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/industries-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
};