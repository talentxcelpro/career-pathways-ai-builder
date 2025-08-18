
import { supabase } from "@/integrations/supabase/client";

export interface EnhancedSitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: string[];
  alternates?: { hreflang: string; href: string }[];
}

export const generateEnhancedSitemap = async (): Promise<string> => {
  const baseUrl = 'https://talentxcel.in';
  const urls: EnhancedSitemapUrl[] = [];

  // Static pages with enhanced metadata
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' as const, images: ['/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'] },
    { url: '/jobs', priority: 0.9, changefreq: 'hourly' as const },
    { url: '/companies', priority: 0.8, changefreq: 'daily' as const },
    { url: '/learning', priority: 0.8, changefreq: 'daily' as const },
    { url: '/network', priority: 0.7, changefreq: 'daily' as const },
    { url: '/tools', priority: 0.7, changefreq: 'weekly' as const },
    { url: '/career-map', priority: 0.7, changefreq: 'weekly' as const },
    { url: '/colleges', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/about', priority: 0.5, changefreq: 'monthly' as const },
    { url: '/contact', priority: 0.5, changefreq: 'monthly' as const },
    { url: '/blog', priority: 0.6, changefreq: 'weekly' as const },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page.url}`,
      changefreq: page.changefreq,
      priority: page.priority,
      lastmod: new Date().toISOString(),
      images: page.images,
      alternates: [
        { hreflang: 'en', href: `${baseUrl}${page.url}` },
        { hreflang: 'x-default', href: `${baseUrl}${page.url}` }
      ]
    });
  });

  try {
    // SEO Landing Pages
    const locations = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon'];
    const roles = ['software-engineer', 'data-scientist', 'product-manager', 'devops-engineer', 'ui-ux-designer'];
    const skills = ['javascript', 'python', 'react', 'java', 'aws', 'machine-learning'];
    const categories = ['data-science', 'web-development', 'digital-marketing', 'cloud-computing'];

    // Jobs by location
    locations.forEach(location => {
      urls.push({
        loc: `${baseUrl}/jobs/location/${location}`,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString()
      });
    });

    // Jobs by role
    roles.forEach(role => {
      urls.push({
        loc: `${baseUrl}/jobs/role/${role}`,
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString()
      });
    });

    // Jobs by skill
    skills.forEach(skill => {
      urls.push({
        loc: `${baseUrl}/jobs/skill/${skill}`,
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date().toISOString()
      });
    });

    // Companies by location
    locations.forEach(location => {
      urls.push({
        loc: `${baseUrl}/companies/location/${location}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString()
      });
    });

    // Courses by category
    categories.forEach(category => {
      urls.push({
        loc: `${baseUrl}/courses/category/${category}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString()
      });
    });

    // Salary guides
    roles.forEach(role => {
      urls.push({
        loc: `${baseUrl}/salary/${role}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString()
      });
    });

    // Dynamic content from database
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, updated_at, title, companies(logo_url)')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(10000);

    jobs?.forEach(job => {
      urls.push({
        loc: `${baseUrl}/jobs/${job.id}`,
        lastmod: job.updated_at,
        changefreq: 'weekly',
        priority: 0.8,
        images: (job.companies as any)?.logo_url ? [(job.companies as any).logo_url] : undefined
      });
    });

    const { data: companies } = await supabase
      .from('companies')
      .select('id, updated_at, logo_url, cover_image_url')
      .order('updated_at', { ascending: false })
      .limit(5000);

    companies?.forEach(company => {
      const images = [company.logo_url, company.cover_image_url].filter(Boolean);
      urls.push({
        loc: `${baseUrl}/companies/${company.id}`,
        lastmod: company.updated_at,
        changefreq: 'monthly',
        priority: 0.6,
        images: images.length > 0 ? images : undefined
      });
    });

    const { data: courses } = await supabase
      .from('courses')
      .select('id, updated_at, thumbnail_url')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(2000);

    courses?.forEach(course => {
      urls.push({
        loc: `${baseUrl}/learning/courses/${course.id}`,
        lastmod: course.updated_at,
        changefreq: 'weekly',
        priority: 0.7,
        images: course.thumbnail_url ? [course.thumbnail_url] : undefined
      });
    });

  } catch (error) {
    console.error('Error fetching sitemap data:', error);
  }

  // Generate enhanced XML with images and alternates
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;
  const xmlFooter = '</urlset>';
  
  const xmlUrls = urls.map(url => {
    let urlXml = `  <url>
    <loc>${url.loc}</loc>`;
    
    if (url.lastmod) {
      urlXml += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      urlXml += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority) {
      urlXml += `\n    <priority>${url.priority}</priority>`;
    }

    // Add image information
    if (url.images && url.images.length > 0) {
      url.images.forEach(image => {
        if (image) {
          const imageUrl = image.startsWith('http') ? image : `https://talentxcel.in${image}`;
          urlXml += `\n    <image:image>
      <image:loc>${imageUrl}</image:loc>
    </image:image>`;
        }
      });
    }

    // Add alternate language links
    if (url.alternates && url.alternates.length > 0) {
      url.alternates.forEach(alt => {
        urlXml += `\n    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`;
      });
    }

    urlXml += '\n  </url>';
    return urlXml;
  }).join('\n');

  return `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;
};

export const generateNewsSitemap = async (): Promise<string> => {
  const baseUrl = 'https://talentxcel.in';
  
  // This would typically fetch from a news/blog table
  const newsItems = [
    {
      loc: `${baseUrl}/blog/ai-job-market-2024`,
      lastmod: new Date().toISOString(),
      title: 'AI Job Market Trends 2024',
      publication: 'TalentXcel Blog'
    }
  ];

  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;
  
  const xmlUrls = newsItems.map(item => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <news:news>
      <news:publication>
        <news:name>${item.publication}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${item.lastmod}</news:publication_date>
      <news:title>${item.title}</news:title>
    </news:news>
  </url>`).join('\n');

  return `${xmlHeader}\n${xmlUrls}\n</urlset>`;
};
