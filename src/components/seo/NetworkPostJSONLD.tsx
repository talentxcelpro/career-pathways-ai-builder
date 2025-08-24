import React from 'react';

interface NetworkPostJSONLDProps {
  post: {
    id: string;
    headline: string;
    content: string;
    author_id: string;
    author_name?: string;
    created_at: string;
    updated_at?: string;
    media_urls?: string[];
    post_type?: string;
  };
}

/**
 * Enhanced Article JSON-LD Component for Network Posts
 * Implements schema.org Article markup for professional network content
 */
export const NetworkPostJSONLD: React.FC<NetworkPostJSONLDProps> = ({ post }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.headline,
    "description": post.content?.substring(0, 160) + '...',
    "author": {
      "@type": "Person",
      "name": post.author_name || "TalentXcel User",
      "url": `https://talentxcel.in/profile/${post.author_id}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "logo": {
        "@type": "ImageObject",
        "url": "https://talentxcel.in/logo.png",
        "width": 200,
        "height": 60
      },
      "url": "https://talentxcel.in"
    },
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://talentxcel.in/network/${post.id}`
    },
    "url": `https://talentxcel.in/network/${post.id}`,
    "image": post.media_urls?.[0] ? {
      "@type": "ImageObject",
      "url": post.media_urls[0],
      "width": 1200,
      "height": 630
    } : {
      "@type": "ImageObject",
      "url": "https://talentxcel.in/og-image.png",
      "width": 1200,
      "height": 630
    },
    "articleSection": post.post_type || "Professional Networking",
    "wordCount": post.content?.split(' ').length || 0,
    "inLanguage": "en-US",
    "potentialAction": {
      "@type": "ReadAction",
      "target": `https://talentxcel.in/network/${post.id}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0)
      }}
    />
  );
};