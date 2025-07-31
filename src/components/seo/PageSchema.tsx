// ============= PAGE-SPECIFIC SCHEMA COMPONENT =============
// Easy-to-use component for adding schema to individual pages

import React, { useEffect } from 'react';
import { useSchemaMarkup } from '@/hooks/useSchemaMarkup';

interface PageSchemaProps {
  pageType: string;
  data?: any;
  breadcrumbs?: Array<{name: string, url: string}>;
  faqs?: Array<{question: string, answer: string}>;
  reviews?: any[];
  events?: any[];
  videos?: any[];
  customSchemas?: Array<{type: string, data: any, id?: string}>;
  enableWebsiteSchema?: boolean;
}

export const PageSchema: React.FC<PageSchemaProps> = ({
  pageType,
  data,
  breadcrumbs = [],
  faqs = [],
  reviews = [],
  events = [],
  videos = [],
  customSchemas = [],
  enableWebsiteSchema = false
}) => {
  const { generatePageSchemas } = useSchemaMarkup({
    pageType,
    data,
    breadcrumbs,
    faqs,
    reviews,
    events,
    videos,
    customSchemas,
    enableWebsiteSchema
  });

  useEffect(() => {
    generatePageSchemas();
  }, [pageType, data]);

  return null; // This component doesn't render anything
};

// Pre-configured components for common page types
export const JobPageSchema: React.FC<{
  jobData: any;
  breadcrumbs?: Array<{name: string, url: string}>;
  faqs?: Array<{question: string, answer: string}>;
}> = ({ jobData, breadcrumbs, faqs }) => (
  <PageSchema 
    pageType="job" 
    data={jobData} 
    breadcrumbs={breadcrumbs || [
      { name: 'Home', url: '/' },
      { name: 'Jobs', url: '/jobs' },
      { name: jobData?.title || 'Job', url: `/jobs/${jobData?.id}` }
    ]}
    faqs={faqs}
  />
);

export const CompanyPageSchema: React.FC<{
  companyData: any;
  breadcrumbs?: Array<{name: string, url: string}>;
  reviews?: any[];
}> = ({ companyData, breadcrumbs, reviews }) => (
  <PageSchema 
    pageType="company" 
    data={companyData} 
    breadcrumbs={breadcrumbs || [
      { name: 'Home', url: '/' },
      { name: 'Companies', url: '/companies' },
      { name: companyData?.name || 'Company', url: `/companies/${companyData?.id}` }
    ]}
    reviews={reviews}
  />
);

export const ToolPageSchema: React.FC<{
  toolData?: any;
  breadcrumbs?: Array<{name: string, url: string}>;
  faqs?: Array<{question: string, answer: string}>;
}> = ({ toolData, breadcrumbs, faqs }) => (
  <PageSchema 
    pageType="tool" 
    data={toolData} 
    breadcrumbs={breadcrumbs || [
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/tools' },
      { name: toolData?.name || 'AI Tools', url: toolData?.path || '/tools' }
    ]}
    faqs={faqs}
  />
);

export const ProfilePageSchema: React.FC<{
  profileData: any;
  breadcrumbs?: Array<{name: string, url: string}>;
}> = ({ profileData, breadcrumbs }) => (
  <PageSchema 
    pageType="person" 
    data={profileData} 
    breadcrumbs={breadcrumbs || [
      { name: 'Home', url: '/' },
      { name: 'Network', url: '/network' },
      { name: profileData?.full_name || 'Profile', url: `/network/${profileData?.id}` }
    ]}
  />
);

export const CoursePageSchema: React.FC<{
  courseData: any;
  breadcrumbs?: Array<{name: string, url: string}>;
  reviews?: any[];
}> = ({ courseData, breadcrumbs, reviews }) => (
  <PageSchema 
    pageType="course" 
    data={courseData} 
    breadcrumbs={breadcrumbs || [
      { name: 'Home', url: '/' },
      { name: 'Learning', url: '/learning' },
      { name: courseData?.title || 'Course', url: `/learning/${courseData?.id}` }
    ]}
    reviews={reviews}
  />
);

export const BlogPageSchema: React.FC<{
  articleData: any;
  breadcrumbs?: Array<{name: string, url: string}>;
}> = ({ articleData, breadcrumbs }) => (
  <PageSchema 
    pageType="article" 
    data={articleData} 
    breadcrumbs={breadcrumbs || [
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: articleData?.title || 'Article', url: `/blog/${articleData?.slug || articleData?.id}` }
    ]}
  />
);