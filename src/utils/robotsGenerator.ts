
export const generateAdvancedRobotsTxt = (): string => {
  const baseUrl = 'https://talentxcel.in';
  
  return `# TalentXcel Robots.txt - Advanced Configuration
User-agent: *
Allow: /

# Enhanced crawling rules for major search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1
Request-rate: 10/60s

User-agent: Bingbot
Allow: /
Crawl-delay: 2
Request-rate: 5/60s

User-agent: Slurp
Allow: /
Crawl-delay: 3

# Social media crawlers for rich previews
User-agent: Twitterbot
Allow: /
User-agent: facebookexternalhit
Allow: /
User-agent: LinkedInBot
Allow: /
User-agent: WhatsApp
Allow: /
User-agent: TelegramBot
Allow: /

# AI and ML crawlers
User-agent: ChatGPT-User
Allow: /
User-agent: GPTBot
Allow: /
User-agent: Google-Extended
Allow: /

# SEO and analysis tools
User-agent: AhrefsBot
Allow: /
User-agent: SemrushBot
Allow: /
User-agent: MJ12bot
Allow: /

# Job aggregators and career sites
User-agent: JobBoardBot
Allow: /
User-agent: CareerBuilder
Allow: /
User-agent: Indeed
Allow: /

# Comprehensive sitemap declarations
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-index.xml
Sitemap: ${baseUrl}/jobs-sitemap.xml
Sitemap: ${baseUrl}/companies-sitemap.xml
Sitemap: ${baseUrl}/courses-sitemap.xml
Sitemap: ${baseUrl}/seo-pages-sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml
Sitemap: ${baseUrl}/rss-feed.xml

# High-priority pages for enhanced crawling
Allow: /jobs/
Allow: /companies/
Allow: /learning/
Allow: /network/
Allow: /salary/

# SEO landing pages with priority
Allow: /jobs/location/
Allow: /jobs/role/
Allow: /jobs/skill/
Allow: /companies/location/
Allow: /courses/category/

# Restricted areas for security and performance
Disallow: /admin/
Disallow: /api/private/
Disallow: /auth/callback
Disallow: /employer/settings/
Disallow: /profile/settings/
Disallow: /profile/edit/
Disallow: /*?*sessionid=*
Disallow: /*?*csrf=*
Disallow: /*?*token=*

# Filter out unwanted parameters
Disallow: /*?*utm_*
Disallow: /*?*ref=*
Disallow: /*?*fbclid=*
Disallow: /*?*gclid=*
Disallow: /*?*msclkid=*
Disallow: /*?*referrer=*
Disallow: /search?*
Disallow: /filter?*
Disallow: /*.json$
Disallow: /*.pdf$
Disallow: /*.doc$
Disallow: /*.docx$

# Allow beneficial API endpoints
Allow: /api/sitemap
Allow: /api/rss
Allow: /api/search
Allow: /api/public/

# Performance optimization hints
Crawl-delay: 1
Request-rate: 1/2s
Visit-time: 0600-2200

# Host specification for primary domain
Host: ${baseUrl}

# Clean URLs preference
Clean-param: utm_source
Clean-param: utm_medium
Clean-param: utm_campaign
Clean-param: ref
Clean-param: source`;
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
    <loc>${baseUrl}/jobs-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/companies-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/courses-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/seo-pages-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/news-sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
};
