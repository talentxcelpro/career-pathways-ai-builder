import React from 'react';
import { useStructuredData } from '@/hooks/useStructuredData';
import {
  generateJobStructuredData,
  generateOrganizationStructuredData,
  generateCourseStructuredData,
  generatePersonStructuredData,
  generateSoftwareApplicationStructuredData,
  generateArticleStructuredData,
  generateCareerMapStructuredData,
  generateBreadcrumbStructuredData
} from '@/utils/structuredData';

interface StructuredDataProviderProps {
  type: 'job' | 'company' | 'course' | 'person' | 'tool' | 'article' | 'career-map' | 'breadcrumb';
  data: any;
  breadcrumbs?: Array<{name: string, url: string}>;
  children?: React.ReactNode;
}

export const StructuredDataProvider: React.FC<StructuredDataProviderProps> = ({
  type,
  data,
  breadcrumbs,
  children
}) => {
  let schema = '';
  let schemaId = `structured-data-${type}`;

  switch (type) {
    case 'job':
      schema = generateJobStructuredData(data);
      schemaId = `structured-data-job-${data.id}`;
      break;
    case 'company':
      schema = generateOrganizationStructuredData(data);
      schemaId = `structured-data-company-${data.id}`;
      break;
    case 'course':
      schema = generateCourseStructuredData(data);
      schemaId = `structured-data-course-${data.id}`;
      break;
    case 'person':
      schema = generatePersonStructuredData(data);
      schemaId = `structured-data-person-${data.id}`;
      break;
    case 'tool':
      schema = generateSoftwareApplicationStructuredData(data);
      schemaId = `structured-data-tool-${data.slug || 'default'}`;
      break;
    case 'article':
      schema = generateArticleStructuredData(data);
      schemaId = `structured-data-article-${data.id}`;
      break;
    case 'career-map':
      schema = generateCareerMapStructuredData(data);
      schemaId = `structured-data-career-map-${data.id || 'default'}`;
      break;
    case 'breadcrumb':
      schema = generateBreadcrumbStructuredData(data);
      schemaId = 'structured-data-breadcrumb';
      break;
  }

  // Inject primary schema
  useStructuredData({ schema, id: schemaId });

  // Inject breadcrumb schema if provided
  React.useEffect(() => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = generateBreadcrumbStructuredData(breadcrumbs);
      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = 'structured-data-breadcrumb';
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = breadcrumbSchema;

      // Remove existing breadcrumb schema
      const existing = document.getElementById('structured-data-breadcrumb');
      if (existing) existing.remove();

      document.head.appendChild(breadcrumbScript);

      return () => {
        const script = document.getElementById('structured-data-breadcrumb');
        if (script) script.remove();
      };
    }
  }, [breadcrumbs]);

  return <>{children}</>;
};

// Convenience components for specific types
export const JobStructuredData: React.FC<{job: any, breadcrumbs?: Array<{name: string, url: string}>}> = ({job, breadcrumbs}) => (
  <StructuredDataProvider type="job" data={job} breadcrumbs={breadcrumbs} />
);

export const CompanyStructuredData: React.FC<{company: any, breadcrumbs?: Array<{name: string, url: string}>}> = ({company, breadcrumbs}) => (
  <StructuredDataProvider type="company" data={company} breadcrumbs={breadcrumbs} />
);

export const CourseStructuredData: React.FC<{course: any, breadcrumbs?: Array<{name: string, url: string}>}> = ({course, breadcrumbs}) => (
  <StructuredDataProvider type="course" data={course} breadcrumbs={breadcrumbs} />
);

export const PersonStructuredData: React.FC<{person: any, breadcrumbs?: Array<{name: string, url: string}>}> = ({person, breadcrumbs}) => (
  <StructuredDataProvider type="person" data={person} breadcrumbs={breadcrumbs} />
);

export const ToolStructuredData: React.FC<{tool: any, breadcrumbs?: Array<{name: string, url: string}>}> = ({tool, breadcrumbs}) => (
  <StructuredDataProvider type="tool" data={tool} breadcrumbs={breadcrumbs} />
);

export const ArticleStructuredData: React.FC<{article: any, breadcrumbs?: Array<{name: string, url: string}>}> = ({article, breadcrumbs}) => (
  <StructuredDataProvider type="article" data={article} breadcrumbs={breadcrumbs} />
);

export const CareerMapStructuredData: React.FC<{careerMap: any, breadcrumbs?: Array<{name: string, url: string}>}> = ({careerMap, breadcrumbs}) => (
  <StructuredDataProvider type="career-map" data={careerMap} breadcrumbs={breadcrumbs} />
);

export const BreadcrumbStructuredData: React.FC<{breadcrumbs: Array<{name: string, url: string}>}> = ({breadcrumbs}) => (
  <StructuredDataProvider type="breadcrumb" data={breadcrumbs} />
);