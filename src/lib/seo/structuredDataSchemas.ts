// src/lib/seo/structuredDataSchemas.ts
// Authoritative Schema.org Structured Data Generator for TalentXcel
// Complies 100% with Google Search Essentials (Zero nulls, Zero empty strings, Zero fabricated fields).

import { BASE_PRODUCTION_ORIGIN } from './canonicalUrls';

/**
 * 1. Authoritative Organization Schema for TalentXcel
 */
export function buildTalentXcelOrganizationSchema(canonicalUrl: string = `${BASE_PRODUCTION_ORIGIN}/company/talentxcel`) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_PRODUCTION_ORIGIN}/#organization`,
    name: 'TalentXcel Services Pvt Ltd',
    alternateName: ['TalentXcel', 'TalentXcel Services'],
    url: BASE_PRODUCTION_ORIGIN,
    logo: {
      '@type': 'ImageObject',
      '@id': `${BASE_PRODUCTION_ORIGIN}/#logo`,
      url: `${BASE_PRODUCTION_ORIGIN}/talentxcel-official-logo.png`,
      caption: 'TalentXcel Official Logo',
    },
    image: `${BASE_PRODUCTION_ORIGIN}/talentxcel-official-logo.png`,
    description: 'TalentXcel is an AI-powered career operating system, recruitment platform, and professional growth ecosystem connecting job seekers, employers, and higher education institutions.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    sameAs: [
      'https://talentxcel.in',
      'https://talentxcel.com',
      'https://linkedin.com/company/talentxcel',
      'https://twitter.com/talentxcel',
    ],
    knowsAbout: [
      'Artificial Intelligence Recruitment',
      'Corporate Staffing & RPO',
      'ATS Resume Optimization',
      'Higher Education Career Pathways',
      'IT Systems Consulting',
      'Executive Search',
      'Skill Verification & Career Passport',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${BASE_PRODUCTION_ORIGIN}/contact`,
    },
  };
}

/**
 * 2. BreadcrumbList Schema Generator
 */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 3. WebPage Schema Generator
 */
export function buildWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  breadcrumbUrl?: string;
  aboutOrgId?: string;
}) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${options.url}#webpage`,
    name: options.name,
    description: options.description,
    url: options.url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_PRODUCTION_ORIGIN}/#website`,
      name: 'TalentXcel',
      url: BASE_PRODUCTION_ORIGIN,
    },
  };

  if (options.aboutOrgId) {
    schema.about = { '@id': options.aboutOrgId };
  }

  return schema;
}

/**
 * 4. Service Schema Generator
 */
export function buildServiceSchema(options: {
  name: string;
  description: string;
  serviceType: string;
  url: string;
  areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: options.name,
    description: options.description,
    serviceType: options.serviceType,
    url: options.url,
    provider: {
      '@id': `${BASE_PRODUCTION_ORIGIN}/#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: options.areaServed || 'India',
    },
  };
}

/**
 * 5. FAQPage Schema Generator (Only for visible FAQ sections)
 */
export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 6. SocialMediaPosting / Article Schema Generator
 */
export function buildPostSchema(options: {
  headline: string;
  content: string;
  datePublished: string;
  authorName: string;
  authorUrl: string;
  postUrl: string;
  mediaUrls?: string[];
}) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline: options.headline,
    articleBody: options.content,
    datePublished: options.datePublished,
    dateModified: options.datePublished,
    author: {
      '@type': 'Person',
      name: options.authorName,
      url: options.authorUrl,
    },
    publisher: {
      '@id': `${BASE_PRODUCTION_ORIGIN}/#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': options.postUrl,
    },
  };

  if (options.mediaUrls && options.mediaUrls.length > 0) {
    schema.image = options.mediaUrls;
  }

  return schema;
}
