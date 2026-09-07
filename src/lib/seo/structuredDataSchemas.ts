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
 *    Supports interactionStatistic (likes/comments/shares) and public Comment objects.
 */
export function buildPostSchema(options: {
  headline: string;
  content: string;
  datePublished: string;
  authorName: string;
  authorUrl: string;
  postUrl: string;
  mediaUrls?: string[];
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  publicComments?: Array<{
    authorName: string;
    dateCreated: string;
    text: string;
  }>;
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

  // interactionStatistic — only emit non-zero counts
  const interactions: object[] = [];
  if ((options.likesCount ?? 0) > 0) {
    interactions.push({
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'LikeAction' },
      userInteractionCount: options.likesCount,
    });
  }
  if ((options.commentsCount ?? 0) > 0) {
    interactions.push({
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'CommentAction' },
      userInteractionCount: options.commentsCount,
    });
  }
  if ((options.sharesCount ?? 0) > 0) {
    interactions.push({
      '@type': 'InteractionCounter',
      interactionType: { '@type': 'ShareAction' },
      userInteractionCount: options.sharesCount,
    });
  }
  if (interactions.length > 0) {
    schema.interactionStatistic = interactions;
  }

  // Public Comment objects (top 3–5, non-private, non-deleted)
  if (options.publicComments && options.publicComments.length > 0) {
    schema.comment = options.publicComments.map((c) => ({
      '@type': 'Comment',
      author: {
        '@type': 'Person',
        name: c.authorName,
      },
      dateCreated: c.dateCreated,
      text: c.text.slice(0, 500), // cap per Google guidelines
    }));
  }

  // Image media (video URLs excluded — video goes in VideoObject schema)
  const imageMedia = (options.mediaUrls || []).filter(url => {
    const clean = url.split('?')[0].toLowerCase();
    return !clean.endsWith('.mp4') && !clean.endsWith('.webm') && !clean.endsWith('.mov') && !clean.endsWith('.m4v');
  });
  if (imageMedia.length > 0) {
    schema.image = imageMedia;
  }

  return schema;
}

/**
 * 7. VideoObject Schema Generator (Googlebot-Video & Video Rich Snippets)
 */
export function buildVideoObjectSchema(options: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl: string;
  embedUrl: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: options.name,
    description: options.description,
    thumbnailUrl: [options.thumbnailUrl],
    uploadDate: options.uploadDate,
    contentUrl: options.contentUrl,
    embedUrl: options.embedUrl,
    ...(options.duration ? { duration: options.duration } : {}),
  };
}

/**
 * 8. ImageObject Schema Generator
 *    Use for individual image attachments on posts (Googlebot-Image indexing).
 */
export function buildImageObjectSchema(options: {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
  contentUrl?: string;
}) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: options.url,
    contentUrl: options.contentUrl || options.url,
  };
  if (options.caption) schema.caption = options.caption;
  if (options.width) schema.width = options.width;
  if (options.height) schema.height = options.height;
  return schema;
}
