import React, { useEffect } from 'react';
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
  injectMultipleStructuredData
} from '@/utils/structuredData';

interface StructuredDataManagerProps {
  pageType: 'job' | 'company' | 'course' | 'user' | 'tool' | 'article' | 'career-map' | 'home';
  data?: any;
  breadcrumbs?: Array<{name: string, url: string}>;
}

export const StructuredDataManager: React.FC<StructuredDataManagerProps> = ({
  pageType,
  data,
  breadcrumbs
}) => {
  const location = useLocation();

  useEffect(() => {
    const structuredDataArray: Array<{data: string, id?: string}> = [];

    // Add page-specific structured data
    switch (pageType) {
      case 'job':
        if (data) {
          structuredDataArray.push({
            data: generateJobStructuredData(data),
            id: 'job-posting'
          });
        }
        break;
      
      case 'company':
        if (data) {
          structuredDataArray.push({
            data: generateOrganizationStructuredData(data),
            id: 'organization'
          });
        }
        break;
      
      case 'course':
        if (data) {
          structuredDataArray.push({
            data: generateCourseStructuredData(data),
            id: 'course'
          });
        }
        break;
      
      case 'user':
        if (data) {
          structuredDataArray.push({
            data: generatePersonStructuredData(data),
            id: 'person'
          });
        }
        break;
      
      case 'tool':
        structuredDataArray.push({
          data: generateSoftwareApplicationStructuredData(data || {
            name: 'TalentXcel AI Tools',
            path: location.pathname
          }),
          id: 'software-application'
        });
        break;
      
      case 'article':
        if (data) {
          structuredDataArray.push({
            data: generateArticleStructuredData(data),
            id: 'article'
          });
        }
        break;
      
      case 'career-map':
        if (data) {
          structuredDataArray.push({
            data: generateCareerMapStructuredData(data),
            id: 'career-map'
          });
        }
        break;
      
      case 'home':
        // Organization schema for homepage
        structuredDataArray.push({
          data: generateOrganizationStructuredData({
            name: 'TalentXcel',
            description: 'AI-powered career platform helping professionals advance their careers through intelligent job matching, resume optimization, and skill development.',
            website: 'https://talentxcel.in',
            logo_url: 'https://talentxcel.in/logo.png',
            location: 'India',
            industry: 'Technology',
            founded_year: 2024
          }),
          id: 'organization'
        });
        break;
    }

    // Add breadcrumb structured data if provided
    if (breadcrumbs && breadcrumbs.length > 0) {
      structuredDataArray.push({
        data: generateBreadcrumbStructuredData(breadcrumbs),
        id: 'breadcrumb'
      });
    }

    // Inject all structured data
    if (structuredDataArray.length > 0) {
      injectMultipleStructuredData(structuredDataArray);
    }
  }, [pageType, data, breadcrumbs, location.pathname]);

  return null; // This component doesn't render anything
};