import React from 'react';
import { Helmet } from 'react-helmet-async';

interface AuthorInfo {
  name: string;
  type: 'Person' | 'Organization';
  url?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    name: string;
    url?: string;
  };
  sameAs?: string[]; // Social media profiles
  knowsAbout?: string[]; // Areas of expertise
  description?: string;
  email?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

interface AuthorSchemaProps {
  author: AuthorInfo;
  publishedWork?: {
    headline: string;
    datePublished: string;
    dateModified?: string;
    articleBody?: string;
    wordCount?: number;
    keywords?: string[];
  };
}

export const AuthorSchema: React.FC<AuthorSchemaProps> = ({
  author,
  publishedWork
}) => {
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": author.type,
    "name": author.name,
    ...(author.url && { "url": author.url }),
    ...(author.image && { "image": author.image }),
    ...(author.jobTitle && { "jobTitle": author.jobTitle }),
    ...(author.description && { "description": author.description }),
    ...(author.email && { "email": author.email }),
    ...(author.telephone && { "telephone": author.telephone }),
    ...(author.worksFor && {
      "worksFor": {
        "@type": "Organization",
        "name": author.worksFor.name,
        ...(author.worksFor.url && { "url": author.worksFor.url })
      }
    }),
    ...(author.sameAs && { "sameAs": author.sameAs }),
    ...(author.knowsAbout && { "knowsAbout": author.knowsAbout }),
    ...(author.address && {
      "address": {
        "@type": "PostalAddress",
        ...author.address
      }
    })
  };

  const articleSchema = publishedWork ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": publishedWork.headline,
    "datePublished": publishedWork.datePublished,
    "dateModified": publishedWork.dateModified || publishedWork.datePublished,
    "author": authorSchema,
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "logo": {
        "@type": "ImageObject",
        "url": "https://talentxcel.in/logo.png"
      }
    },
    ...(publishedWork.articleBody && { "articleBody": publishedWork.articleBody }),
    ...(publishedWork.wordCount && { "wordCount": publishedWork.wordCount }),
    ...(publishedWork.keywords && { "keywords": publishedWork.keywords.join(', ') }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  } : null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(authorSchema)}
      </script>
      
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      
      {/* Author meta tags */}
      <meta name="author" content={author.name} />
      {author.description && <meta name="author-description" content={author.description} />}
      {author.jobTitle && <meta name="author-title" content={author.jobTitle} />}
      
      {/* Expertise meta tags */}
      {author.knowsAbout && author.knowsAbout.map((expertise, index) => (
        <meta key={index} name="expertise" content={expertise} />
      ))}
      
      {/* Social verification */}
      {author.sameAs && author.sameAs.map((social, index) => (
        <link key={index} rel="me" href={social} />
      ))}
    </Helmet>
  );
};

// E-A-T (Expertise, Authoritativeness, Trustworthiness) component
interface EATSchemaProps {
  expertise: {
    areas: string[];
    certifications?: string[];
    yearsOfExperience?: number;
    education?: string[];
  };
  authoritativeness: {
    publications?: string[];
    awards?: string[];
    speakingEngagements?: string[];
    mediaAppearances?: string[];
  };
  trustworthiness: {
    reviewsCount?: number;
    averageRating?: number;
    testimonials?: Array<{
      text: string;
      author: string;
      rating?: number;
    }>;
    verificationBadges?: string[];
  };
}

export const EATSchema: React.FC<EATSchemaProps> = ({
  expertise,
  authoritativeness,
  trustworthiness
}) => {
  const eatSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "expertise": {
      "@type": "DefinedTerm",
      "name": expertise.areas.join(', '),
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "Professional Expertise Areas"
      }
    },
    ...(expertise.certifications && {
      "hasCredential": expertise.certifications.map(cert => ({
        "@type": "EducationalOccupationalCredential",
        "name": cert
      }))
    }),
    ...(expertise.yearsOfExperience && {
      "hasOccupation": {
        "@type": "Occupation",
        "experienceRequirements": `${expertise.yearsOfExperience} years of experience`
      }
    }),
    ...(authoritativeness.publications && {
      "publishingPrinciples": authoritativeness.publications
    }),
    ...(authoritativeness.awards && {
      "award": authoritativeness.awards
    }),
    ...(trustworthiness.averageRating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": trustworthiness.averageRating,
        "reviewCount": trustworthiness.reviewsCount || 1,
        "worstRating": 1,
        "bestRating": 5
      }
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(eatSchema)}
      </script>
      
      {/* E-A-T meta tags */}
      <meta name="expertise-areas" content={expertise.areas.join(', ')} />
      {expertise.yearsOfExperience && (
        <meta name="years-experience" content={expertise.yearsOfExperience.toString()} />
      )}
      
      {expertise.certifications && expertise.certifications.map((cert, index) => (
        <meta key={index} name="certification" content={cert} />
      ))}
      
      {authoritativeness.awards && authoritativeness.awards.map((award, index) => (
        <meta key={index} name="award" content={award} />
      ))}
      
      {trustworthiness.averageRating && (
        <>
          <meta name="rating" content={trustworthiness.averageRating.toString()} />
          <meta name="review-count" content={(trustworthiness.reviewsCount || 1).toString()} />
        </>
      )}
    </Helmet>
  );
};