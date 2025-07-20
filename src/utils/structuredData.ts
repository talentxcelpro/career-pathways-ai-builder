
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
    "name": tool.name || "TalentXcel Resume Builder",
    "description": tool.description || "AI-powered resume builder for career success",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "url": `https://talentxcel.in${tool.path || '/resume-builder'}`,
    "provider": {
      "@type": "Organization",
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    },
    "featureList": [
      "AI Resume Analysis",
      "ATS Optimization", 
      "Multiple Templates",
      "Export to PDF",
      "Skill Recommendations"
    ],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    }
  };

  return JSON.stringify(structuredData, null, 2);
};

export const generateArticleStructuredData = (article: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": article.type === 'blog' ? "BlogPosting" : "Article",
    "headline": article.title,
    "description": article.excerpt || article.description,
    "image": article.featured_image,
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
    "dateModified": article.updated_at,
    "articleSection": article.category,
    "keywords": article.tags?.join(", "),
    "wordCount": article.word_count,
    "url": `https://talentxcel.in/blog/${article.slug}`
  };

  return JSON.stringify(structuredData, null, 2);
};

export const generateCareerMapStructuredData = (careerPath: any) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    "name": `Career Path: ${careerPath.target_role}`,
    "description": `Comprehensive career roadmap to become ${careerPath.target_role}`,
    "about": careerPath.industry,
    "creator": {
      "@type": "Organization",
      "name": "TalentXcel"
    },
    "hasPart": careerPath.steps?.map((step: any, index: number) => ({
      "@type": "CreativeWork",
      "name": `Step ${index + 1}: ${step.title}`,
      "description": step.description,
      "position": index + 1
    })),
    "audience": {
      "@type": "Audience",
      "audienceType": "Professionals seeking career advancement"
    },
    "url": `https://talentxcel.in/career-map/path/${careerPath.id}`
  };

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
