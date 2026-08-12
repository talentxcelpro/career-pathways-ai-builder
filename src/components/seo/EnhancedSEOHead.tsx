import React, { useEffect } from 'react';
import { SEOHead } from './SEOHead';
import { injectStructuredData } from '@/utils/structuredData';

export interface EnhancedSEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'organization' | 'jobposting';
  structuredData?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  breadcrumbs?: { name: string; url: string }[];
  hreflang?: { [key: string]: string };
}

/**
 * EnhancedSEOHead component — delegates to canonical SEOHead component.
 * Preserves all document-level JSON-LD (never deletes script[type="application/ld+json"]).
 */
export const EnhancedSEOHead: React.FC<EnhancedSEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = 'website',
  structuredData,
  keywords,
  author,
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
  nofollow = false,
  breadcrumbs = [],
}) => {
  useEffect(() => {
    // Inject Breadcrumb List without destroying sitewide JSON-LD
    if (breadcrumbs.length > 0) {
      const breadcrumbData = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url.startsWith('http') ? crumb.url : `https://talentxcel.in${crumb.url}`
        }))
      });
      injectStructuredData(breadcrumbData);
    }
  }, [breadcrumbs]);

  return (
    <SEOHead
      title={title}
      description={description}
      image={image}
      url={url}
      type={type}
      structuredData={structuredData}
      keywords={keywords}
      author={author}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      canonical={canonical}
      noindex={noindex}
      nofollow={nofollow}
    />
  );
};

export default EnhancedSEOHead;
