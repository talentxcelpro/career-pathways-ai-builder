export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional' | 'academic';
  preview: string;
  isPremium: boolean;
  features: string[];
  colorSchemes: Array<{
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  }>;
  layout: {
    columns: 1 | 2;
    headerStyle: 'centered' | 'left' | 'right' | 'split';
    sectionStyle: 'boxed' | 'minimal' | 'bordered' | 'highlighted';
    typography: 'modern' | 'classic' | 'condensed' | 'elegant';
  };
  customization: {
    allowFontChange: boolean;
    allowColorChange: boolean;
    allowLayoutChange: boolean;
    allowSectionReorder: boolean;
  };
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: 'Clean, modern template perfect for tech professionals',
    category: 'modern',
    preview: '/templates/modern-tech-preview.png',
    isPremium: false,
    features: ['ATS-Optimized', 'Single Column', 'Clean Typography', 'Skills Progress Bars'],
    colorSchemes: [
      { id: 'blue', name: 'Professional Blue', primary: '#2563eb', secondary: '#64748b', accent: '#3b82f6' },
      { id: 'green', name: 'Growth Green', primary: '#059669', secondary: '#64748b', accent: '#10b981' },
      { id: 'purple', name: 'Creative Purple', primary: '#7c3aed', secondary: '#64748b', accent: '#8b5cf6' }
    ],
    layout: {
      columns: 1,
      headerStyle: 'left',
      sectionStyle: 'minimal',
      typography: 'modern'
    },
    customization: {
      allowFontChange: true,
      allowColorChange: true,
      allowLayoutChange: false,
      allowSectionReorder: true
    }
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    description: 'Traditional, authoritative template for senior roles',
    category: 'classic',
    preview: '/templates/executive-classic-preview.png',
    isPremium: true,
    features: ['Two Column', 'Professional Header', 'Achievement Focus', 'Executive Summary'],
    colorSchemes: [
      { id: 'navy', name: 'Executive Navy', primary: '#1e3a8a', secondary: '#475569', accent: '#3730a3' },
      { id: 'charcoal', name: 'Charcoal Gray', primary: '#374151', secondary: '#6b7280', accent: '#4b5563' },
      { id: 'burgundy', name: 'Burgundy', primary: '#991b1b', secondary: '#64748b', accent: '#dc2626' }
    ],
    layout: {
      columns: 2,
      headerStyle: 'centered',
      sectionStyle: 'bordered',
      typography: 'classic'
    },
    customization: {
      allowFontChange: true,
      allowColorChange: true,
      allowLayoutChange: true,
      allowSectionReorder: true
    }
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Vibrant, creative template for design professionals',
    category: 'creative',
    preview: '/templates/creative-designer-preview.png',
    isPremium: true,
    features: ['Creative Layout', 'Portfolio Section', 'Visual Skills', 'Color Accents'],
    colorSchemes: [
      { id: 'coral', name: 'Coral Sunset', primary: '#f97316', secondary: '#64748b', accent: '#fb923c' },
      { id: 'teal', name: 'Ocean Teal', primary: '#0d9488', secondary: '#64748b', accent: '#14b8a6' },
      { id: 'pink', name: 'Creative Pink', primary: '#ec4899', secondary: '#64748b', accent: '#f472b6' }
    ],
    layout: {
      columns: 2,
      headerStyle: 'split',
      sectionStyle: 'highlighted',
      typography: 'modern'
    },
    customization: {
      allowFontChange: true,
      allowColorChange: true,
      allowLayoutChange: true,
      allowSectionReorder: true
    }
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Ultra-clean, minimalist design focusing on content',
    category: 'minimal',
    preview: '/templates/minimal-clean-preview.png',
    isPremium: false,
    features: ['Minimal Design', 'Typography Focus', 'White Space', 'Simple Layout'],
    colorSchemes: [
      { id: 'black', name: 'Classic Black', primary: '#000000', secondary: '#64748b', accent: '#374151' },
      { id: 'gray', name: 'Neutral Gray', primary: '#4b5563', secondary: '#9ca3af', accent: '#6b7280' },
      { id: 'blue-minimal', name: 'Minimal Blue', primary: '#1e40af', secondary: '#64748b', accent: '#3b82f6' }
    ],
    layout: {
      columns: 1,
      headerStyle: 'left',
      sectionStyle: 'minimal',
      typography: 'condensed'
    },
    customization: {
      allowFontChange: false,
      allowColorChange: true,
      allowLayoutChange: false,
      allowSectionReorder: true
    }
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: 'Scholarly template for academic and research positions',
    category: 'academic',
    preview: '/templates/academic-research-preview.png',
    isPremium: true,
    features: ['Publications Section', 'Research Focus', 'Academic Format', 'References'],
    colorSchemes: [
      { id: 'academic-blue', name: 'Academic Blue', primary: '#1e40af', secondary: '#64748b', accent: '#2563eb' },
      { id: 'forest', name: 'Forest Green', primary: '#166534', secondary: '#64748b', accent: '#16a34a' },
      { id: 'maroon', name: 'Academic Maroon', primary: '#7f1d1d', secondary: '#64748b', accent: '#b91c1c' }
    ],
    layout: {
      columns: 1,
      headerStyle: 'centered',
      sectionStyle: 'bordered',
      typography: 'classic'
    },
    customization: {
      allowFontChange: true,
      allowColorChange: true,
      allowLayoutChange: false,
      allowSectionReorder: true
    }
  },
  {
    id: 'startup-dynamic',
    name: 'Startup Dynamic',
    description: 'Energetic template for startup and entrepreneurial roles',
    category: 'modern',
    preview: '/templates/startup-dynamic-preview.png',
    isPremium: false,
    features: ['Dynamic Layout', 'Startup Focus', 'Skills Emphasis', 'Growth Metrics'],
    colorSchemes: [
      { id: 'startup-orange', name: 'Startup Orange', primary: '#ea580c', secondary: '#64748b', accent: '#f97316' },
      { id: 'innovation', name: 'Innovation Blue', primary: '#0284c7', secondary: '#64748b', accent: '#0ea5e9' },
      { id: 'energy', name: 'Energy Red', primary: '#dc2626', secondary: '#64748b', accent: '#ef4444' }
    ],
    layout: {
      columns: 2,
      headerStyle: 'split',
      sectionStyle: 'boxed',
      typography: 'modern'
    },
    customization: {
      allowFontChange: true,
      allowColorChange: true,
      allowLayoutChange: true,
      allowSectionReorder: true
    }
  }
];

export const getTemplatesByCategory = (category: ResumeTemplate['category']) => {
  return resumeTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return resumeTemplates.find(template => template.id === id);
};

export const getFreeTemplates = () => {
  return resumeTemplates.filter(template => !template.isPremium);
};

export const getPremiumTemplates = () => {
  return resumeTemplates.filter(template => template.isPremium);
};