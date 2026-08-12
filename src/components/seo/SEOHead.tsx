import React, { useEffect } from 'react';
import { updateMetaTags } from '@/utils/metaTags';
import { injectStructuredData } from '@/utils/structuredData';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, absoluteUrl, canonicalFor, isNoindexPath } from '@/config/seo';

export interface SEOHeadProps {
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
  noIndex?: boolean; // Backwards-compatibility alias for noindex
  nofollow?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
  url,
  type = 'website',
  structuredData,
  keywords = ['jobs', 'careers', 'learning', 'networking', 'AI', 'career development', 'skills', 'resume', 'interview prep'],
  author = 'TalentXcel',
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
  noIndex = false,
  nofollow = false,
}) => {
  const isNoIndexEffective = noindex || noIndex;

  useEffect(() => {
    // 1. Title & Meta Description & OG/Twitter Core
    updateMetaTags({
      title,
      description,
      image: absoluteUrl(image),
      url: canonicalFor(url || window.location.pathname),
      type: type === 'jobposting' ? 'article' : type,
    });

    const updateMetaTag = (property: string, content: string, attribute = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 2. Additional Meta Information
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    updateMetaTag('author', author);
    updateMetaTag('og:site_name', 'TalentXcel', 'property');
    updateMetaTag('og:locale', 'en_IN', 'property');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@talentxcel');

    // 3. Article Metadata
    if (type === 'article' || type === 'jobposting') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, 'property');
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, 'property');
      }
      updateMetaTag('article:author', author, 'property');
    }

    // 4. Canonical Link (Resolves to primary domain https://talentxcel.in/)
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalFor(canonical || url || window.location.pathname);

    // 5. Robots Directives
    const robotsContent = [];
    if (isNoIndexEffective || isNoindexPath(window.location.pathname)) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) {
      robotsContent.push('index', 'follow');
    }
    updateMetaTag('robots', robotsContent.join(', '));

    // 6. Safe Structured Data Injection (Preserves existing global Organization/WebSite JSON-LD)
    if (structuredData) {
      injectStructuredData(structuredData);
    }
  }, [
    title,
    description,
    image,
    url,
    type,
    structuredData,
    keywords,
    author,
    publishedTime,
    modifiedTime,
    canonical,
    isNoIndexEffective,
    nofollow,
  ]);

  return null;
};

export default SEOHead;
