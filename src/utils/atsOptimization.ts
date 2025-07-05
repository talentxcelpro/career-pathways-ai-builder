export interface ATSScore {
  overall: number;
  breakdown: {
    keywords: number;
    formatting: number;
    sections: number;
    contact: number;
    skills: number;
  };
  suggestions: ATSSuggestion[];
}

export interface ATSSuggestion {
  category: 'keywords' | 'formatting' | 'sections' | 'contact' | 'skills';
  priority: 'high' | 'medium' | 'low';
  issue: string;
  suggestion: string;
  impact: number; // Points improvement
}

export interface KeywordAnalysis {
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordDensity: Record<string, number>;
  relevanceScore: number;
}

// Standard ATS-friendly section names
const ATS_FRIENDLY_SECTIONS = [
  'work experience',
  'professional experience',
  'employment history',
  'education',
  'skills',
  'technical skills',
  'core competencies',
  'certifications',
  'professional certifications',
  'projects',
  'achievements',
  'awards'
];

// Common ATS-unfriendly elements
const ATS_UNFRIENDLY_ELEMENTS = [
  'tables',
  'columns',
  'text boxes',
  'headers/footers',
  'images',
  'graphics',
  'unusual fonts',
  'fancy formatting'
];

export const analyzeATSCompatibility = (resumeData: any): ATSScore => {
  const suggestions: ATSSuggestion[] = [];
  
  // Analyze Keywords (0-25 points)
  const keywordScore = analyzeKeywords(resumeData, suggestions);
  
  // Analyze Formatting (0-25 points)
  const formattingScore = analyzeFormatting(resumeData, suggestions);
  
  // Analyze Sections (0-20 points)
  const sectionsScore = analyzeSections(resumeData, suggestions);
  
  // Analyze Contact Info (0-15 points)
  const contactScore = analyzeContactInfo(resumeData, suggestions);
  
  // Analyze Skills Section (0-15 points)
  const skillsScore = analyzeSkills(resumeData, suggestions);
  
  const overall = keywordScore + formattingScore + sectionsScore + contactScore + skillsScore;
  
  return {
    overall: Math.round(overall),
    breakdown: {
      keywords: Math.round(keywordScore),
      formatting: Math.round(formattingScore),
      sections: Math.round(sectionsScore),
      contact: Math.round(contactScore),
      skills: Math.round(skillsScore)
    },
    suggestions: suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority] || b.impact - a.impact;
    })
  };
};

const analyzeKeywords = (resumeData: any, suggestions: ATSSuggestion[]): number => {
  let score = 0;
  
  // Check if resume has sufficient keyword density
  const allText = extractAllText(resumeData).toLowerCase();
  const wordCount = allText.split(/\s+/).length;
  
  if (wordCount < 200) {
    suggestions.push({
      category: 'keywords',
      priority: 'high',
      issue: 'Resume content is too brief',
      suggestion: 'Add more detailed descriptions to your experience and skills sections. Aim for 300-500 words total.',
      impact: 8
    });
    score += 10; // Partial credit
  } else if (wordCount < 300) {
    suggestions.push({
      category: 'keywords',
      priority: 'medium',
      issue: 'Resume could benefit from more detailed content',
      suggestion: 'Consider adding more specific achievements and technical details.',
      impact: 5
    });
    score += 18;
  } else {
    score += 25;
  }
  
  // Check for action verbs
  const actionVerbs = [
    'achieved', 'developed', 'managed', 'led', 'created', 'implemented',
    'improved', 'increased', 'reduced', 'optimized', 'designed', 'built'
  ];
  
  const actionVerbCount = actionVerbs.filter(verb => allText.includes(verb)).length;
  if (actionVerbCount < 3) {
    suggestions.push({
      category: 'keywords',
      priority: 'medium',
      issue: 'Limited use of strong action verbs',
      suggestion: 'Start bullet points with action verbs like "developed", "managed", "implemented".',
      impact: 6
    });
  }
  
  return Math.min(score, 25);
};

const analyzeFormatting = (resumeData: any, suggestions: ATSSuggestion[]): number => {
  let score = 25; // Start with full points, deduct for issues
  
  // Check for proper contact information format
  const email = resumeData.personalInfo?.email;
  if (email && !isValidEmail(email)) {
    suggestions.push({
      category: 'formatting',
      priority: 'high',
      issue: 'Invalid email format',
      suggestion: 'Ensure your email address is in a standard format (e.g., name@email.com).',
      impact: 8
    });
    score -= 8;
  }
  
  // Check for consistent date formatting
  const experiences = resumeData.experience || [];
  const inconsistentDates = experiences.some((exp: any) => 
    exp.startDate && !isConsistentDateFormat(exp.startDate)
  );
  
  if (inconsistentDates) {
    suggestions.push({
      category: 'formatting',
      priority: 'medium',
      issue: 'Inconsistent date formatting',
      suggestion: 'Use consistent date format throughout (e.g., "MM/YYYY" or "Month YYYY").',
      impact: 4
    });
    score -= 4;
  }
  
  return Math.max(score, 0);
};

