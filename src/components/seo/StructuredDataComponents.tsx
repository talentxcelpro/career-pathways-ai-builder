import React from 'react';

interface ToolJSONLDProps {
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    features?: string[];
    pricing?: string;
    rating?: number;
    created_at: string;
    updated_at?: string;
  };
}

interface CourseJSONLDProps {
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    level?: string;
    duration?: string;
    skills?: string[];
    created_at: string;
    updated_at?: string;
  };
}

/**
 * Enhanced Tool/Software JSON-LD Component
 * Implements schema.org SoftwareApplication markup for career tools
 */
export const ToolJSONLD: React.FC<ToolJSONLDProps> = ({ tool }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": "Career Development Tool",
    "applicationSubCategory": tool.category,
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": tool.pricing === 'free' ? "0" : "99",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": tool.rating ? {
      "@type": "AggregateRating",
      "ratingValue": tool.rating,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "100"
    } : undefined,
    "featureList": tool.features || [
      "AI-powered optimization",
      "Real-time feedback",
      "Professional templates"
    ],
    "url": `https://talentxcel.in/tools/${tool.id}`,
    "dateCreated": tool.created_at,
    "dateModified": tool.updated_at || tool.created_at,
    "creator": {
      "@type": "Organization",
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    }
  };

  // Remove undefined fields
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 0)
      }}
    />
  );
};

/**
 * Enhanced Course JSON-LD Component
 * Implements schema.org Course markup for learning content
 */
export const CourseJSONLD: React.FC<CourseJSONLDProps> = ({ course }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    },
    "courseCode": course.id,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "duration": course.duration || "Self-paced",
      "instructor": {
        "@type": "Person",
        "name": "TalentXcel Expert"
      }
    },
    "about": course.category,
    "educationalLevel": course.level || "Beginner to Advanced",
    "teaches": course.skills || ["Professional Skills", "Career Development"],
    "url": `https://talentxcel.in/learning/${course.id}`,
    "dateCreated": course.created_at,
    "dateModified": course.updated_at || course.created_at,
    "inLanguage": "en-US",
    "learningResourceType": "Online Course",
    "isAccessibleForFree": true
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