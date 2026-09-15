
// ============= COMPREHENSIVE SCHEMA MARKUP SYSTEM =============
// Enhanced structured data generators with rich snippets support

interface JobData {
  id?: string;
  title: string;
  description: string;
  company?: { name: string; website?: string; logo_url?: string; };
  companies?: { name: string; website?: string; logo_url?: string; };
  company_name?: string;
  location: string;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  posted_at?: string;
  created_at?: string;
  expires_at?: string;
  skills?: string[];
  requirements?: string[];
}

export const generateJobStructuredData = (job: JobData) => {
  const company = job.company || job.companies;
  
  // Ensure required fields are present with strict ISO 8601 formatting
  const currentDate = new Date().toISOString();
  const postedDate = job.posted_at || job.created_at || currentDate;
  const expiryDate = (() => {
    try {
      const d = job.expires_at ? new Date(job.expires_at) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      return isNaN(d.getTime()) ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() : d.toISOString();
    } catch {
      return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    }
  })();
  
  // Parse location for better address structure
  const locationParts = job.location?.split(',') || ['Remote'];
  const locality = locationParts[0]?.trim() || 'Remote';
  const region = locationParts[1]?.trim();
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "TalentXcel Job ID",
      "value": job.id || "unknown"
    },
    "datePosted": postedDate,
    "validThrough": expiryDate,
    "employmentType": (job.employment_type?.toUpperCase() || "FULL_TIME").replace(/[^A-Z_]/g, ''),
    "hiringOrganization": {
      "@type": "Organization",
      "name": company?.name || job.company_name || "TalentXcel Partner",
      "sameAs": company?.website,
      "logo": company?.logo_url || "https://talentxcel.in/logo.png"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": locality,
        "addressRegion": region,
        "addressCountry": "IN",
        "postalCode": region && region.match(/\d{6}/) ? region.match(/\d{6}/)[0] : undefined
      }
    },
    "baseSalary": (job.salary_min && job.salary_max) ? {
      "@type": "MonetaryAmount",
      "currency": job.salary_currency || "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": "YEAR"
      }
    } : (job.salary_min || job.salary_max) ? {
      "@type": "MonetaryAmount",
      "currency": job.salary_currency || "INR", 
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary_min || job.salary_max,
        "unitText": "YEAR"
      }
    } : {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": 300000,
        "maxValue": 1500000,
        "unitText": "YEAR"
      }
    },
    "skills": job.skills?.join(", "),
    "qualifications": job.requirements?.join(". "),
    "url": `https://talentxcel.in/jobs/${job.id || 'apply'}`,
    "applicationContact": {
      "@type": "ContactPoint",
      "url": `https://talentxcel.in/jobs/${job.id || 'apply'}/apply`
    },
    "industry": "Technology",
    "workHours": "40 hours per week",
    "benefits": "Health insurance, Professional development, Flexible working hours",
    "jobBenefits": [
      "Health insurance",
      "Professional development opportunities", 
      "Flexible working hours",
      "Competitive salary",
      "Career advancement"
    ]
  };

  // Remove undefined values but keep essential ones
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined && !['datePosted', 'validThrough', 'employmentType', 'baseSalary'].includes(key)) {
      delete structuredData[key];
    }
  });

  return JSON.stringify(structuredData, null, 2);
};

export const generateOrganizationStructuredData = (company: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": company.name,
    "description": company.description,
    "url": company.website || `https://talentxcel.in/companies/${company.id}`,
    "logo": {
      "@type": "ImageObject",
      "url": company.logo_url || "https://talentxcel.in/logo.png"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": company.location,
      "addressCountry": "IN"
    },
    "industry": company.industry,
    "foundingDate": company.founded_year ? `${company.founded_year}-01-01` : undefined,
    "numberOfEmployees": company.size_range,
    "sameAs": [
      company.website,
      company.linkedin_url,
      `https://talentxcel.in/companies/${company.id}`
    ].filter(Boolean),
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": company.phone,
      "contactType": "Customer Service"
    }
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => 
    structuredData[key] === undefined && delete structuredData[key]
  );

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
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    },
    "instructor": course.instructor_name ? {
      "@type": "Person",
      "name": course.instructor_name
    } : undefined,
    "timeRequired": course.duration_hours ? `PT${course.duration_hours}H` : course.duration,
    "courseLevel": course.difficulty_level || course.level,
    "about": course.skills_taught || course.skills?.join(", "),
    "offers": course.price ? {
      "@type": "Offer",
      "price": course.price,
      "priceCurrency": "INR",
      "category": "educational"
    } : {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "category": "educational"
    },
    "aggregateRating": course.rating ? {
      "@type": "AggregateRating",
      "ratingValue": course.rating,
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": course.enrollment_count || "50"
    } : undefined,
    "url": `https://talentxcel.in/learning/${course.id}`,
    "educationalCredentialAwarded": "Certificate of Completion",
    "coursePrerequisites": course.prerequisites
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => 
    structuredData[key] === undefined && delete structuredData[key]
  );

  return JSON.stringify(structuredData, null, 2);
};

// Phase 3: Enhanced Structured Data - New Schema Types

