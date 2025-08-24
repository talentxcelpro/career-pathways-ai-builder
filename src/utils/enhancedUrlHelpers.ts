/**
 * Enhanced URL helper functions for 2M SEO pages
 * Supports hierarchical URL structure for all 10 categories
 */

import { slugify } from './seoUrls';

// Base URL configuration
const BASE_URL = 'https://talentxcel.in';

// ============= JOBS URL GENERATORS =============

export const generateJobUrl = (params: {
  type: string;
  location?: string;
  role?: string;
  skill?: string;
}): string => {
  const { type, location, role, skill } = params;
  
  if (skill && location) {
    return `/jobs/skill/${slugify(skill)}/${slugify(location)}`;
  }
  
  if (type && location && role) {
    return `/jobs/${slugify(type)}/${slugify(location)}/${slugify(role)}`;
  }
  
  if (type && location) {
    return `/jobs/${slugify(type)}/${slugify(location)}`;
  }
  
  if (type === 'remote' && role) {
    return `/jobs/remote/${slugify(role)}`;
  }
  
  return `/jobs/${slugify(type)}`;
};

// ============= NETWORK URL GENERATORS =============

export const generateNetworkUrl = (params: {
  category: string;
  topic?: string;
}): string => {
  const { category, topic } = params;
  
  if (category && topic) {
    return `/network/${slugify(category)}/${slugify(topic)}`;
  }
  
  return `/network/${slugify(category)}`;
};

// ============= TOOLS URL GENERATORS =============

export const generateToolUrl = (params: {
  category: string;
  toolName?: string;
  template?: string;
}): string => {
  const { category, toolName, template } = params;
  
  if (template && category === 'resume-builder') {
    return `/tools/resume-builder/${slugify(template)}`;
  }
  
  if (category && toolName) {
    return `/tools/${slugify(category)}/${slugify(toolName)}`;
  }
  
  return `/tools/${slugify(category)}`;
};

// ============= SERVICES URL GENERATORS =============

export const generateServiceUrl = (params: {
  type: string;
  serviceName?: string;
  template?: string;
}): string => {
  const { type, serviceName, template } = params;
  
  if (template && type === 'resume-writing') {
    return `/services/resume-writing/${slugify(template)}`;
  }
  
  if (type && serviceName) {
    return `/services/${slugify(type)}/${slugify(serviceName)}`;
  }
  
  return `/services/${slugify(type)}`;
};

// ============= LEARNING URL GENERATORS =============

export const generateLearningUrl = (params: {
  category?: string;
  courseName?: string;
  skill?: string;
}): string => {
  const { category, courseName, skill } = params;
  
  if (skill) {
    return `/learning/paths/${slugify(skill)}`;
  }
  
  if (category && courseName) {
    return `/learning/${slugify(category)}/${slugify(courseName)}`;
  }
  
  if (category) {
    return `/learning/${slugify(category)}`;
  }
  
  return '/learning';
};

// ============= COLLEGES URL GENERATORS =============

export const generateCollegeUrl = (params: {
  location: string;
  collegeName?: string;
  field?: string;
}): string => {
  const { location, collegeName, field } = params;
  
  if (location && field) {
    return `/colleges/${slugify(location)}/${slugify(field)}`;
  }
  
  if (location && collegeName) {
    return `/colleges/${slugify(location)}/${slugify(collegeName)}`;
  }
  
  return `/colleges/${slugify(location)}`;
};

// ============= CAREER MAP URL GENERATORS =============

export const generateCareerMapUrl = (params: {
  industry?: string;
  path?: string;
  role?: string;
}): string => {
  const { industry, path, role } = params;
  
  if (role) {
    return `/career-map/progression/${slugify(role)}`;
  }
  
  if (industry && path) {
    return `/career-map/${slugify(industry)}/${slugify(path)}`;
  }
  
  if (industry) {
    return `/career-map/${slugify(industry)}`;
  }
  
  return '/career-map';
};

// ============= COMPANIES URL GENERATORS =============

export const generateCompanyUrl = (params: {
  location?: string;
  industry?: string;
  size?: string;
}): string => {
  const { location, industry, size } = params;
  
  if (size && location) {
    return `/companies/size/${slugify(size)}/${slugify(location)}`;
  }
  
  if (location && industry) {
    return `/companies/${slugify(location)}/${slugify(industry)}`;
  }
  
  if (location) {
    return `/companies/location/${slugify(location)}`;
  }
  
  return '/companies';
};

// ============= EMPLOYER URL GENERATORS =============

export const generateEmployerUrl = (params: {
  topic: string;
}): string => {
  const { topic } = params;
  return `/employer/resources/${slugify(topic)}`;
};

