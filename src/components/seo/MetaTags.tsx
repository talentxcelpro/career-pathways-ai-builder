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
  title = 'CareerCatalyst - AI-Powered Career Growth Platform',
  description = 'Transform your career with AI-powered resume building, job matching, and professional networking. Join thousands of professionals advancing their careers.',
  keywords = ['career', 'jobs', 'resume', 'AI', 'professional', 'networking', 'growth'],
  image = '/og-image.jpg',
  url = 'https://careercatalyst.com',
  type = 'website',
  noIndex = false
}) => {
  const fullTitle = title.includes('CareerCatalyst') ? title : `${title} | CareerCatalyst`;
  const fullUrl = url.startsWith('http') ? url : `https://careercatalyst.com${url}`;
  
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
      <meta property="og:site_name" content="CareerCatalyst" />
      
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
          "name": "CareerCatalyst",
          "description": description,
          "url": "https://careercatalyst.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://careercatalyst.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};