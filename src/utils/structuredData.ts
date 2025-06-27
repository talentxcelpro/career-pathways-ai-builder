
// Structured data (JSON-LD) for better SEO
export const generateJobStructuredData = (job: any) => {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.companies?.name || "TalentXcel",
      "value": job.id
    },
    "datePosted": job.posted_at || job.created_at,
    "validThrough": job.expires_at,
    "employmentType": job.employment_type?.toUpperCase(),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.companies?.name || "Company",
      "sameAs": job.companies?.website,
      "logo": job.companies?.logo_url
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location
      }
    },
    "baseSalary": job.salary_min && job.salary_max ? {
      "@type": "MonetaryAmount",
      "currency": job.salary_currency || "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": "YEAR"
      }
    } : undefined
  };

  return JSON.stringify(structuredData, null, 2);
};

export const generateOrganizationStructuredData = (company: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.name,
    "description": company.description,
    "url": company.website,
    "logo": company.logo_url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": company.location
    },
    "industry": company.industry,
    "foundingDate": company.founded_year ? `${company.founded_year}-01-01` : undefined,
    "numberOfEmployees": company.size_range
  };

  return JSON.stringify(structuredData, null, 2);
};

export const generateCourseStructuredData = (course: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "TalentXcel"
    },
    "instructor": {
      "@type": "Person",
      "name": course.instructor_name
    },
    "timeRequired": `PT${course.duration_hours}H`,
    "courseLevel": course.difficulty_level,
    "about": course.skills_taught,
    "offers": {
      "@type": "Offer",
      "price": course.price || 0,
      "priceCurrency": "INR"
    }
  };

  return JSON.stringify(structuredData, null, 2);
};

export const injectStructuredData = (structuredData: string) => {
  // Remove any existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = structuredData;
  document.head.appendChild(script);
};
