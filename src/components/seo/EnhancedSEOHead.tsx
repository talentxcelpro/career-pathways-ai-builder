
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface EnhancedSEOHeadProps {
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

export const EnhancedSEOHead: React.FC<EnhancedSEOHeadProps> = ({
  title = 'TalentXcel - AI-Powered Career Platform',
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
  breadcrumbs = [],
  hreflang = {}
}) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    document.title = title;

    const updateMetaTag = (property: string, content: string, attribute = 'name') => {
      let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords.join(', '));
    updateMetaTag('author', author);

    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', url || window.location.href, 'property');
    updateMetaTag('og:image', image.startsWith('http') ? image : `https://talentxcel.in${image}`, 'property');
    updateMetaTag('og:site_name', 'TalentXcel', 'property');
    updateMetaTag('og:locale', 'en_US', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:site', '@talentxcel');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image.startsWith('http') ? image : `https://talentxcel.in${image}`);

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

    // Job posting specific meta tags
    if (type === 'jobposting') {
      updateMetaTag('og:type', 'article', 'property'); // Fallback for better compatibility
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

    // AI-friendly meta tags
    updateMetaTag('x-robots-tag', 'all');
    updateMetaTag('referrer', 'origin-when-cross-origin');

    // Hreflang tags for international SEO
    Object.entries(hreflang).forEach(([lang, href]) => {
      let hrefLangLink = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!hrefLangLink) {
        hrefLangLink = document.createElement('link');
        hrefLangLink.rel = 'alternate';
        hrefLangLink.hreflang = lang;
        document.head.appendChild(hrefLangLink);
      }
      hrefLangLink.href = href;
    });

    // Default hreflang if none provided
    if (Object.keys(hreflang).length === 0) {
      const currentUrl = url || window.location.href;
      ['en', 'hi', 'x-default'].forEach(lang => {
        let hrefLangLink = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
        if (!hrefLangLink) {
          hrefLangLink = document.createElement('link');
          hrefLangLink.rel = 'alternate';
          hrefLangLink.hreflang = lang;
          document.head.appendChild(hrefLangLink);
        }
        hrefLangLink.href = currentUrl;
      });
    }

    // Inject structured data
    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = structuredData;
      document.head.appendChild(script);
    }

    // Breadcrumb structured data
    if (breadcrumbs.length > 0) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": `https://talentxcel.in${crumb.url}`
        }))
      };

      const existingBreadcrumbScript = document.querySelector('script[data-type="breadcrumb"]');
      if (existingBreadcrumbScript) {
        existingBreadcrumbScript.remove();
      }

      const breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.setAttribute('data-type', 'breadcrumb');
      breadcrumbScript.textContent = JSON.stringify(breadcrumbData, null, 2);
      document.head.appendChild(breadcrumbScript);
    }

    return () => {
      // Cleanup structured data on unmount
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }
      const existingBreadcrumbScript = document.querySelector('script[data-type="breadcrumb"]');
      if (existingBreadcrumbScript) {
        existingBreadcrumbScript.remove();
      }
    };
  }, [title, description, image, url, type, structuredData, keywords, author, publishedTime, modifiedTime, canonical, noindex, nofollow, breadcrumbs, hreflang, location.pathname]);

  return null;
};
