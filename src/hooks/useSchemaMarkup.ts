// ============= SCHEMA MARKUP HOOK =============
// Comprehensive hook for managing structured data across the application

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  generateJobStructuredData,
  generateOrganizationStructuredData,
  generateCourseStructuredData,
  generatePersonStructuredData,
  generateSoftwareApplicationStructuredData,
  generateArticleStructuredData,
  generateCareerMapStructuredData,
  generateBreadcrumbStructuredData,
  injectStructuredData,
  removeStructuredData
} from '@/utils/structuredData';

import {
  generateFAQStructuredData,
  generateHowToStructuredData,
  generateReviewStructuredData,
  generateEventStructuredData,
  generateVideoStructuredData,
  generateWebsiteStructuredData,
  generateEducationalOrganizationStructuredData,
  generateLocalBusinessStructuredData,
  generateProductStructuredData
} from '@/utils/additionalSchemas';

interface SchemaMarkupOptions {
  pageType: string;
  data?: any;
  breadcrumbs?: Array<{name: string, url: string}>;
  faqs?: Array<{question: string, answer: string}>;
  reviews?: any[];
  events?: any[];
  videos?: any[];
  enableWebsiteSchema?: boolean;
  customSchemas?: Array<{type: string, data: any, id?: string}>;
}

export const useSchemaMarkup = (options: SchemaMarkupOptions) => {
  const location = useLocation();
  const {
    pageType,
    data,
    breadcrumbs = [],
    faqs = [],
    reviews = [],
    events = [],
    videos = [],
    enableWebsiteSchema = true,
    customSchemas = []
  } = options;

  useEffect(() => {
    // Clear existing schemas
    removeAllSchemas();

    // Generate and inject schemas based on page type
    generatePageSchemas();

    // Cleanup function
    return () => {
      removeAllSchemas();
    };
  }, [pageType, data, location.pathname]);

  const generatePageSchemas = () => {
    const schemas: Array<{schema: string, id: string}> = [];

    // Primary page schema
    const primarySchema = generatePrimarySchema(pageType, data);
    if (primarySchema) {
      schemas.push({ schema: primarySchema, id: 'primary' });
    }

    // Breadcrumb schema
    if (breadcrumbs.length > 0) {
      schemas.push({
        schema: generateBreadcrumbStructuredData(breadcrumbs),
        id: 'breadcrumbs'
      });
    }

    // FAQ schema
    if (faqs.length > 0) {
      schemas.push({
        schema: generateFAQStructuredData(faqs),
        id: 'faq'
      });
    }

    // Review schema
    if (reviews.length > 0) {
      schemas.push({
        schema: generateReviewStructuredData(reviews),
        id: 'reviews'
      });
    }

    // Event schemas
    events.forEach((event, index) => {
      schemas.push({
        schema: generateEventStructuredData(event),
        id: `event-${index}`
      });
    });

    // Video schemas
    videos.forEach((video, index) => {
      schemas.push({
        schema: generateVideoStructuredData(video),
        id: `video-${index}`
      });
    });

    // Website schema (for homepage and key pages)
    if (enableWebsiteSchema && (pageType === 'home' || pageType === 'website')) {
      schemas.push({
        schema: generateWebsiteStructuredData(),
        id: 'website'
      });
    }

    // Custom schemas
    customSchemas.forEach((custom, index) => {
      const customSchema = generateCustomSchema(custom.type, custom.data);
      if (customSchema) {
        schemas.push({
          schema: customSchema,
          id: custom.id || `custom-${index}`
        });
      }
    });

    // Inject all schemas
    schemas.forEach(({ schema, id }) => {
      injectStructuredData(schema, id);
    });
  };

  const generatePrimarySchema = (type: string, pageData: any): string | null => {
    if (!pageData && !['home', 'website', 'tools'].includes(type)) {
      return null;
    }

    switch (type) {
      case 'job':
        return generateJobStructuredData(pageData);
      
      case 'company':
      case 'organization':
        return generateOrganizationStructuredData(pageData);
      
      case 'course':
      case 'learning':
        return generateCourseStructuredData(pageData);
      
      case 'person':
      case 'profile':
      case 'user':
        return generatePersonStructuredData(pageData);
      
      case 'tool':
      case 'software':
        return generateSoftwareApplicationStructuredData(pageData || {
          name: 'TalentXcel Tools',
          path: location.pathname
        });
      
      case 'article':
      case 'blog':
        return generateArticleStructuredData(pageData);
      
      case 'career-map':
      case 'roadmap':
        return generateCareerMapStructuredData(pageData);
      
      case 'college':
      case 'university':
      case 'education':
        return generateEducationalOrganizationStructuredData(pageData);
      
      case 'business':
      case 'local':
        return generateLocalBusinessStructuredData(pageData);
      
      case 'product':
      case 'service':
        return generateProductStructuredData(pageData);
      
      case 'home':
      case 'website':
        return generateWebsiteStructuredData();
      
      default:
        return null;
    }
  };

  const generateCustomSchema = (type: string, customData: any): string | null => {
    switch (type) {
      case 'howto':
        return generateHowToStructuredData(customData);
      
      case 'faq':
        return generateFAQStructuredData(customData);
      
      case 'review':
        return generateReviewStructuredData(customData);
      
      case 'event':
        return generateEventStructuredData(customData);
      
      case 'video':
        return generateVideoStructuredData(customData);
      
      default:
        return null;
    }
  };

  const removeAllSchemas = () => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => script.remove());
  };

  const addCustomSchema = (type: string, data: any, id?: string) => {
    const schema = generateCustomSchema(type, data);
    if (schema) {
      injectStructuredData(schema, id || `custom-${Date.now()}`);
    }
  };

  const removeSchema = (id: string) => {
    removeStructuredData(id);
  };

  return {
    addCustomSchema,
    removeSchema,
    generatePageSchemas
  };
};

// Utility hook for common page types
export const usePageSchema = (pageType: string, data?: any, options?: Partial<SchemaMarkupOptions>) => {
  return useSchemaMarkup({
    pageType,
    data,
    ...options
  });
};

// Specialized hooks for different content types
export const useJobSchema = (jobData: any, additionalOptions?: Partial<SchemaMarkupOptions>) => {
  return useSchemaMarkup({
    pageType: 'job',
    data: jobData,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Jobs', url: '/jobs' },
      { name: jobData?.title || 'Job', url: `/jobs/${jobData?.id}` }
    ],
    ...additionalOptions
  });
};

export const useCompanySchema = (companyData: any, additionalOptions?: Partial<SchemaMarkupOptions>) => {
  return useSchemaMarkup({
    pageType: 'company',
    data: companyData,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Companies', url: '/companies' },
      { name: companyData?.name || 'Company', url: `/companies/${companyData?.id}` }
    ],
    ...additionalOptions
  });
};

export const useToolSchema = (toolData?: any, additionalOptions?: Partial<SchemaMarkupOptions>) => {
  return useSchemaMarkup({
    pageType: 'tool',
    data: toolData,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/tools' },
      { name: toolData?.name || 'Tool', url: toolData?.path || '/tools' }
    ],
    ...additionalOptions
  });
};