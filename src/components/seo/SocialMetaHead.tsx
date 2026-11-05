import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PRODUCTION_ORIGIN, DEFAULT_TITLE, DEFAULT_DESCRIPTION, OG_IMAGES } from '@/config/seo';

export interface SocialMetaHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  category?: 'default' | 'jobs' | 'passport' | 'salaries' | 'colleges' | 'resume' | 'article';
  noindex?: boolean;
  robotsDirective?: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  publishedTime?: string;
  author?: string;
}

// Safely decode entities to prevent &amp; double-encoding in HTML <head>
function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export const SocialMetaHead: React.FC<SocialMetaHeadProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  category = 'default',
  noindex = false,
  robotsDirective,
  publishedTime,
  author = 'TalentXcel',
}) => {
  const safeTitle = cleanText(title);
  const safeDescription = cleanText(description);

  // Determine canonical URL
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const fullCanonical = canonicalUrl
    ? (canonicalUrl.startsWith('http') ? canonicalUrl : `${PRODUCTION_ORIGIN}${canonicalUrl}`)
    : `${PRODUCTION_ORIGIN}${currentPath}`;

  // Select appropriate 1200x630 OG image
  let selectedImage = ogImage;
  if (!selectedImage) {
    if (category && OG_IMAGES[category]) {
      selectedImage = OG_IMAGES[category];
    } else {
      const lower = currentPath.toLowerCase();
      if (lower.startsWith('/jobs') || lower.startsWith('/job')) {
        selectedImage = OG_IMAGES.jobs;
      } else if (lower.startsWith('/passport') || lower.startsWith('/candidate')) {
        selectedImage = OG_IMAGES.passport;
      } else if (lower.startsWith('/salary') || lower.startsWith('/salaries')) {
        selectedImage = OG_IMAGES.salaries;
      } else if (lower.startsWith('/college')) {
        selectedImage = OG_IMAGES.colleges;
      } else if (lower.startsWith('/resume') || lower.startsWith('/ats')) {
        selectedImage = OG_IMAGES.resume;
      } else if (lower.startsWith('/article') || lower.startsWith('/blog') || lower.startsWith('/resource')) {
        selectedImage = OG_IMAGES.article;
      } else {
        selectedImage = OG_IMAGES.default;
      }
    }
  }

  // Ensure absolute HTTPS URL for the image
  if (selectedImage && selectedImage.startsWith('/')) {
    selectedImage = `${PRODUCTION_ORIGIN}${selectedImage}`;
  }

  return (
    <Helmet>
      {/* Standard Meta */}
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      <link rel="canonical" href={fullCanonical} />

      {/* Robots Directive (Guarantees single non-conflicting robots tag) */}
      {robotsDirective ? (
        <meta name="robots" content={robotsDirective} />
      ) : noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph Tags */}
      <meta property="og:site_name" content="TalentXcel" />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={selectedImage} />
      <meta property="og:image:secure_url" content={selectedImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={safeTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@talentxcel" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={selectedImage} />
      <meta name="twitter:image:alt" content={safeTitle} />

      {/* Article Metadata if applicable */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
    </Helmet>
  );
};
