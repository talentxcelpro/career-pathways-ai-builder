import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Review {
  author: string;
  datePublished: string;
  reviewBody: string;
  ratingValue: number;
  worstRating?: number;
  bestRating?: number;
  headline?: string;
}

interface ReviewSchemaProps {
  entityType: 'Organization' | 'Product' | 'Service';
  entityName: string;
  entityUrl?: string;
  entityImage?: string;
  reviews: Review[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    worstRating?: number;
    bestRating?: number;
  };
}

export const ReviewSchema: React.FC<ReviewSchemaProps> = ({
  entityType,
  entityName,
  entityUrl,
  entityImage,
  reviews,
  aggregateRating
}) => {
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": entityType,
    "name": entityName,
    ...(entityUrl && { "url": entityUrl }),
    ...(entityImage && { "image": entityImage }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "worstRating": aggregateRating.worstRating || 1,
        "bestRating": aggregateRating.bestRating || 5
      }
    }),
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      ...(review.headline && { "headline": review.headline }),
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.ratingValue,
        "worstRating": review.worstRating || 1,
        "bestRating": review.bestRating || 5
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(reviewSchema)}
      </script>
    </Helmet>
  );
};

// Specialized component for company reviews
interface CompanyReviewSchemaProps {
  companyName: string;
  companyUrl?: string;
  companyLogo?: string;
  industry?: string;
  foundingDate?: string;
  headquarters?: string;
  reviews: Review[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export const CompanyReviewSchema: React.FC<CompanyReviewSchemaProps> = ({
  companyName,
  companyUrl,
  companyLogo,
  industry,
  foundingDate,
  headquarters,
  reviews,
  aggregateRating
}) => {
  const companySchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": companyName,
    ...(companyUrl && { "url": companyUrl }),
    ...(companyLogo && { "logo": companyLogo }),
    ...(industry && { "industry": industry }),
    ...(foundingDate && { "foundingDate": foundingDate }),
    ...(headquarters && { 
      "address": {
        "@type": "PostalAddress",
        "addressLocality": headquarters
      }
    }),
    ...(aggregateRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": aggregateRating.ratingValue,
        "reviewCount": aggregateRating.reviewCount,
        "worstRating": 1,
        "bestRating": 5
      }
    }),
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "datePublished": review.datePublished,
      "reviewBody": review.reviewBody,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.ratingValue,
        "worstRating": 1,
        "bestRating": 5
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(companySchema)}
      </script>
    </Helmet>
  );
};