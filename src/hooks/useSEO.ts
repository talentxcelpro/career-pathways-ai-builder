
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
          title: 'TalentXcel - AI-Powered Career Platform | Find Jobs, Learn Skills, Network',
          description: 'Accelerate your career with TalentXcel. Find dream jobs, learn new skills, network with professionals, and get AI-powered career guidance. Join 50,000+ professionals.',
          keywords: ['jobs', 'careers', 'learning', 'networking', 'AI career guidance', 'skill development', 'job search', 'professional networking'],
          breadcrumbs: [{ name: 'Home', url: '/' }]
        };

      case 'jobs':
        return {
          title: data?.location 
            ? `Jobs in ${data.location} | Latest ${data.location} Job Openings | TalentXcel`
            : 'Latest Job Openings in India | TalentXcel Jobs',
          description: data?.location
            ? `Find the best job opportunities in ${data.location}. Latest openings in IT, Finance, Marketing, Healthcare, and more. Apply now and get hired faster.`
            : 'Discover thousands of job opportunities across India. Latest openings in IT, Finance, Marketing, Healthcare, and more. Apply with one click and get hired faster.',
          keywords: data?.location 
            ? [`jobs in ${data.location.toLowerCase()}`, `${data.location.toLowerCase()} jobs`, 'job openings', 'career opportunities', 'hiring', 'employment']
            : ['jobs in india', 'job openings', 'career opportunities', 'hiring', 'employment', 'job search', 'recruitment'],
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Jobs', url: '/jobs' }
          ]
        };

      case 'companies':
        return {
          title: 'Top Companies Hiring in India | Company Profiles | TalentXcel',
          description: 'Explore top companies hiring in India. Get insights into company culture, salaries, interview processes, and current job openings. Make informed career decisions.',
          keywords: ['top companies india', 'company profiles', 'employer reviews', 'company culture', 'hiring companies'],
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
          title: 'Professional Network | Connect with Industry Experts | TalentXcel',
          description: 'Build your professional network. Connect with industry experts, join professional groups, attend virtual events, and advance your career through meaningful connections.',
          keywords: ['professional networking', 'industry experts', 'career networking', 'professional connections', 'industry events'],
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
