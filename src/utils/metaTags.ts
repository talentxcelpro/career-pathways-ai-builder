
// Dynamic meta tags service for URL previews and SEO
interface MetaTagsConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
}

export const updateMetaTags = (config: MetaTagsConfig) => {
  const { title, description, image, url, type = 'website', siteName = 'TalentXcel' } = config;
  
  // Update document title
  document.title = title;
  
  // Helper function to update or create meta tag
  const updateMetaTag = (property: string, content: string, attribute = 'property') => {
    let meta = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  };
  
  // Update basic meta tags
  updateMetaTag('description', description, 'name');
  
  // Update Open Graph tags
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:type', type);
  updateMetaTag('og:site_name', siteName);
  
  if (image) {
    updateMetaTag('og:image', image);
    updateMetaTag('twitter:image', image);
  }
  
  if (url) {
    updateMetaTag('og:url', url);
    updateMetaTag('twitter:url', url);
  }
  
  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image', 'name');
  updateMetaTag('twitter:title', title, 'name');
  updateMetaTag('twitter:description', description, 'name');
};

export const generateJobMetaTags = (job: any) => {
  const salary = job.salary_min && job.salary_max 
    ? `₹${job.salary_min/100000}L - ₹${job.salary_max/100000}L`
    : 'Competitive salary';
    
  updateMetaTags({
    title: `${job.title} at ${job.companies?.name || 'Company'} | TalentXcel`,
    description: `${job.title} position in ${job.location || 'Remote'} • ${salary} • ${job.employment_type || 'Full-time'} • Apply now on TalentXcel`,
    image: job.companies?.logo_url || '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
    url: `${window.location.origin}/jobs/${job.id}`,
    type: 'article'
  });
};

export const generateProfileMetaTags = (profile: any) => {
  updateMetaTags({
    title: `${profile.full_name || 'Professional'} - ${profile.title || 'TalentXcel Member'} | TalentXcel`,
    description: `Connect with ${profile.full_name || 'this professional'} on TalentXcel • ${profile.title || ''} ${profile.location ? `in ${profile.location}` : ''} • ${profile.experience_years || 0}+ years experience`,
    image: profile.profile_picture_url || '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
    url: `${window.location.origin}/network/profile/${profile.id}`,
    type: 'profile'
  });
};

export const generateCompanyMetaTags = (company: any) => {
  updateMetaTags({
    title: `${company.name} | Company Profile | TalentXcel`,
    description: `Explore career opportunities at ${company.name} • ${company.industry || 'Technology'} • ${company.location || 'Multiple locations'} • ${company.size_range || 'Growing team'}`,
    image: company.logo_url || '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
    url: `${window.location.origin}/companies/${company.id}`,
    type: 'organization'
  });
};

export const generateCourseMetaTags = (course: any) => {
  updateMetaTags({
    title: `${course.title} by ${course.instructor_name || 'Expert'} | TalentXcel Learning`,
    description: `Learn ${course.skills_taught?.join(', ') || 'new skills'} • ${course.duration_hours}h course • ${course.difficulty_level} level • ${course.is_free ? 'Free' : `₹${course.price}`}`,
    image: course.thumbnail_url || '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
    url: `${window.location.origin}/learning/courses/${course.id}`,
    type: 'article'
  });
};
