
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface EnhancedSEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  structuredData?: string;
  breadcrumbs?: { name: string; url: string }[];
  noindex?: boolean;
  canonical?: string;
  type?: 'website' | 'article' | 'profile' | 'organization' | 'jobposting';
  enableAnalytics?: boolean;
  enableAIIndexing?: boolean;
}

export const useEnhancedSEO = (config: EnhancedSEOConfig = {}) => {
  const location = useLocation();

  useEffect(() => {
    const {
      title = 'TalentXcel - AI-Powered Career Platform',
      description = 'Find your dream job, grow your skills, and advance your career with AI-powered tools.',
      keywords = [],
      image = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
      structuredData,
      breadcrumbs = [],
      noindex = false,
      canonical,
      type = 'website',
      enableAnalytics = true,
      enableAIIndexing = true
    } = config;

    // Update page title and meta tags
    document.title = title;

    const updateMetaTag = (property: string, content: string, attribute = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic SEO meta tags
    updateMetaTag('description', description);
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Open Graph meta tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', `https://talentxcel.in${location.pathname}`, 'property');
    updateMetaTag('og:image', image.startsWith('http') ? image : `https://talentxcel.in${image}`, 'property');

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image.startsWith('http') ? image : `https://talentxcel.in${image}`);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical || `https://talentxcel.in${location.pathname}`;

    // Robots meta tag
    updateMetaTag('robots', noindex ? 'noindex,nofollow' : 'index,follow');

    // AI-friendly meta tags
    if (enableAIIndexing) {
      updateMetaTag('x-robots-tag', 'all');
      updateMetaTag('referrer', 'origin-when-cross-origin');
    }

    // Structured data injection
    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = structuredData;
      document.head.appendChild(script);
    }

    // Breadcrumb structured data
    if (breadcrumbs.length > 0) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": `https://talentxcel.in${crumb.url}`
        }))
      };

      const existingBreadcrumbScript = document.querySelector('script[data-type="breadcrumb"]');
      if (existingBreadcrumbScript) {
        existingBreadcrumbScript.remove();
      }

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.setAttribute('data-type', 'breadcrumb');
      breadcrumbScript.textContent = JSON.stringify(breadcrumbData, null, 2);
      document.head.appendChild(breadcrumbScript);
    }

    // Analytics tracking
    if (enableAnalytics && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname,
        page_title: title
      });
    }

    // Performance optimization hints
    const preloadCriticalResources = () => {
      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      fontLink.as = 'style';
      fontLink.onload = () => {
        fontLink.rel = 'stylesheet';
      };
      if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
        document.head.appendChild(fontLink);
      }
    };

    preloadCriticalResources();

  }, [location.pathname, config]);

  return {
    updateSEO: (newConfig: EnhancedSEOConfig) => {
      // This can be used to update SEO dynamically
      const event = new CustomEvent('seo-update', { detail: newConfig });
      window.dispatchEvent(event);
    }
  };
};

// Page-specific SEO configurations
export const getPageSEO = (pageType: string, data?: any): EnhancedSEOConfig => {
  switch (pageType) {
    case 'home':
      return {
        title: 'TalentXcel - AI-Powered Career Platform | Find Jobs, Learn Skills, Network',
        description: 'Accelerate your career with TalentXcel. Find dream jobs, learn new skills, network with professionals, and get AI-powered career guidance. Join 100,000+ professionals.',
        keywords: ['jobs', 'careers', 'learning', 'networking', 'AI career guidance', 'skill development', 'job search', 'professional networking'],
        type: 'website',
        enableAIIndexing: true,
        breadcrumbs: [{ name: 'Home', url: '/' }]
      };

    case 'job':
      return {
        title: data?.title ? `${data.title} - ${data.company} | TalentXcel Jobs` : 'Job Opportunity | TalentXcel',
        description: data?.description || 'Explore this exciting job opportunity and apply with AI-powered tools.',
        keywords: ['job', 'career', 'hiring', 'employment', ...(data?.skills || [])],
        type: 'jobposting',
        structuredData: data ? generateJobStructuredData(data) : undefined,
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Jobs', url: '/jobs' },
          { name: data?.title || 'Job', url: `/jobs/${data?.id}` }
        ]
      };

    case 'company':
      return {
        title: data?.name ? `${data.name} - Company Profile | TalentXcel` : 'Company Profile | TalentXcel',
        description: data?.description || 'Explore company profile, culture, and current job openings.',
        keywords: ['company', 'employer', 'jobs', 'culture', ...(data?.industry ? [data.industry] : [])],
        type: 'organization',
        structuredData: data ? generateCompanyStructuredData(data) : undefined,
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: 'Companies', url: '/companies' },
          { name: data?.name || 'Company', url: `/companies/${data?.id}` }
        ]
      };

    default:
      return {
        enableAIIndexing: true
      };
  }
};

// Structured data generators
const generateJobStructuredData = (job: any) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.posted_at || job.created_at,
    "validThrough": job.expires_at,
    "employmentType": job.employment_type?.toUpperCase(),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company?.name || "TalentXcel Partner",
      "sameAs": job.company?.website,
      "logo": job.company?.logo_url
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    },
    "baseSalary": job.salary_min && job.salary_max ? {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": "YEAR"
      }
    } : undefined
  };

  return JSON.stringify(structuredData, null, 2);
};

const generateCompanyStructuredData = (company: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.name,
    "description": company.description,
    "url": company.website,
    "logo": company.logo_url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": company.location,
      "addressCountry": "IN"
    },
    "industry": company.industry,
    "numberOfEmployees": company.size_range
  };

  return JSON.stringify(structuredData, null, 2);
};
