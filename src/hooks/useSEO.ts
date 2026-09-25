
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  generateKeywords, 
  generateBreadcrumbStructuredData,
  preloadCriticalResources 
} from '@/utils/seoOptimization';
import { updateMetaTags } from '@/utils/metaTags';
import { injectStructuredData } from '@/utils/structuredData';
import { generateMetaDescription, validateMetaTags } from '@/utils/seoValidator';
import { DEFAULT_TITLE, absoluteUrl, canonicalFor, isNoindexPath } from '@/config/seo';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  structuredData?: string;
  breadcrumbs?: { name: string; url: string }[];
  noindex?: boolean;
  canonical?: string;
}

export const useSEO = (config: SEOConfig = {}) => {
  const location = useLocation();

  useEffect(() => {
    // Preload critical resources on first load
    preloadCriticalResources();
  }, []);

  useEffect(() => {
    const {
      title = DEFAULT_TITLE,
      description,
      keywords = [],
      image = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
      structuredData,
      breadcrumbs = [],
      noindex = false,
      canonical
    } = config;

    // Generate fallback description if not provided
    const pageType = location.pathname.split('/')[1] || 'home';
    const finalDescription = description || generateMetaDescription(pageType);

    // Validate SEO elements
    const validation = validateMetaTags(title, finalDescription, keywords);
    if (!validation.isValid) {
      console.warn('SEO Validation Issues:', validation.issues);
    }

    // Update page title and meta tags
    document.title = title;
    updateMetaTags({
      title,
      description: finalDescription,
      image: absoluteUrl(image),
      url: canonicalFor(location.pathname),
      type: 'website',
      keywords
    });

    // Keywords are now handled in updateMetaTags

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalFor(canonical || location.pathname);

    // Update robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = noindex || isNoindexPath(location.pathname) ? 'noindex,nofollow' : 'index,follow';

    // Inject structured data
    if (structuredData) {
      injectStructuredData(structuredData);
    } else if (breadcrumbs.length > 0) {
      const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);
      injectStructuredData(breadcrumbData);
    }

  }, [location.pathname, config]);

  return {
    updateSEO: (newConfig: SEOConfig) => {
      // This can be used to update SEO dynamically
      const event = new CustomEvent('seo-update', { detail: newConfig });
      window.dispatchEvent(event);
    }
  };
};

// Custom hook for page-specific SEO
export const usePageSEO = (pageType: string, data?: any) => {
  const location = useLocation();

  const getSEOConfig = (): SEOConfig => {
    switch (pageType) {
      case 'home':
        return {
          title: 'TalentXcel — The Global Professional Talent Network',
          description: 'Connect with Tech & Leadership Professionals worldwide across UAE, Europe, the Americas, and Asia. Build your Career Passport, get verified by TalentScore, discover global opportunities, and let top hiring teams discover you.',
          keywords: ['global talent network', 'career passport', 'talentscore', 'tech leadership network', 'remote tech jobs', 'hire developers uae', 'software engineering europe', 'recruiter os'],
          breadcrumbs: [{ name: 'Home', url: '/' }]
        };

      case 'jobs':
        return {
          title: data?.location 
            ? `Jobs in ${data.location} | Latest ${data.location} Job Openings | TalentXcel`
            : 'Global Job Openings — UAE, Europe, Americas, Asia | TalentXcel Jobs',
          description: data?.location
            ? `Find verified job opportunities in ${data.location}. Latest openings in Software, AI, Cloud, Product, and Leadership. Apply now and get discovered by top hiring teams.`
            : 'Discover thousands of verified career opportunities worldwide across UAE, Europe, the Americas, and Asia. Apply with one click and let global recruiters discover your Career Passport.',
          keywords: data?.location 
            ? [`jobs in ${data.location.toLowerCase()}`, `${data.location.toLowerCase()} jobs`, 'global job openings', 'career opportunities', 'hiring', 'employment']
            : ['global jobs', 'tech jobs uae', 'software engineering europe', 'us remote jobs', 'career opportunities', 'hiring', 'recruitment'],
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Jobs', url: '/jobs' }
          ]
        };

      case 'companies':
        return {
          title: 'Top Global Companies Hiring Worldwide | Company Profiles | TalentXcel',
          description: 'Explore top companies hiring worldwide across UAE, Europe, the Americas, and Asia. Get insights into company culture, global salaries, engineering stacks, and active job openings.',
          keywords: ['global tech companies', 'companies hiring remote', 'uae enterprise employers', 'tech startups europe', 'hiring companies'],
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Companies', url: '/companies' }
          ]
        };

      case 'learning':
        return {
          title: 'Free Online Courses & Skill Development | TalentXcel Learning',
          description: 'Learn new skills with free online courses. Programming, Data Science, Digital Marketing, AI/ML, and more. Get certified and boost your career prospects.',
          keywords: ['online courses', 'free courses', 'skill development', 'programming courses', 'data science', 'certification', 'upskilling'],
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Learning', url: '/learning' }
          ]
        };

      case 'network':
        return {
          title: 'Global Professional Talent Network | Connect with Leaders & Mentors | TalentXcel',
          description: 'Build your professional identity on the global talent network. Connect with engineering leaders and mentors worldwide across UAE, Europe, Americas, and Asia.',
          keywords: ['global professional network', 'tech leaders', 'mentorship', 'career network', 'professional connections'],
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Network', url: '/network' }
          ]
        };

      default:
        return {
          title: 'TalentXcel - AI-Powered Career Platform',
          description: 'Accelerate your career with AI-powered tools and comprehensive career resources.',
          keywords: ['careers', 'jobs', 'professional development']
        };
    }
  };

  useSEO(getSEOConfig());
};
