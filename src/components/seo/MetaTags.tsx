import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  title = 'TalentXcel Core - Performance Career Engine',
  description = 'Transform your career with precision resume synthesis, job alignment, and professional networking. Join elite professionals advancing their careers.',
  keywords = ['career', 'jobs', 'resume', 'CareerIntelligence', 'professional', 'networking', 'growth'],
  image = '/og-image.jpg',
  url = 'https://talentxcel.in',
  type = 'website',
  noIndex = false
}) => {
  const fullTitle = title.includes('TalentXcel') ? title : `${title} | TalentXcel`;
  const fullUrl = url.startsWith('http') ? url : `https://talentxcel.in${url}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="TalentXcel" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* SEO */}
      <link rel="canonical" href={fullUrl} />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "TalentXcel",
          "description": description,
          "url": "https://talentxcel.in",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://talentxcel.in/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};
