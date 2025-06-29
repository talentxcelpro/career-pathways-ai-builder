
import { supabase } from "@/integrations/supabase/client";

// Generate SEO-optimized titles
export const generateSEOTitle = (title: string, location?: string, company?: string): string => {
  const baseTitle = title.trim();
  const locationPart = location ? ` in ${location}` : '';
  const companyPart = company ? ` at ${company}` : '';
  
  return `${baseTitle}${companyPart}${locationPart} | TalentXcel Jobs`;
};

// Generate SEO-optimized descriptions
export const generateJobDescription = (job: any): string => {
  const title = job.title || 'Job';
  const company = job.companies?.name || 'Company';
  const location = job.location || 'Remote';
  const type = job.employment_type?.replace('_', ' ') || 'Full-time';
  const salary = job.salary_min && job.salary_max 
    ? `₹${Math.round(job.salary_min/100000)}L - ₹${Math.round(job.salary_max/100000)}L`
    : 'Competitive salary';

  return `Join ${company} as ${title} in ${location}. ${type} position offering ${salary}. Apply now and advance your career with top companies. Expert career guidance and interview preparation available.`;
};

export const generateCompanyDescription = (company: any): string => {
  const name = company.name || 'Company';
  const industry = company.industry || 'Technology';
  const location = company.location || 'Multiple locations';
  const size = company.size_range || 'Growing team';
  
  return `Explore career opportunities at ${name} - Leading ${industry} company in ${location}. Join our ${size} and grow your career. Current job openings, company culture, and employee benefits.`;
};

export const generateCourseDescription = (course: any): string => {
  const title = course.title || 'Course';
  const instructor = course.instructor_name || 'Expert instructor';
  const duration = course.duration_hours ? `${course.duration_hours} hours` : 'Self-paced';
  const level = course.difficulty_level || 'All levels';
  const skills = course.skills_taught?.slice(0, 3)?.join(', ') || 'valuable skills';
  
  return `Master ${skills} with ${title} by ${instructor}. ${duration} comprehensive course for ${level}. Get certified and advance your career with industry-relevant skills.`;
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (breadcrumbs: { name: string; url: string }[]): string => {
  const itemListElement = breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": crumb.name,
    "item": `https://talentxcel.in${crumb.url}`
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": itemListElement
  };

  return JSON.stringify(structuredData, null, 2);
};

// Generate FAQ structured data
export const generateFAQStructuredData = (faqs: { question: string; answer: string }[]): string => {
  const mainEntity = faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mainEntity
  };

  return JSON.stringify(structuredData, null, 2);
};

// SEO keywords generator
export const generateKeywords = (type: 'job' | 'company' | 'course', data: any): string[] => {
  const baseKeywords = ['careers', 'jobs', 'employment', 'career development', 'professional growth'];
  
  switch (type) {
    case 'job':
      return [
        ...baseKeywords,
        data.title?.toLowerCase(),
        data.companies?.name?.toLowerCase(),
        data.location?.toLowerCase(),
        data.employment_type?.replace('_', ' '),
        'job application',
        'hiring',
        'recruitment',
        ...(data.required_skills || []).map((skill: string) => skill.toLowerCase())
      ].filter(Boolean);
      
    case 'company':
      return [
        ...baseKeywords,
        data.name?.toLowerCase(),
        data.industry?.toLowerCase(),
        data.location?.toLowerCase(),
        'company jobs',
        'employer',
        'company culture',
        'work opportunities'
      ].filter(Boolean);
      
    case 'course':
      return [
        'learning',
        'education',
        'online courses',
        'skill development',
        'professional training',
        data.title?.toLowerCase(),
        data.difficulty_level?.toLowerCase(),
        ...(data.skills_taught || []).map((skill: string) => skill.toLowerCase())
      ].filter(Boolean);
      
    default:
      return baseKeywords;
  }
};

// Performance optimization utilities
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);

  // Preload critical images
  const heroImage = new Image();
  heroImage.src = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';
};

// Create XML sitemap for specific content type (fixed type issues)
export const createContentSitemap = async (contentType: 'jobs' | 'companies' | 'courses'): Promise<string> => {
  const baseUrl = 'https://talentxcel.in';
  let urlPath: string;
  
  try {
    let data: any[] = [];
    
    switch (contentType) {
      case 'jobs':
        const { data: jobsData } = await supabase
          .from('jobs')
          .select('id, updated_at')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(5000);
        data = jobsData || [];
        urlPath = '/jobs/';
        break;
        
      case 'companies':
        const { data: companiesData } = await supabase
          .from('companies')
          .select('id, updated_at')
          .order('updated_at', { ascending: false })
          .limit(2000);
        data = companiesData || [];
        urlPath = '/companies/';
        break;
        
      case 'courses':
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, updated_at')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1000);
        data = coursesData || [];
        urlPath = '/learning/courses/';
        break;
        
      default:
        return '';
    }

    if (!data.length) return '';

    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const xmlFooter = '</urlset>';
    
    const xmlUrls = data.map(item => {
      const priority = contentType === 'jobs' ? '0.8' : contentType === 'companies' ? '0.6' : '0.7';
      const changefreq = contentType === 'jobs' ? 'weekly' : contentType === 'companies' ? 'monthly' : 'weekly';
      
      return `  <url>
    <loc>${baseUrl}${urlPath}${item.id}</loc>
    <lastmod>${item.updated_at}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join('\n');

    return `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;
  } catch (error) {
    console.error(`Error generating ${contentType} sitemap:`, error);
    return '';
  }
};
