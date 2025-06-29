
import { supabase } from "@/integrations/supabase/client";

export const generateSEOPagesSitemap = async (): Promise<string> => {
  const baseUrl = 'https://talentxcel.in';
  const now = new Date().toISOString();

  const seoPages = [
    // Jobs by location
    ...['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon']
      .map(location => ({
        loc: `${baseUrl}/jobs/location/${location}`,
        priority: 0.8,
        changefreq: 'daily' as const
      })),
    
    // Jobs by role
    ...['software-engineer', 'data-scientist', 'product-manager', 'devops-engineer', 'ui-ux-designer', 'business-analyst']
      .map(role => ({
        loc: `${baseUrl}/jobs/role/${role}`,
        priority: 0.8,
        changefreq: 'daily' as const
      })),
    
    // Jobs by skill
    ...['javascript', 'python', 'react', 'java', 'aws', 'machine-learning']
      .map(skill => ({
        loc: `${baseUrl}/jobs/skill/${skill}`,
        priority: 0.7,
        changefreq: 'weekly' as const
      })),
    
    // Companies by location
    ...['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon']
      .map(location => ({
        loc: `${baseUrl}/companies/location/${location}`,
        priority: 0.7,
        changefreq: 'weekly' as const
      })),
    
    // Courses by category
    ...['data-science', 'web-development', 'digital-marketing', 'machine-learning', 'cloud-computing', 'cybersecurity']
      .map(category => ({
        loc: `${baseUrl}/courses/category/${category}`,
        priority: 0.7,
        changefreq: 'weekly' as const
      })),
    
    // Salary guides
    ...['software-engineer', 'data-scientist', 'product-manager', 'devops-engineer']
      .map(role => ({
        loc: `${baseUrl}/salary/${role}`,
        priority: 0.6,
        changefreq: 'monthly' as const
      }))
  ];

  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const xmlFooter = '</urlset>';
  
  const xmlUrls = seoPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');

  return `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;
};

export const generateNewsSitemap = async (): Promise<string> => {
  const baseUrl = 'https://talentxcel.in';
  
  try {
    const { data: recentJobs } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        created_at,
        companies (
          name
        )
      `)
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (!recentJobs || recentJobs.length === 0) {
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
    }

    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;
    
    const xmlUrls = recentJobs.map(job => `  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${job.created_at}</lastmod>
    <news:news>
      <news:publication>
        <news:name>TalentXcel</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${job.created_at}</news:publication_date>
      <news:title>${job.title}${job.companies?.name ? ` at ${job.companies.name}` : ''}</news:title>
    </news:news>
  </url>`).join('\n');

    return `${xmlHeader}\n${xmlUrls}\n</urlset>`;
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
  }
};
