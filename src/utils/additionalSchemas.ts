// ============= ADDITIONAL SCHEMA TYPES FOR RICH SNIPPETS =============

// FAQ Schema for better search visibility
export const generateFAQStructuredData = (faqs: Array<{question: string, answer: string}>): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return JSON.stringify(structuredData, null, 2);
};

// HowTo Schema for step-by-step guides
export const generateHowToStructuredData = (howTo: any): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howTo.title,
    "description": howTo.description,
    "image": howTo.image_url,
    "totalTime": howTo.total_time || "PT30M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": howTo.cost || "0"
    },
    "supply": howTo.supplies?.map((supply: string) => ({
      "@type": "HowToSupply",
      "name": supply
    })),
    "tool": howTo.tools?.map((tool: string) => ({
      "@type": "HowToTool",
      "name": tool
    })),
    "step": howTo.steps?.map((step: any, index: number) => ({
      "@type": "HowToStep",
      "name": step.title,
      "text": step.description,
      "position": index + 1,
      "image": step.image_url
    }))
  };

  return JSON.stringify(structuredData, null, 2);
};

// Review Schema for testimonials and ratings
export const generateReviewStructuredData = (reviews: any[]): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "TalentXcel Platform",
    "description": "AI-powered career platform",
    "brand": {
      "@type": "Brand",
      "name": "TalentXcel"
    },
    ...(reviews.length > 0 && reviews.every((r) => typeof r?.rating === 'number')
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": (
              reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
            ).toFixed(1),
            "reviewCount": reviews.length,
            "bestRating": "5",
            "worstRating": "1"
          }
        }
      : {}),
    "review": reviews.map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": review.author_name
      },
      "reviewBody": review.content,
      "datePublished": review.created_at
    }))
  };

  return JSON.stringify(structuredData, null, 2);
};

// Event Schema for webinars and career events
export const generateEventStructuredData = (event: any): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.start_date,
    "endDate": event.end_date,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": event.is_online ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    "location": event.is_online ? {
      "@type": "VirtualLocation",
      "url": event.meeting_url
    } : {
      "@type": "Place",
      "name": event.venue_name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.address,
        "addressLocality": event.city,
        "addressCountry": "IN"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    },
    "offers": {
      "@type": "Offer",
      "price": event.price || "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `https://talentxcel.in/events/${event.id}`,
      "validFrom": event.registration_start
    },
    "performer": event.speakers?.map((speaker: string) => ({
      "@type": "Person",
      "name": speaker
    })),
    "audience": {
      "@type": "Audience",
      "audienceType": event.target_audience || "Professionals"
    }
  };

  return JSON.stringify(structuredData, null, 2);
};

// Video Schema for tutorial content
export const generateVideoStructuredData = (video: any): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description,
    "thumbnailUrl": video.thumbnail_url,
    "uploadDate": video.upload_date,
    "duration": video.duration,
    "contentUrl": video.video_url,
    "embedUrl": video.embed_url,
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "logo": {
        "@type": "ImageObject",
        "url": "https://talentxcel.in/logo.png"
      }
    },
    "creator": {
      "@type": "Person",
      "name": video.creator_name || "TalentXcel Team"
    },
    "inLanguage": "en-US",
    "isFamilyFriendly": true,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.view_count || 0
    }
  };

  return JSON.stringify(structuredData, null, 2);
};

// Website/WebPage Schema for site-wide SEO
export const generateWebsiteStructuredData = (): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TalentXcel",
    "description": "AI-powered career platform helping professionals advance their careers through intelligent job matching, resume optimization, and skill development.",
    "url": "https://talentxcel.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://talentxcel.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://linkedin.com/company/talentxcel",
      "https://twitter.com/talentxcel",
      "https://facebook.com/talentxcel"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "logo": {
        "@type": "ImageObject",
        "url": "https://talentxcel.in/logo.png"
      }
    }
  };

  return JSON.stringify(structuredData, null, 2);
};

// College/University Schema
export const generateEducationalOrganizationStructuredData = (college: any): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": college.name,
    "description": college.description,
    "url": college.website,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": college.address,
      "addressLocality": college.city,
      "addressRegion": college.state,
      "addressCountry": "IN"
    },
    "telephone": college.phone,
    "foundingDate": college.established_year?.toString(),
    "hasCredential": college.accreditations?.map((acc: string) => ({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": acc
    })),
    "department": college.departments?.map((dept: string) => ({
      "@type": "Organization",
      "name": dept
    })),
    "alumni": {
      "@type": "Person",
      "name": "Notable Alumni"
    }
  };

  return JSON.stringify(structuredData, null, 2);
};

// Local Business Schema for company locations
export const generateLocalBusinessStructuredData = (business: any): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.street_address,
      "addressLocality": business.city,
      "addressRegion": business.state,
      "postalCode": business.postal_code,
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": business.latitude,
      "longitude": business.longitude
    },
    "telephone": business.phone,
    "openingHours": business.opening_hours || "Mo-Fr 09:00-18:00",
    "priceRange": business.price_range || "$$",
    ...(business.rating && business.review_count
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": business.rating,
            "reviewCount": business.review_count
          }
        }
      : {})
  };

  return JSON.stringify(structuredData, null, 2);
};

// Product Schema for services and tools
export const generateProductStructuredData = (product: any): string => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "TalentXcel"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "TalentXcel"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://talentxcel.in${product.url}`,
      "priceCurrency": "INR",
      "price": product.price || "0",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "TalentXcel"
      }
    },
    ...(product.rating && product.review_count
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.review_count
          }
        }
      : {}),
    "category": product.category || "Career Tools"
  };

  return JSON.stringify(structuredData, null, 2);
};