export const generatePersonStructuredData = (user: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": user.full_name,
    "jobTitle": user.title || user.current_position,
    "description": user.bio,
    "image": user.avatar_url,
    "email": user.email,
    "url": `https://talentxcel.in/user/${user.username}`,
    "alumniOf": user.education?.map((edu: any) => ({
      "@type": "EducationalOrganization",
      "name": edu.institution
    })),
    "worksFor": user.experience?.length > 0 ? {
      "@type": "Organization", 
      "name": user.experience[0].company
    } : undefined,
    "knowsAbout": user.skills?.map((skill: any) => skill.name),
    "sameAs": [
      user.linkedin_url,
      user.github_url,
      user.portfolio_url
    ].filter(Boolean)
  };

  return JSON.stringify(structuredData, null, 2);
};

export const generateSoftwareApplicationStructuredData = (tool: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name || "TalentXcel AI Tools",
    "description": tool.description || `${tool.name} - Professional AI-powered tool by TalentXcel`,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "url": `https://talentxcel.in${tool.path}`,
    "provider": {
      "@type": "Organization",
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    },
    "featureList": tool.features || [
      "AI-Powered Analysis",
      "Professional Templates", 
      "Real-time Optimization",
      "Export Capabilities",
      "Smart Recommendations"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "category": "free"
    },
    "screenshot": tool.screenshot_url,
    "downloadUrl": `https://talentxcel.in${tool.path}`,
    "installUrl": `https://talentxcel.in${tool.path}`,
    "permissions": "No special permissions required"
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => 
    structuredData[key] === undefined && delete structuredData[key]
  );

  return JSON.stringify(structuredData, null, 2);
};

export const generateArticleStructuredData = (article: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": article.type === 'blog' ? "BlogPosting" : "Article",
    "headline": article.title,
    "description": article.excerpt || article.description,
    "image": {
      "@type": "ImageObject",
      "url": article.featured_image || "https://talentxcel.in/logo.png"
    },
    "author": {
      "@type": "Person",
      "name": article.author_name || "TalentXcel Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "logo": {
        "@type": "ImageObject",
        "url": "https://talentxcel.in/logo.png"
      }
    },
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.published_at || article.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://talentxcel.in/blog/${article.slug || article.id}`
    },
    "articleSection": article.category,
    "keywords": article.tags?.join(", "),
    "wordCount": article.word_count || article.content?.length || 800,
    "timeRequired": `PT${article.reading_time || Math.ceil((article.word_count || 800) / 200)}M`,
    "url": `https://talentxcel.in/blog/${article.slug || article.id}`,
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "genre": article.category || "Career Development"
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => 
    structuredData[key] === undefined && delete structuredData[key]
  );

  return JSON.stringify(structuredData, null, 2);
};

export const generateCareerMapStructuredData = (careerPath: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Guide",
    "name": careerPath.title || `Career Path: ${careerPath.target_role || careerPath.role}`,
    "description": careerPath.description || `Comprehensive career roadmap to become ${careerPath.target_role || careerPath.role}`,
    "about": {
      "@type": "Thing",
      "name": careerPath.target_role || careerPath.role,
      "description": `Career development in ${careerPath.industry || 'Technology'}`
    },
    "creator": {
      "@type": "Organization",
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    },
    "hasPart": careerPath.steps?.map((step: any, index: number) => ({
      "@type": "CreativeWork",
      "name": `Step ${index + 1}: ${step.title}`,
      "description": step.description,
      "position": index + 1
    })),
    "audience": {
      "@type": "PeopleAudience",
      "audienceType": "professionals",
      "suggestedMinAge": 18,
      "suggestedMaxAge": 65
    },
    "teaches": careerPath.skills?.join(", "),
    "educationalLevel": careerPath.experience_level || "Beginner to Advanced",
    "timeRequired": careerPath.estimated_duration || "6-12 months",
    "url": `https://talentxcel.in/career-map/${(careerPath.target_role || careerPath.role || careerPath.title)?.toLowerCase().replace(/\s+/g, '-')}`,
    "genre": "Career Development",
    "inLanguage": "en-US"
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => 
    structuredData[key] === undefined && delete structuredData[key]
  );

  return JSON.stringify(structuredData, null, 2);
};

export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{name: string, url: string}>) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return JSON.stringify(structuredData, null, 2);
};

export const injectStructuredData = (structuredData: string, id?: string) => {
  // Remove any existing structured data with the same id
  const existingScript = document.querySelector(`script[type="application/ld+json"]${id ? `[data-id="${id}"]` : ''}`);
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = structuredData;
  if (id) {
    script.setAttribute('data-id', id);
  }
  document.head.appendChild(script);
};

export const injectMultipleStructuredData = (dataArray: Array<{data: string, id?: string}>) => {
  dataArray.forEach(({data, id}) => {
    injectStructuredData(data, id);
  });
};

export const removeStructuredData = (id: string) => {
  const script = document.querySelector(`script[type="application/ld+json"][data-id="${id}"]`);
  if (script) {
    script.remove();
  }
};

export const removeAllStructuredData = () => {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(script => script.remove());
};
