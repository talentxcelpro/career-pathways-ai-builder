
export const resumeTemplates = [
  // Modern Templates
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    category: 'Modern',
    description: 'Clean design perfect for tech professionals and developers',
    preview: '/api/placeholder/300/400',
    features: ['ATS-friendly', 'Two-column', 'Skill bars', 'Modern design'],
    atsScore: 95,
    isRecommended: true,
    colorSchemes: ['blue', 'green', 'purple', 'gray']
  },
  {
    id: 'startup-creative',
    name: 'Startup Creative',
    category: 'Modern',
    description: 'Bold and creative design for startup and creative roles',
    preview: '/api/placeholder/300/400',
    features: ['Creative layout', 'Color accents', 'Visual elements', 'Modern typography'],
    atsScore: 85,
    colorSchemes: ['orange', 'red', 'teal', 'pink']
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing Pro',
    category: 'Modern',
    description: 'Optimized for digital marketing and social media professionals',
    preview: '/api/placeholder/300/400',
    features: ['Portfolio showcase', 'Metrics focus', 'Social links', 'Campaign highlights'],
    atsScore: 90,
    colorSchemes: ['blue', 'purple', 'green', 'orange']
  },
  {
    id: 'data-science',
    name: 'Data Science Expert',
    category: 'Technical',
    description: 'Technical layout perfect for data scientists and analysts',
    preview: '/api/placeholder/300/400',
    features: ['Technical skills', 'Project showcase', 'GitHub integration', 'Clean layout'],
    atsScore: 92,
    colorSchemes: ['blue', 'gray', 'green', 'purple']
  },

  // Traditional Templates
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    category: 'Traditional',
    description: 'Timeless design suitable for all industries',
    preview: '/api/placeholder/300/400',
    features: ['ATS-optimized', 'Single column', 'Traditional layout', 'Universal format'],
    atsScore: 98,
    isRecommended: true,
    colorSchemes: ['black', 'blue', 'gray', 'green']
  },
  {
    id: 'banking-finance',
    name: 'Banking & Finance',
    category: 'Traditional',
    description: 'Conservative design for banking and financial services',
    preview: '/api/placeholder/300/400',
    features: ['Conservative style', 'Achievement focus', 'Corporate design', 'Traditional formatting'],
    atsScore: 96,
    colorSchemes: ['navy', 'gray', 'black', 'blue']
  },
  {
    id: 'legal-professional',
    name: 'Legal Professional',
    category: 'Traditional',
    description: 'Formal layout for legal and law professionals',
    preview: '/api/placeholder/300/400',
    features: ['Formal design', 'Education focus', 'Bar admissions', 'Case experience'],
    atsScore: 94,
    colorSchemes: ['black', 'navy', 'gray', 'brown']
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare Medical',
    category: 'Traditional',
    description: 'Professional design for healthcare and medical professionals',
    preview: '/api/placeholder/300/400',
    features: ['Medical format', 'Certification focus', 'Clinical experience', 'Clean design'],
    atsScore: 93,
    colorSchemes: ['blue', 'green', 'gray', 'teal']
  },

  // Creative Templates
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    category: 'Creative',
    description: 'Visual portfolio-focused design for graphic designers',
    preview: '/api/placeholder/300/400',
    features: ['Portfolio showcase', 'Visual elements', 'Creative layout', 'Color emphasis'],
    atsScore: 78,
    colorSchemes: ['rainbow', 'purple', 'orange', 'pink']
  },
  {
    id: 'marketing-creative',
    name: 'Marketing Creative',
    category: 'Creative',
    description: 'Eye-catching design for marketing and advertising professionals',
    preview: '/api/placeholder/300/400',
    features: ['Campaign highlights', 'Visual metrics', 'Brand focus', 'Creative elements'],
    atsScore: 82,
    colorSchemes: ['red', 'orange', 'purple', 'blue']
  },
  {
    id: 'media-arts',
    name: 'Media & Arts',
    category: 'Creative',
    description: 'Artistic layout for media, arts, and entertainment professionals',
    preview: '/api/placeholder/300/400',
    features: ['Artistic design', 'Portfolio links', 'Creative projects', 'Media focus'],
    atsScore: 75,
    colorSchemes: ['purple', 'pink', 'orange', 'teal']
  },

  // Industry-Specific Templates
  {
    id: 'engineering',
    name: 'Engineering Professional',
    category: 'Engineering',
    description: 'Technical layout for engineers and technical professionals',
    preview: '/api/placeholder/300/400',
    features: ['Technical focus', 'Project details', 'Certification emphasis', 'Clean structure'],
    atsScore: 91,
    colorSchemes: ['blue', 'gray', 'green', 'navy']
  },
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    category: 'Business',
    description: 'Results-driven design for sales and business development',
    preview: '/api/placeholder/300/400',
    features: ['Metrics focus', 'Achievement emphasis', 'Client testimonials', 'Results-driven'],
    atsScore: 89,
    colorSchemes: ['blue', 'green', 'orange', 'red']
  },
  {
    id: 'hr-professional',
    name: 'HR Professional',
    category: 'Business',
    description: 'People-focused design for HR and talent acquisition roles',
    preview: '/api/placeholder/300/400',
    features: ['People focus', 'Soft skills emphasis', 'Culture fit', 'Relationship building'],
    atsScore: 87,
    colorSchemes: ['blue', 'green', 'purple', 'teal']
  },
  {
    id: 'education-teacher',
    name: 'Education Professional',
    category: 'Education',
    description: 'Academic-focused design for teachers and educators',
    preview: '/api/placeholder/300/400',
    features: ['Education focus', 'Certification display', 'Teaching experience', 'Academic achievements'],
    atsScore: 88,
    colorSchemes: ['blue', 'green', 'purple', 'orange']
  },

  // Experience-Level Templates
  {
    id: 'entry-level',
    name: 'Entry Level Professional',
    category: 'Entry Level',
    description: 'Perfect for new graduates and entry-level professionals',
    preview: '/api/placeholder/300/400',
    features: ['Education highlight', 'Internship focus', 'Potential-based', 'Skill emphasis'],
    atsScore: 86,
    isRecommended: true,
    colorSchemes: ['blue', 'green', 'purple', 'orange']
  },
  {
    id: 'mid-career',
    name: 'Mid-Career Professional',
    category: 'Mid Level',
    description: 'Balanced design for experienced professionals',
    preview: '/api/placeholder/300/400',
    features: ['Experience focus', 'Achievement emphasis', 'Skill development', 'Career progression'],
    atsScore: 90,
    colorSchemes: ['blue', 'gray', 'green', 'navy']
  },
  {
    id: 'executive-leader',
    name: 'Executive Leader',
    category: 'Executive',
    description: 'Premium design for C-level and senior executives',
    preview: '/api/placeholder/300/400',
    features: ['Leadership focus', 'Board experience', 'Strategic achievements', 'Executive summary'],
    atsScore: 93,
    colorSchemes: ['black', 'navy', 'gray', 'blue']
  },
  {
    id: 'career-change',
    name: 'Career Transition',
    category: 'Career Change',
    description: 'Designed for professionals changing careers or industries',
    preview: '/api/placeholder/300/400',
    features: ['Transferable skills', 'Career narrative', 'Skill translation', 'Adaptability focus'],
    atsScore: 84,
    colorSchemes: ['blue', 'green', 'purple', 'teal']
  },
  {
    id: 'freelancer-consultant',
    name: 'Freelancer & Consultant',
    category: 'Freelance',
    description: 'Portfolio-style design for freelancers and consultants',
    preview: '/api/placeholder/300/400',
    features: ['Client testimonials', 'Rate display', 'Portfolio showcase', 'Service highlights'],
    atsScore: 80,
    colorSchemes: ['blue', 'purple', 'orange', 'green']
  }
];

export const getTemplatesByCategory = (category?: string) => {
  if (!category) return resumeTemplates;
  return resumeTemplates.filter(template => template.category === category);
};

export const getRecommendedTemplates = () => {
  return resumeTemplates.filter(template => template.isRecommended);
};

export const getTemplateById = (id: string) => {
  return resumeTemplates.find(template => template.id === id);
};