// ============= URL PARSING UTILITIES =============

export const parseEnhancedUrl = (url: string): {
  category: string;
  type?: string;
  params: Record<string, string>;
} => {
  const pathParts = url.split('/').filter(Boolean);
  const category = pathParts[0];
  
  switch (category) {
    case 'jobs':
      if (pathParts[1] === 'skill') {
        return {
          category: 'jobs',
          type: 'skill-location',
          params: { skill: pathParts[2], location: pathParts[3] }
        };
      }
      if (pathParts[1] === 'remote') {
        return {
          category: 'jobs',
          type: 'remote-role',
          params: { role: pathParts[2] }
        };
      }
      return {
        category: 'jobs',
        type: 'type-location-role',
        params: { 
          type: pathParts[1], 
          location: pathParts[2], 
          role: pathParts[3] 
        }
      };
      
    case 'network':
      return {
        category: 'network',
        type: 'category-topic',
        params: { category: pathParts[1], topic: pathParts[2] }
      };
      
    case 'tools':
      return {
        category: 'tools',
        type: 'category-tool',
        params: { category: pathParts[1], toolName: pathParts[2] }
      };
      
    case 'services':
      return {
        category: 'services',
        type: 'type-service',
        params: { type: pathParts[1], serviceName: pathParts[2] }
      };
      
    case 'learning':
      if (pathParts[1] === 'paths') {
        return {
          category: 'learning',
          type: 'paths-skill',
          params: { skill: pathParts[2] }
        };
      }
      return {
        category: 'learning',
        type: 'category-course',
        params: { category: pathParts[1], courseName: pathParts[2] }
      };
      
    case 'colleges':
      return {
        category: 'colleges',
        type: 'location-college',
        params: { location: pathParts[1], collegeName: pathParts[2] }
      };
      
    case 'career-map':
      if (pathParts[1] === 'progression') {
        return {
          category: 'career-map',
          type: 'progression-role',
          params: { role: pathParts[2] }
        };
      }
      return {
        category: 'career-map',
        type: 'industry-path',
        params: { industry: pathParts[1], path: pathParts[2] }
      };
      
    case 'companies':
      if (pathParts[1] === 'size') {
        return {
          category: 'companies',
          type: 'size-location',
          params: { size: pathParts[2], location: pathParts[3] }
        };
      }
      return {
        category: 'companies',
        type: 'location-industry',
        params: { location: pathParts[1], industry: pathParts[2] }
      };
      
    default:
      return {
        category: 'unknown',
        params: {}
      };
  }
};

// ============= CANONICAL URL GENERATORS =============

export const getCanonicalUrl = (path: string): string => {
  return `${BASE_URL}${path}`;
};

export const generatePaginationUrl = (
  basePath: string, 
  page: number, 
  filters?: Record<string, string>
): string => {
  const url = new URL(`${BASE_URL}${basePath}`);
  
  if (page > 1) {
    url.searchParams.set('page', page.toString());
  }
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  
  return url.pathname + url.search;
};

// ============= SEO URL VALIDATION =============

export const isValidSEOUrl = (url: string): boolean => {
  const validPrefixes = [
    '/jobs/', '/network/', '/tools/', '/services/',
    '/learning/', '/colleges/', '/career-map/', '/companies/', '/employer/'
  ];
  
  return validPrefixes.some(prefix => url.startsWith(prefix));
};

// ============= URL GENERATION FOR CONTENT TYPES =============

export const generateContentUrls = (contentType: string, count: number = 200000): string[] => {
  const urls: string[] = [];
  
  // Sample data for URL generation
  const locations = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad'];
  const roles = ['software-engineer', 'data-scientist', 'product-manager', 'ui-ux-designer', 'business-analyst'];
  const skills = ['javascript', 'python', 'react', 'nodejs', 'machine-learning', 'sql', 'aws', 'docker'];
  const types = ['full-time', 'part-time', 'contract', 'internship'];
  const categories = ['technology', 'healthcare', 'finance', 'education', 'marketing'];
  
  switch (contentType) {
    case 'jobs':
      // Generate job URLs
      types.forEach(type => {
        locations.forEach(location => {
          roles.forEach(role => {
            if (urls.length < count) {
              urls.push(generateJobUrl({ type, location, role }));
            }
          });
        });
      });
      break;
      
    case 'tools':
      // Generate tool URLs
      categories.forEach(category => {
        skills.forEach(skill => {
          if (urls.length < count) {
            urls.push(generateToolUrl({ category, toolName: skill }));
          }
        });
      });
      break;
      
    // Add more cases for other content types...
  }
  
  return urls.slice(0, count);
};

export { slugify };