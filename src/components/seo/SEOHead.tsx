
import React, { useEffect } from 'react';
import { updateMetaTags } from '@/utils/metaTags';
import { injectStructuredData } from '@/utils/structuredData';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, absoluteUrl, canonicalFor, isNoindexPath } from '@/config/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile' | 'organization';
  structuredData?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  noindex?: boolean;
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
  nofollow = false,
}) => {
  useEffect(() => {
    // Update meta tags
    updateMetaTags({
      title,
      description,
      image: absoluteUrl(image),
      url: canonicalFor(url || window.location.pathname),
      type,
    });

    // Update additional meta tags
    const updateMetaTag = (property: string, content: string, attribute = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Keywords
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }

    // Author
    updateMetaTag('author', author);

    // Article specific meta tags
    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('article:published_time', publishedTime, 'property');
      }
      if (modifiedTime) {
        updateMetaTag('article:modified_time', modifiedTime, 'property');
      }
      updateMetaTag('article:author', author, 'property');
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    // Canonical always resolves to the primary production domain, without
    // query strings or hashes, so preview/secondary domains never self-canonicalise.
    canonicalLink.href = canonicalFor(canonical || url || window.location.pathname);

    // Robots meta tag
    const robotsContent = [];
    if (noindex || isNoindexPath(window.location.pathname)) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) {
      robotsContent.push('index', 'follow');
    }
    updateMetaTag('robots', robotsContent.join(', '));

    // Inject structured data
    if (structuredData) {
      injectStructuredData(structuredData);
    }

    return () => {
      // No cleanup: removing arbitrary JSON-LD here would strip the
      // sitewide Organization/WebSite schema from index.html.
    };
  }, [title, description, image, url, type, structuredData, keywords, author, publishedTime, modifiedTime, canonical, noindex, nofollow]);

  return null;
};