const analyzeSections = (resumeData: any, suggestions: ATSSuggestion[]): number => {
  let score = 0;
  
  // Check for essential sections
  const hasExperience = resumeData.experience && resumeData.experience.length > 0;
  const hasEducation = resumeData.education && resumeData.education.length > 0;
  const hasSkills = resumeData.skills && resumeData.skills.length > 0;
  
  if (hasExperience) score += 8;
  else {
    suggestions.push({
      category: 'sections',
      priority: 'high',
      issue: 'Missing work experience section',
      suggestion: 'Add your professional work experience with detailed descriptions.',
      impact: 8
    });
  }
  
  if (hasEducation) score += 6;
  else {
    suggestions.push({
      category: 'sections',
      priority: 'medium',
      issue: 'Missing education section',
      suggestion: 'Include your educational background and qualifications.',
      impact: 6
    });
  }
  
  if (hasSkills) score += 6;
  else {
    suggestions.push({
      category: 'sections',
      priority: 'high',
      issue: 'Missing skills section',
      suggestion: 'Add a dedicated skills section with relevant technical and professional skills.',
      impact: 6
    });
  }
  
  return Math.min(score, 20);
};

const analyzeContactInfo = (resumeData: any, suggestions: ATSSuggestion[]): number => {
  let score = 0;
  const personalInfo = resumeData.personalInfo || {};
  
  if (personalInfo.fullName) score += 5;
  else {
    suggestions.push({
      category: 'contact',
      priority: 'high',
      issue: 'Missing full name',
      suggestion: 'Include your full name at the top of your resume.',
      impact: 5
    });
  }
  
  if (personalInfo.email) score += 5;
  else {
    suggestions.push({
      category: 'contact',
      priority: 'high',
      issue: 'Missing email address',
      suggestion: 'Add a professional email address to your contact information.',
      impact: 5
    });
  }
  
  if (personalInfo.phone) score += 3;
  else {
    suggestions.push({
      category: 'contact',
      priority: 'medium',
      issue: 'Missing phone number',
      suggestion: 'Include a phone number for employers to contact you.',
      impact: 3
    });
  }
  
  if (personalInfo.location) score += 2;
  else {
    suggestions.push({
      category: 'contact',
      priority: 'low',
      issue: 'Missing location',
      suggestion: 'Add your city and state/country to show your location.',
      impact: 2
    });
  }
  
  return Math.min(score, 15);
};

const analyzeSkills = (resumeData: any, suggestions: ATSSuggestion[]): number => {
  let score = 0;
  const skills = resumeData.skills || [];
  
  if (skills.length === 0) {
    suggestions.push({
      category: 'skills',
      priority: 'high',
      issue: 'No skills listed',
      suggestion: 'Add relevant technical and professional skills to improve keyword matching.',
      impact: 15
    });
    return 0;
  }
  
  if (skills.length < 5) {
    suggestions.push({
      category: 'skills',
      priority: 'medium',
      issue: 'Limited skills listed',
      suggestion: 'Consider adding more relevant skills (aim for 8-12 skills).',
      impact: 5
    });
    score += 10;
  } else if (skills.length > 20) {
    suggestions.push({
      category: 'skills',
      priority: 'medium',
      issue: 'Too many skills listed',
      suggestion: 'Focus on your most relevant and strongest skills (8-12 is optimal).',
      impact: 3
    });
    score += 12;
  } else {
    score += 15;
  }
  
  return Math.min(score, 15);
};

// Helper functions
const extractAllText = (resumeData: any): string => {
  let text = '';
  
  // Personal info
  if (resumeData.personalInfo) {
    text += `${resumeData.personalInfo.fullName || ''} `;
    text += `${resumeData.personalInfo.summary || ''} `;
  }
  
  // Experience
  if (resumeData.experience && Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach((exp: any) => {
      text += `${exp.title || exp.position || ''} `;
      text += `${exp.company || ''} `;
      text += `${exp.description || ''} `;
    });
  }
  
  // Education
  if (resumeData.education && Array.isArray(resumeData.education)) {
    resumeData.education.forEach((edu: any) => {
      text += `${edu.degree || ''} `;
      text += `${edu.school || ''} `;
    });
  }
  
  // Skills
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    text += resumeData.skills.join(' ') + ' ';
  }
  
  // Projects
  if (resumeData.projects && Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach((project: any) => {
      text += `${project.title || ''} `;
      text += `${project.description || ''} `;
    });
  }
  
  return text;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isConsistentDateFormat = (date: string): boolean => {
  // Check for common date formats
  const formats = [
    /^\d{2}\/\d{4}$/, // MM/YYYY
    /^\d{1,2}\/\d{4}$/, // M/YYYY
    /^[A-Za-z]+ \d{4}$/, // Month YYYY
    /^\d{4}$/ // YYYY
  ];
  
  return formats.some(format => format.test(date.trim()));
};

export const generateKeywordSuggestions = async (resumeContent: string, jobDescription?: string): Promise<string[]> => {
  // This would integrate with AI service for keyword analysis
  // For now, return some common professional keywords
  const commonKeywords = [
    'leadership', 'management', 'teamwork', 'communication', 'problem-solving',
    'project management', 'strategic planning', 'data analysis', 'customer service',
    'innovation', 'collaboration', 'results-driven', 'cross-functional'
  ];
  
  return commonKeywords.slice(0, 8);
};