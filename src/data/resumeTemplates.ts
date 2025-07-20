export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  features: string[];
  atsScore: number;
  isRecommended?: boolean;
  isPremium?: boolean;
  colorSchemes: {
    id: string;
    name: string;
    primary: string;
    accent: string;
  }[];
  layout: {
    columns: string;
    typography: string;
  };
}

export const resumeTemplates: ResumeTemplate[] = [
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
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Professional Blue', primary: '#2563eb', accent: '#3b82f6' },
      { id: 'green', name: 'Growth Green', primary: '#059669', accent: '#10b981' },
      { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'gray', name: 'Neutral Gray', primary: '#374151', accent: '#6b7280' }
    ],
    layout: {
      columns: '2',
      typography: 'Modern'
    }
  },
  {
    id: 'startup-creative',
    name: 'Startup Creative',
    category: 'Modern',
    description: 'Bold and creative design for startup and creative roles',
    preview: '/api/placeholder/300/400',
    features: ['Creative layout', 'Color accents', 'Visual elements', 'Modern typography'],
    atsScore: 85,
    isPremium: true,
    colorSchemes: [
      { id: 'orange', name: 'Vibrant Orange', primary: '#ea580c', accent: '#f97316' },
      { id: 'red', name: 'Bold Red', primary: '#dc2626', accent: '#ef4444' },
      { id: 'teal', name: 'Fresh Teal', primary: '#0d9488', accent: '#14b8a6' },
      { id: 'pink', name: 'Creative Pink', primary: '#db2777', accent: '#ec4899' }
    ],
    layout: {
      columns: '2',
      typography: 'Creative'
    }
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing Pro',
    category: 'Modern',
    description: 'Optimized for digital marketing and social media professionals',
    preview: '/api/placeholder/300/400',
    features: ['Portfolio showcase', 'Metrics focus', 'Social links', 'Campaign highlights'],
    atsScore: 90,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Digital Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'green', name: 'Growth Green', primary: '#059669', accent: '#10b981' },
      { id: 'orange', name: 'Energy Orange', primary: '#ea580c', accent: '#f97316' }
    ],
    layout: {
      columns: '2',
      typography: 'Modern'
    }
  },
  {
    id: 'data-science',
    name: 'Data Science Expert',
    category: 'Technical',
    description: 'Technical layout perfect for data scientists and analysts',
    preview: '/api/placeholder/300/400',
    features: ['Technical skills', 'Project showcase', 'GitHub integration', 'Clean layout'],
    atsScore: 92,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Data Blue', primary: '#1e40af', accent: '#3b82f6' },
      { id: 'gray', name: 'Tech Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'green', name: 'Analytics Green', primary: '#047857', accent: '#10b981' },
      { id: 'purple', name: 'Science Purple', primary: '#6d28d9', accent: '#8b5cf6' }
    ],
    layout: {
      columns: '2',
      typography: 'Technical'
    }
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
    isPremium: false,
    colorSchemes: [
      { id: 'black', name: 'Classic Black', primary: '#111827', accent: '#374151' },
      { id: 'blue', name: 'Professional Blue', primary: '#1e40af', accent: '#3b82f6' },
      { id: 'gray', name: 'Corporate Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'green', name: 'Business Green', primary: '#047857', accent: '#10b981' }
    ],
    layout: {
      columns: '1',
      typography: 'Classic'
    }
  },
  {
    id: 'banking-finance',
    name: 'Banking & Finance',
    category: 'Traditional',
    description: 'Conservative design for banking and financial services',
    preview: '/api/placeholder/300/400',
    features: ['Conservative style', 'Achievement focus', 'Corporate design', 'Traditional formatting'],
    atsScore: 96,
    isPremium: false,
    colorSchemes: [
      { id: 'navy', name: 'Navy Blue', primary: '#1e3a8a', accent: '#3b82f6' },
      { id: 'gray', name: 'Financial Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'black', name: 'Executive Black', primary: '#111827', accent: '#374151' },
      { id: 'blue', name: 'Trust Blue', primary: '#1d4ed8', accent: '#3b82f6' }
    ],
    layout: {
      columns: '1',
      typography: 'Conservative'
    }
  },
  {
    id: 'legal-professional',
    name: 'Legal Professional',
    category: 'Traditional',
    description: 'Formal layout for legal and law professionals',
    preview: '/api/placeholder/300/400',
    features: ['Formal design', 'Education focus', 'Bar admissions', 'Case experience'],
    atsScore: 94,
    isPremium: false,
    colorSchemes: [
      { id: 'black', name: 'Legal Black', primary: '#111827', accent: '#374151' },
      { id: 'navy', name: 'Judicial Navy', primary: '#1e3a8a', accent: '#3b82f6' },
      { id: 'gray', name: 'Formal Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'brown', name: 'Law Brown', primary: '#92400e', accent: '#d97706' }
    ],
    layout: {
      columns: '1',
      typography: 'Formal'
    }
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare Medical',
    category: 'Traditional',
    description: 'Professional design for healthcare and medical professionals',
    preview: '/api/placeholder/300/400',
    features: ['Medical format', 'Certification focus', 'Clinical experience', 'Clean design'],
    atsScore: 93,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Medical Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'green', name: 'Health Green', primary: '#047857', accent: '#10b981' },
      { id: 'gray', name: 'Clinical Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'teal', name: 'Care Teal', primary: '#0f766e', accent: '#14b8a6' }
    ],
    layout: {
      columns: '1',
      typography: 'Medical'
    }
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
    isPremium: true,
    colorSchemes: [
      { id: 'rainbow', name: 'Creative Rainbow', primary: '#8b5cf6', accent: '#ec4899' },
      { id: 'purple', name: 'Design Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'orange', name: 'Creative Orange', primary: '#ea580c', accent: '#f97316' },
      { id: 'pink', name: 'Artistic Pink', primary: '#db2777', accent: '#ec4899' }
    ],
    layout: {
      columns: '2',
      typography: 'Creative'
    }
  },
  {
    id: 'marketing-creative',
    name: 'Marketing Creative',
    category: 'Creative',
    description: 'Eye-catching design for marketing and advertising professionals',
    preview: '/api/placeholder/300/400',
    features: ['Campaign highlights', 'Visual metrics', 'Brand focus', 'Creative elements'],
    atsScore: 82,
    isPremium: true,
    colorSchemes: [
      { id: 'red', name: 'Campaign Red', primary: '#dc2626', accent: '#ef4444' },
      { id: 'orange', name: 'Brand Orange', primary: '#ea580c', accent: '#f97316' },
      { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'blue', name: 'Marketing Blue', primary: '#1d4ed8', accent: '#3b82f6' }
    ],
    layout: {
      columns: '2',
      typography: 'Bold'
    }
  },
  {
    id: 'media-arts',
    name: 'Media & Arts',
    category: 'Creative',
    description: 'Artistic layout for media, arts, and entertainment professionals',
    preview: '/api/placeholder/300/400',
    features: ['Artistic design', 'Portfolio links', 'Creative projects', 'Media focus'],
    atsScore: 75,
    isPremium: true,
    colorSchemes: [
      { id: 'purple', name: 'Artistic Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'pink', name: 'Creative Pink', primary: '#db2777', accent: '#ec4899' },
      { id: 'orange', name: 'Media Orange', primary: '#ea580c', accent: '#f97316' },
      { id: 'teal', name: 'Arts Teal', primary: '#0f766e', accent: '#14b8a6' }
    ],
    layout: {
      columns: '2',
      typography: 'Artistic'
    }
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
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Engineering Blue', primary: '#1e40af', accent: '#3b82f6' },
      { id: 'gray', name: 'Technical Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'green', name: 'Innovation Green', primary: '#047857', accent: '#10b981' },
      { id: 'navy', name: 'Professional Navy', primary: '#1e3a8a', accent: '#3b82f6' }
    ],
    layout: {
      columns: '2',
      typography: 'Technical'
    }
  },
  {
    id: 'sales-executive',
    name: 'Sales Executive',
    category: 'Business',
    description: 'Results-driven design for sales and business development',
    preview: '/api/placeholder/300/400',
    features: ['Metrics focus', 'Achievement emphasis', 'Client testimonials', 'Results-driven'],
    atsScore: 89,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Success Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'green', name: 'Growth Green', primary: '#047857', accent: '#10b981' },
      { id: 'orange', name: 'Energy Orange', primary: '#ea580c', accent: '#f97316' },
      { id: 'red', name: 'Performance Red', primary: '#dc2626', accent: '#ef4444' }
    ],
    layout: {
      columns: '2',
      typography: 'Business'
    }
  },
  {
    id: 'hr-professional',
    name: 'HR Professional',
    category: 'Business',
    description: 'People-focused design for HR and talent acquisition roles',
    preview: '/api/placeholder/300/400',
    features: ['People focus', 'Soft skills emphasis', 'Culture fit', 'Relationship building'],
    atsScore: 87,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'People Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'green', name: 'Growth Green', primary: '#047857', accent: '#10b981' },
      { id: 'purple', name: 'Culture Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'teal', name: 'HR Teal', primary: '#0f766e', accent: '#14b8a6' }
    ],
    layout: {
      columns: '2',
      typography: 'Friendly'
    }
  },
  {
    id: 'education-teacher',
    name: 'Education Professional',
    category: 'Education',
    description: 'Academic-focused design for teachers and educators',
    preview: '/api/placeholder/300/400',
    features: ['Education focus', 'Certification display', 'Teaching experience', 'Academic achievements'],
    atsScore: 88,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Academic Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'green', name: 'Learning Green', primary: '#047857', accent: '#10b981' },
      { id: 'purple', name: 'Knowledge Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'orange', name: 'Teaching Orange', primary: '#ea580c', accent: '#f97316' }
    ],
    layout: {
      columns: '1',
      typography: 'Academic'
    }
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
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Fresh Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'green', name: 'New Green', primary: '#047857', accent: '#10b981' },
      { id: 'purple', name: 'Potential Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'orange', name: 'Energy Orange', primary: '#ea580c', accent: '#f97316' }
    ],
    layout: {
      columns: '1',
      typography: 'Modern'
    }
  },
  {
    id: 'mid-career',
    name: 'Mid-Career Professional',
    category: 'Mid Level',
    description: 'Balanced design for experienced professionals',
    preview: '/api/placeholder/300/400',
    features: ['Experience focus', 'Achievement emphasis', 'Skill development', 'Career progression'],
    atsScore: 90,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Professional Blue', primary: '#1e40af', accent: '#3b82f6' },
      { id: 'gray', name: 'Experience Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'green', name: 'Career Green', primary: '#047857', accent: '#10b981' },
      { id: 'navy', name: 'Mature Navy', primary: '#1e3a8a', accent: '#3b82f6' }
    ],
    layout: {
      columns: '2',
      typography: 'Professional'
    }
  },
  {
    id: 'executive-leader',
    name: 'Executive Leader',
    category: 'Executive',
    description: 'Premium design for C-level and senior executives',
    preview: '/api/placeholder/300/400',
    features: ['Leadership focus', 'Board experience', 'Strategic achievements', 'Executive summary'],
    atsScore: 93,
    isPremium: true,
    colorSchemes: [
      { id: 'black', name: 'Executive Black', primary: '#111827', accent: '#374151' },
      { id: 'navy', name: 'Leadership Navy', primary: '#1e3a8a', accent: '#3b82f6' },
      { id: 'gray', name: 'Corporate Gray', primary: '#374151', accent: '#6b7280' },
      { id: 'blue', name: 'Authority Blue', primary: '#1e40af', accent: '#3b82f6' }
    ],
    layout: {
      columns: '2',
      typography: 'Executive'
    }
  },
  {
    id: 'career-change',
    name: 'Career Transition',
    category: 'Career Change',
    description: 'Designed for professionals changing careers or industries',
    preview: '/api/placeholder/300/400',
    features: ['Transferable skills', 'Career narrative', 'Skill translation', 'Adaptability focus'],
    atsScore: 84,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Transition Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'green', name: 'Change Green', primary: '#047857', accent: '#10b981' },
      { id: 'purple', name: 'Adapt Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'teal', name: 'Transform Teal', primary: '#0f766e', accent: '#14b8a6' }
    ],
    layout: {
      columns: '2',
      typography: 'Adaptive'
    }
  },
  {
    id: 'freelancer-consultant',
    name: 'Freelancer & Consultant',
    category: 'Freelance',
    description: 'Portfolio-style design for freelancers and consultants',
    preview: '/api/placeholder/300/400',
    features: ['Client testimonials', 'Rate display', 'Portfolio showcase', 'Service highlights'],
    atsScore: 80,
    isPremium: false,
    colorSchemes: [
      { id: 'blue', name: 'Freelance Blue', primary: '#1d4ed8', accent: '#3b82f6' },
      { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', accent: '#8b5cf6' },
      { id: 'orange', name: 'Independent Orange', primary: '#ea580c', accent: '#f97316' },
      { id: 'green', name: 'Success Green', primary: '#047857', accent: '#10b981' }
    ],
    layout: {
      columns: '2',
      typography: 'Flexible'
    }
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