export interface EnhancedExtractedContent {
  // 1. Personal Information
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string; // City, State, Country
    linkedin?: string;
    portfolio?: string;
    website?: string;
    dateOfBirth?: string;
    nationality?: string;
  };

  // 2. Professional Summary/Objective
  professionalSummary: {
    content: string;
    careerBackground?: string;
    keySkills?: string[];
    targetRoles?: string[];
    goals?: string;
  };

  // 3. Work Experience
  experience: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    location: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    achievements: string[];
    skillsUsed?: string[];
    tools?: string[];
  }>;

  // 4. Education
  education: Array<{
    id: string;
    degree: string;
    institutionName: string;
    location: string;
    startDate: string;
    endDate: string;
    grade?: string;
    percentage?: string;
    cgpa?: string;
    honors?: string;
    coursework?: string[];
  }>;

  // 5. Skills
  skills: {
    technical: Array<{
      skill: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      category?: string;
    }>;
    soft: Array<{
      skill: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    languages: Array<{
      language: string;
      proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
    }>;
  };

  // 6. Certifications/Courses
  certifications: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;

  // 7. Projects
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    startDate?: string;
    endDate?: string;
    githubUrl?: string;
    liveUrl?: string;
    role?: string;
    achievements?: string[];
  }>;

  // 8. Languages
  languages: Array<{
    language: string;
    proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
    certifications?: string[];
  }>;

  // 9. Awards & Achievements
  awards: Array<{
    id: string;
    name: string;
    issuer?: string;
    date: string;
    description?: string;
    context?: string;
  }>;

  // 10. Hobbies/Interests
  hobbies: Array<{
    category: string;
    items: string[];
  }>;

  // 11. Declaration/References
  additional: {
    declaration?: string;
    references?: Array<{
      name: string;
      position: string;
      company: string;
      phone?: string;
      email?: string;
      relationship: string;
    }>;
    availableUponRequest?: boolean;
  };

  // Metadata for processing
  metadata: {
    extractionMethod: 'pdf' | 'docx' | 'ocr' | 'manual' | 'ai-parser';
    processingDate: string;
    atsScore?: number;
    completionPercentage?: number;
    enhancementSuggestions?: string[];
  };
}

export interface EnhancementScore {
  overall: number;
  atsCompatibility: number;
  professionalTone: number;
  achievementCoverage: number;
  skillDepth: number;
  sections: {
    personalInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    certifications: number;
    projects: number;
    awards: number;
  };
}

export interface EnhancementSuggestion {
  section: string;
  type: 'missing' | 'improvement' | 'optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
  impact: string;
  actionable: boolean;
}