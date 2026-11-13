import React, { useEffect } from 'react';
import { updateMetaTags } from '@/utils/metaTags';
import { injectStructuredData } from '@/utils/structuredData';
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, DEFAULT_OG_IMAGE, absoluteUrl, canonicalFor, isNoindexPath } from '@/config/seo';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';

const FALLBACK_DEFAULT_OG_IMAGE = 'https://talentxcel.in/assets/og/talentxcel-og-default.png';
const SAFE_OG_IMAGE = typeof DEFAULT_OG_IMAGE !== 'undefined' && DEFAULT_OG_IMAGE ? DEFAULT_OG_IMAGE : FALLBACK_DEFAULT_OG_IMAGE;
const SAFE_TITLE = typeof DEFAULT_TITLE !== 'undefined' && DEFAULT_TITLE ? DEFAULT_TITLE : 'TalentXcel | Global Professional Talent Network, Jobs & Career Passport';
const SAFE_DESCRIPTION = typeof DEFAULT_DESCRIPTION !== 'undefined' && DEFAULT_DESCRIPTION ? DEFAULT_DESCRIPTION : 'TalentXcel brings together professional profiles, job listings, career resources, resume tools, and hiring services.';

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
  title = SAFE_TITLE,
  description = SAFE_DESCRIPTION,
  image = SAFE_OG_IMAGE,
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
      image: absoluteUrl(image || SAFE_OG_IMAGE),
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

    // 7. Enforce official master favicon URL across all routes/subdomains
    const officialFavicon = 'https://talentxcel.in/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png';
    const favicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    favicons.forEach((el) => {
      (el as HTMLLinkElement).href = officialFavicon;
    });

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


  // Track SEO landing view deduplicated per path
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    const sessionKey = 'tx_seo_view_' + currentPath;
    if (!sessionStorage.getItem(sessionKey)) {
      try { sessionStorage.setItem(sessionKey, '1'); } catch (_) {}
      GrowthFunnelTracker.track('seo_landing_view', {
        landing_page: currentPath,
        page_title: title,
      });
    }
  }, [title]);

  return null;
};

export default SEOHead;
