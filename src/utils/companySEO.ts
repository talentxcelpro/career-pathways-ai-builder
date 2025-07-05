/**
 * SEO utilities for company pages
 */

import { Company } from './companyUrls';

export interface CompanySEOData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  canonicalUrl: string;
}

/**
 * Generate SEO metadata for company pages
 */
export const generateCompanySEO = (
  company: Company & { 
    description?: string; 
    industry?: string; 
    location?: string;
    logo_url?: string;
  },
  baseUrl: string = 'https://talentxcel.in'
): CompanySEOData => {
  const companyUrl = company.slug ? `/${company.slug}` : `/companies/${company.id}`;
  const canonicalUrl = `${baseUrl}${companyUrl}`;
  
  const title = `${company.name} - Company Profile | TalentXcel`;
  const description = company.description 
    ? `${company.description.substring(0, 150)}...`
    : `Explore ${company.name}'s company profile, jobs, and culture on TalentXcel. ${company.industry ? `Industry: ${company.industry}.` : ''} ${company.location ? `Location: ${company.location}.` : ''}`;
  
  const keywords = [
    company.name,
    'company profile',
    'jobs',
    'careers',
    company.industry,
    company.location,
    'TalentXcel'
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    ogTitle: `${company.name} | TalentXcel`,
    ogDescription: description,
    ogImage: company.logo_url,
    canonicalUrl
  };
};

/**
 * Generate structured data (JSON-LD) for company
 */
export const generateCompanyStructuredData = (
  company: Company & {
    description?: string;
    industry?: string;
    location?: string;
    website?: string;
    logo_url?: string;
    founded_year?: number;
    employee_count_range?: string;
  },
  baseUrl: string = 'https://talentxcel.in'
) => {
  const companyUrl = company.slug ? `/${company.slug}` : `/companies/${company.id}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.name,
    "description": company.description,
    "url": company.website,
    "logo": company.logo_url,
    "foundingDate": company.founded_year ? `${company.founded_year}-01-01` : undefined,
    "numberOfEmployees": company.employee_count_range,
    "industry": company.industry,
    "address": company.location ? {
      "@type": "PostalAddress",
      "addressLocality": company.location
    } : undefined,
    "sameAs": `${baseUrl}${companyUrl}`
  };
};