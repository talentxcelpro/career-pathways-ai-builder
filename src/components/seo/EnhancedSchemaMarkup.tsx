import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface Course {
  name: string;
  description: string;
  instructor?: string;
  duration_hours?: number;
  price?: number;
  skills_taught?: string[];
  difficulty_level?: string;
  rating?: number;
  created_at?: string;
}

interface Event {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  organizer?: string;
  eventType?: string;
  price?: number;
}

interface EnhancedSchemaProps {
  pageType: 'course' | 'event' | 'organization' | 'website';
  data: Course | Event | any;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export const EnhancedSchemaMarkup: React.FC<EnhancedSchemaProps> = ({
  pageType,
  data,
  breadcrumbs = []
}) => {
  const location = useLocation();

  useEffect(() => {
    const schemas = [];

    // Course schema
    if (pageType === 'course' && data) {
      const courseData = data as Course;
      const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": courseData.name,
        "description": courseData.description,
        "provider": {
          "@type": "Organization",
          "name": "TalentXcel",
          "url": "https://talentxcel.in"
        },
        "instructor": courseData.instructor ? {
          "@type": "Person",
          "name": courseData.instructor
        } : undefined,
        "duration": courseData.duration_hours ? `PT${courseData.duration_hours}H` : undefined,
        "courseMode": "online",
        "educationalLevel": courseData.difficulty_level,
        "aggregateRating": courseData.rating ? {
          "@type": "AggregateRating",
          "ratingValue": courseData.rating,
          "ratingCount": 1
        } : undefined,
        "offers": courseData.price ? {
          "@type": "Offer",
          "price": courseData.price,
          "priceCurrency": "INR"
        } : undefined,
        "teaches": courseData.skills_taught?.join(", "),
        "dateCreated": courseData.created_at
      };
      schemas.push({ id: 'course-schema', schema: courseSchema });
    }

    // Event schema
    if (pageType === 'event' && data) {
      const eventData = data as Event;
      const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": eventData.name,
        "description": eventData.description,
        "startDate": eventData.startDate,
        "endDate": eventData.endDate,
        "location": eventData.location ? {
          "@type": "Place",
          "name": eventData.location
        } : {
          "@type": "VirtualLocation",
          "url": "https://talentxcel.in"
        },
        "organizer": {
          "@type": "Organization",
          "name": eventData.organizer || "TalentXcel",
          "url": "https://talentxcel.in"
        },
        "eventAttendanceMode": eventData.location ? "OfflineEventAttendanceMode" : "OnlineEventAttendanceMode",
        "eventStatus": "EventScheduled",
        "offers": eventData.price ? {
          "@type": "Offer",
          "price": eventData.price,
          "priceCurrency": "INR",
          "url": `https://talentxcel.in${location.pathname}`
        } : {
          "@type": "Offer",
          "price": 0,
          "priceCurrency": "INR",
          "availability": "InStock"
        }
      };
      schemas.push({ id: 'event-schema', schema: eventSchema });
    }

    // Enhanced Organization schema
    if (pageType === 'organization') {
      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": data?.name || "TalentXcel",
        "url": "https://talentxcel.in",
        "logo": "https://talentxcel.in/logo.png",
        "description": data?.description || "India's leading career development platform connecting talent with opportunities.",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressLocality": data?.location || "India"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "email": "support@talentxcel.in"
        },
        "sameAs": [
          "https://www.linkedin.com/company/talentxcel",
          "https://twitter.com/talentxcel",
          "https://www.facebook.com/talentxcel"
        ],
        "foundingDate": "2024",
        "industry": data?.industry || "Human Resources",
        "numberOfEmployees": {
          "@type": "QuantitativeValue",
          "minValue": 10,
          "maxValue": 50
        }
      };
      schemas.push({ id: 'organization-schema', schema: orgSchema });
    }

    // Enhanced Website schema
    if (pageType === 'website') {
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel",
        "url": "https://talentxcel.in",
        "description": "Find your dream job, advance your career, and connect with top employers in India. Comprehensive career guidance, skill development, and job opportunities.",
        "publisher": {
          "@type": "Organization",
          "name": "TalentXcel",
          "logo": {
            "@type": "ImageObject",
            "url": "https://talentxcel.in/logo.png"
          }
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://talentxcel.in/jobs?search={search_term_string}",
          "query-input": "required name=search_term_string"
        },
        "mainEntity": {
          "@type": "JobBoard",
          "name": "TalentXcel Jobs",
          "description": "Browse thousands of job opportunities across India"
        }
      };
      schemas.push({ id: 'website-schema', schema: websiteSchema });
    }

    // Breadcrumb schema
    if (breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": `https://talentxcel.in${crumb.url}`
        }))
      };
      schemas.push({ id: 'breadcrumb-schema', schema: breadcrumbSchema });
    }

    // Inject schemas
    schemas.forEach(({ id, schema }) => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });

    // Cleanup function
    return () => {
      schemas.forEach(({ id }) => {
        const script = document.getElementById(id);
        if (script) {
          script.remove();
        }
      });
    };
  }, [pageType, data, location.pathname, breadcrumbs]);

  return null;
};