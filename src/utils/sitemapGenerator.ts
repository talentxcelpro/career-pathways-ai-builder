
import { supabase } from "@/integrations/supabase/client";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export const generateSitemap = async (): Promise<string> => {
  const baseUrl = 'https://talentxcel.in';
  const urls: SitemapUrl[] = [];

  // Static pages with high priority
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' as const },
    { url: '/jobs', priority: 0.9, changefreq: 'daily' as const },
    { url: '/companies', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/learning', priority: 0.8, changefreq: 'daily' as const },
    { url: '/network', priority: 0.7, changefreq: 'daily' as const },
    { url: '/tools', priority: 0.7, changefreq: 'weekly' as const },
    { url: '/career-map', priority: 0.7, changefreq: 'weekly' as const },
    { url: '/colleges', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/about', priority: 0.5, changefreq: 'monthly' as const },
    { url: '/contact', priority: 0.5, changefreq: 'monthly' as const },
    { url: '/blog', priority: 0.6, changefreq: 'weekly' as const },
    { url: '/help', priority: 0.4, changefreq: 'monthly' as const },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.url}`,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: new Date().toISOString()
    });
  });

  try {
    // Get active jobs (fixed type issues)
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(5000);

    jobs?.forEach(job => {
      urls.push({
        loc: `${baseUrl}/jobs/${job.id}`,
        lastmod: job.updated_at,
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Get companies
    const { data: companies } = await supabase
      .from('companies')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(2000);

    companies?.forEach(company => {
      urls.push({
        loc: `${baseUrl}/companies/${company.id}`,
        lastmod: company.updated_at,
        changefreq: 'monthly',
        priority: 0.6
      });
    });

    // Get courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1000);

    courses?.forEach(course => {
      urls.push({
        loc: `${baseUrl}/learning/courses/${course.id}`,
        lastmod: course.updated_at,
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    // Get learning paths
    const { data: learningPaths } = await supabase
      .from('learning_paths')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500);

    learningPaths?.forEach(path => {
      urls.push({
        loc: `${baseUrl}/learning/paths/${path.id}`,
        lastmod: path.updated_at,
        changefreq: 'weekly',
        priority: 0.7
      });
    });

  } catch (error) {
    console.error('Error fetching sitemap data:', error);
  }

  // Generate XML
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const xmlFooter = '</urlset>';
  
  const xmlUrls = urls.map(url => {
    return `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
  }).join('\n');

  return `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;
};

export const generateRobotsTxt = (): string => {
  const baseUrl = 'https://talentxcel.in';
  
  return `User-agent: *
Allow: /

# High-value pages for crawling
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

# Social media crawlers
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/jobs-sitemap.xml
Sitemap: ${baseUrl}/companies-sitemap.xml
Sitemap: ${baseUrl}/courses-sitemap.xml

# Disallow admin and auth pages
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /employer/settings
Disallow: /profile/edit
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*ref=*`;
};

// Export createContentSitemap from seoOptimization.ts
export { createContentSitemap } from './seoOptimization';
