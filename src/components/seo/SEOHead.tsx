
import React, { useEffect } from 'react';
import { updateMetaTags } from '@/utils/metaTags';
import { injectStructuredData } from '@/utils/structuredData';

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
  title = 'TalentXcel - Career Platform',
  description = 'Find your dream job, grow your skills, and advance your career with AI-powered tools. Connect with professionals, learn new skills, and access exclusive opportunities.',
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
      image: image.startsWith('http') ? image : `https://talentxcel.in${image}`,
      url: url || window.location.href,
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
    canonicalLink.href = canonical || url || window.location.href;

    // Robots meta tag
    const robotsContent = [];
    if (noindex) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) {
      robotsContent.push('index', 'follow');
    }
    updateMetaTag('robots', robotsContent.join(', '));

    // Inject structured data
    if (structuredData) {
      injectStructuredData(structuredData);
    }

    // Add hreflang for international SEO (fixed property name)
    const addHrefLang = (lang: string, href: string) => {
      let hrefLangLink = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!hrefLangLink) {
        hrefLangLink = document.createElement('link');
        hrefLangLink.rel = 'alternate';
        hrefLangLink.hreflang = lang; // Fixed: was hrefLang, now hreflang
        document.head.appendChild(hrefLangLink);
      }
      hrefLangLink.href = href;
    };

    const currentUrl = url || window.location.href;
    addHrefLang('en', currentUrl);
    addHrefLang('hi', currentUrl); // Hindi support for Indian market
    addHrefLang('x-default', currentUrl);

    return () => {
      // Cleanup structured data on unmount
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, image, url, type, structuredData, keywords, author, publishedTime, modifiedTime, canonical, noindex, nofollow]);

  return null;
};
