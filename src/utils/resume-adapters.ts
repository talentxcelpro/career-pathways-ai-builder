// ============================================
// RESUME DATA ADAPTERS - CONVERSION UTILITIES
// ============================================
// Converts between CoreResumeData and legacy formats for backward compatibility

import { CoreResumeData, CoreSkill, createEmptyResumeData } from '@/types/resume-core';
import { EditorResume, createEmptyEditorResume } from '@/types/editor-resume';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { Resume } from '@/types/resume';

// ============================================
// CORE TO LEGACY FORMAT ADAPTERS
// ============================================

export function coreToEditor(core: CoreResumeData): EditorResume {
  const editor = createEmptyEditorResume();
  
  // Personal Info
  editor.personalInfo = {
    fullName: core.personalInfo.fullName,
    professionalTitle: core.personalInfo.professionalTitle || '',
    email: core.personalInfo.email,
    phone: core.personalInfo.phone,
    location: core.personalInfo.location,
    linkedin: core.personalInfo.linkedin || '',
    github: core.personalInfo.github || '',
    website: core.personalInfo.website || '',
    summary: core.personalInfo.summary,
  };
  
  // Experience
  editor.experience = core.experience.map(exp => ({
    id: exp.id,
    title: exp.title,
    company: exp.company,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    description: exp.description,
    achievements: exp.achievements,
    technologies: exp.technologies,
  }));
  
  // Education
  editor.education = core.education.map(edu => ({
    id: edu.id,
    degree: edu.degree,
    institution: edu.institution,
    location: edu.location,
    startDate: edu.startDate,
    endDate: edu.endDate,
    description: edu.description || '',
    achievements: edu.relevantCoursework || [],
  }));
  
  // Skills - Group by category
  const groupedSkills = {
    technical: core.skills.filter(s => s.category === 'technical').map(s => s.name),
    soft: core.skills.filter(s => s.category === 'soft').map(s => s.name),
    languages: core.skills.filter(s => s.category === 'language').map(s => s.name),
    tools: core.skills.filter(s => s.category === 'tool').map(s => s.name),
  };
  
  editor.skills = groupedSkills;
  
  // Projects
  editor.projects = (core.projects || []).map(proj => ({
    id: proj.id,
    name: proj.name,
    description: proj.description,
    technologies: proj.technologies,
    link: proj.url || proj.githubUrl || '',
  }));
  
  // Certifications
  editor.certifications = (core.certifications || []).map(cert => ({
    id: cert.id,
    name: cert.name,
    issuer: cert.issuer,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate || '',
    credentialId: cert.credentialId || '',
    credentialUrl: cert.credentialUrl || '',
  }));
  
  // Awards
  editor.awards = (core.awards || []).map(award => ({
    id: award.id,
    name: award.name,
    issuer: award.issuer,
    date: award.date,
    description: award.description,
  }));
  
  // Volunteer Work
  editor.volunteerExperience = (core.volunteerWork || []).map(vol => ({
    id: vol.id,
    role: vol.role,
    organization: vol.organization,
    location: vol.location,
    startDate: vol.startDate,
    endDate: vol.endDate,
    description: vol.description,
  }));
  
  // References
  editor.references = (core.references || []).map(ref => ({
    id: ref.id,
    name: ref.name,
    relationship: ref.relationship,
    email: ref.email,
    phone: ref.phone,
  }));
  
  // Interests
  editor.interests = core.interests || [];
  
  // Settings
  editor.settings = {
    templateId: core.settings.templateId,
    fontFamily: core.settings.fontFamily,
    fontSize: core.settings.fontSize,
    lineHeight: 1.5,
    sectionOrder: core.settings.sectionOrder,
  };
  
  // Branding
  editor.branding = {
    logoUrl: '',
    tagline: '',
    colorScheme: core.settings.colorScheme,
  };
  
  editor.history = [];
  
  return editor;
}

export function coreToEnhanced(core: CoreResumeData): EnhancedResumeData {
  return {
    personalInfo: {
      fullName: core.personalInfo.fullName,
      email: core.personalInfo.email,
      phone: core.personalInfo.phone,
      location: core.personalInfo.location,
      summary: core.personalInfo.summary,
      linkedin: core.personalInfo.linkedin,
      website: core.personalInfo.website,
      github: core.personalInfo.github,
    },
    professionalSummary: {
      content: core.personalInfo.summary,
      keyHighlights: [],
    },
    experience: core.experience.map(exp => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      isCurrentRole: exp.current,
      description: exp.description,
      achievements: exp.achievements,
      skills: [],
      technologies: exp.technologies,
    })),
    education: core.education.map(edu => ({
      id: edu.id,
      degree: edu.degree,
      school: edu.institution,
      location: edu.location,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa,
      honors: edu.honors,
      relevantCoursework: edu.relevantCoursework,
    })),
    skills: core.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      level: skill.level,
      category: skill.category,
      years: skill.years,
    })),
    projects: (core.projects || []).map(proj => ({
      id: proj.id,
      title: proj.name,
      description: proj.description,
      technologies: proj.technologies,
      url: proj.url,
      githubUrl: proj.githubUrl,
      startDate: proj.startDate,
      endDate: proj.endDate,
      role: proj.role,
    })),
    certifications: (core.certifications || []).map(cert => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      date: cert.issueDate,
      expirationDate: cert.expiryDate,
      credentialId: cert.credentialId,
      url: cert.credentialUrl,
    })),
    awards: (core.awards || []).map(award => ({
      id: award.id,
      name: award.name,
      issuer: award.issuer,
      date: award.date,
      description: award.description,
    })),
    languages: core.skills
      .filter(s => s.category === 'language')
      .map((lang, i) => ({
        id: lang.id,
        name: lang.name,
        proficiency: lang.level === 'expert' ? 'native' : 
                    lang.level === 'advanced' ? 'fluent' :
                    lang.level === 'intermediate' ? 'conversational' : 'basic',
        certifications: [],
      })),
    publications: [],
    references: (core.references || []).map(ref => ({
      id: ref.id,
      name: ref.name,
      title: ref.title,
      company: ref.company,
      email: ref.email,
      phone: ref.phone,
      relationship: ref.relationship,
      available: true,
    })),
    volunteerWork: (core.volunteerWork || []).map(vol => ({
      id: vol.id,
      role: vol.role,
      organization: vol.organization,
      location: vol.location,
      startDate: vol.startDate,
      endDate: vol.endDate,
      current: vol.current,
      description: vol.description,
      impact: '',
      skills: [],
    })),
    trainings: [],
    tools: {
      development: core.skills.filter(s => s.category === 'tool').map(s => s.name),
      design: [],
      analytics: [],
      productivity: [],
      other: [],
    },
    careerObjectives: { statement: '', goals: [] },
    sectionOrder: core.settings.sectionOrder,
    selectedTemplate: core.settings.templateId,
    customization: {
      colorScheme: core.settings.colorScheme,
      fontFamily: core.settings.fontFamily,
      fontSize: core.settings.fontSize,
      spacing: core.settings.spacing,
    },
  };
}

export function coreToLegacy(core: CoreResumeData): Resume {
  return {
    id: core.metadata.id,
    personalInfo: {
      fullName: core.personalInfo.fullName,
      email: core.personalInfo.email,
      phone: core.personalInfo.phone,
      location: core.personalInfo.location,
      website: core.personalInfo.website,
      linkedin: core.personalInfo.linkedin,
    },
    summary: core.personalInfo.summary,
    experience: core.experience.map(exp => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      description: exp.description,
      achievements: exp.achievements,
    })),
    education: core.education.map(edu => ({
      id: edu.id,
      degree: edu.degree,
      school: edu.institution,
      location: edu.location,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa,
    })),
    skills: core.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category as any,
      level: skill.level,
    })),
    selectedTemplate: core.settings.templateId,
    atsScore: core.metadata.atsScore,
    createdAt: core.metadata.createdAt,
    updatedAt: core.metadata.updatedAt,
  };
}

// ============================================
// LEGACY TO CORE FORMAT ADAPTERS
// ============================================

export function editorToCore(editor: EditorResume): CoreResumeData {
  const core = createEmptyResumeData();
  
  // Personal Info
  core.personalInfo = {
    fullName: editor.personalInfo.fullName,
    professionalTitle: editor.personalInfo.professionalTitle,
    email: editor.personalInfo.email,
    phone: editor.personalInfo.phone,
    location: editor.personalInfo.location,
    linkedin: editor.personalInfo.linkedin,
    github: editor.personalInfo.github,
    website: editor.personalInfo.website,
    summary: editor.personalInfo.summary,
  };
  
  // Experience
  core.experience = (editor.experience || []).map(exp => ({
    id: exp.id,
    title: exp.title,
    company: exp.company,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    current: !exp.endDate || exp.endDate.toLowerCase().includes('present'),
    description: exp.description,
    achievements: exp.achievements || [],
    technologies: exp.technologies || [],
  }));
  
  // Education
  core.education = (editor.education || []).map(edu => ({
    id: edu.id,
    degree: edu.degree,
    institution: edu.institution,
    location: edu.location,
    startDate: edu.startDate,
    endDate: edu.endDate,
    description: edu.description,
    relevantCoursework: edu.achievements || [],
  }));
  
  // Skills - Convert grouped skills to individual skill objects
  const skills: CoreSkill[] = [];
  
  (editor.skills?.technical || []).forEach((name, i) => {
    skills.push({
      id: `tech-${i}`,
      name,
      level: 'intermediate',
      category: 'technical',
    });
  });
  
  (editor.skills?.soft || []).forEach((name, i) => {
    skills.push({
      id: `soft-${i}`,
      name,
      level: 'intermediate',
      category: 'soft',
    });
  });
  
  (editor.skills?.languages || []).forEach((name, i) => {
    skills.push({
      id: `lang-${i}`,
      name,
      level: 'intermediate',
      category: 'language',
    });
  });
  
  (editor.skills?.tools || []).forEach((name, i) => {
    skills.push({
      id: `tool-${i}`,
      name,
      level: 'intermediate',
      category: 'tool',
    });
  });
  
  core.skills = skills;
  
  // Projects
  core.projects = (editor.projects || []).map(proj => ({
    id: proj.id,
    name: proj.name,
    description: proj.description,
    technologies: proj.technologies || [],
    url: proj.link,
  }));
  
  // Certifications
  core.certifications = (editor.certifications || []).map(cert => ({
    id: cert.id,
    name: cert.name,
    issuer: cert.issuer,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    credentialId: cert.credentialId,
    credentialUrl: cert.credentialUrl,
  }));
  
  // Awards
  core.awards = editor.awards.map(award => ({
    id: award.id,
    name: award.name,
    issuer: award.issuer,
    date: award.date,
    description: award.description,
  }));
  
  // Volunteer Work
  core.volunteerWork = editor.volunteerExperience.map(vol => ({
    id: vol.id,
    role: vol.role,
    organization: vol.organization,
    location: vol.location,
    startDate: vol.startDate,
    endDate: vol.endDate,
    current: !vol.endDate,
    description: vol.description,
  }));
  
  // References
  core.references = editor.references.map(ref => ({
    id: ref.id,
    name: ref.name,
    title: '',
    company: '',
    email: ref.email,
    phone: ref.phone,
    relationship: ref.relationship,
  }));
  
  // Interests
  core.interests = editor.interests;
  
  // Settings
  core.settings = {
    templateId: editor.settings.templateId,
    colorScheme: editor.branding.colorScheme,
    fontFamily: editor.settings.fontFamily,
    fontSize: editor.settings.fontSize,
    spacing: 'normal',
    sectionOrder: editor.settings.sectionOrder,
  };
  
  return core;
}

export function enhancedToCore(enhanced: EnhancedResumeData): CoreResumeData {
  const core = createEmptyResumeData();
  
  // Personal Info
  core.personalInfo = {
    fullName: enhanced.personalInfo.fullName,
    email: enhanced.personalInfo.email,
    phone: enhanced.personalInfo.phone,
    location: enhanced.personalInfo.location,
    summary: enhanced.professionalSummary?.content || enhanced.personalInfo.summary,
    linkedin: enhanced.personalInfo.linkedin,
    github: enhanced.personalInfo.github,
    website: enhanced.personalInfo.website,
  };
  
  // Experience
  core.experience = enhanced.experience.map(exp => ({
    id: exp.id,
    title: exp.title,
    company: exp.company,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    current: exp.current || exp.isCurrentRole,
    description: exp.description,
    achievements: exp.achievements,
    technologies: exp.technologies,
  }));
  
  // Education
  core.education = enhanced.education.map(edu => ({
    id: edu.id,
    degree: edu.degree,
    institution: edu.school,
    location: edu.location,
    startDate: edu.startDate,
    endDate: edu.endDate,
    gpa: edu.gpa,
    honors: edu.honors,
    relevantCoursework: edu.relevantCoursework,
  }));
  
  // Skills
  core.skills = enhanced.skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    level: skill.level,
    category: (skill.category === 'technical' || skill.category === 'soft' || skill.category === 'language' || skill.category === 'tool') 
      ? skill.category as CoreSkill['category']
      : 'technical',
    years: skill.years,
  }));
  
  // Projects
  core.projects = (enhanced.projects || []).map(proj => ({
    id: proj.id,
    name: proj.title,
    description: proj.description,
    technologies: proj.technologies,
    url: proj.url,
    githubUrl: proj.githubUrl,
    startDate: proj.startDate,
    endDate: proj.endDate,
    role: proj.role,
  }));
  
  // Certifications
  core.certifications = (enhanced.certifications || []).map(cert => ({
    id: cert.id,
    name: cert.name,
    issuer: cert.issuer,
    issueDate: cert.date,
    expiryDate: cert.expirationDate,
    credentialId: cert.credentialId,
    credentialUrl: cert.url,
  }));
  
  // Awards
  core.awards = (enhanced.awards || []).map(award => ({
    id: award.id,
    name: award.name,
    issuer: award.issuer,
    date: award.date,
    description: award.description,
  }));
  
  // Volunteer Work
  core.volunteerWork = (enhanced.volunteerWork || []).map(vol => ({
    id: vol.id,
    role: vol.role,
    organization: vol.organization,
    location: vol.location,
    startDate: vol.startDate,
    endDate: vol.endDate,
    current: vol.current,
    description: vol.description,
  }));
  
  // References
  core.references = (enhanced.references || []).map(ref => ({
    id: ref.id,
    name: ref.name,
    title: ref.title,
    company: ref.company,
    email: ref.email,
    phone: ref.phone,
    relationship: ref.relationship,
  }));
  
  // Interests
  core.interests = [];
  
  // Settings
  core.settings = {
    templateId: enhanced.selectedTemplate,
    colorScheme: enhanced.customization?.colorScheme || 'blue',
    fontFamily: enhanced.customization?.fontFamily || 'Inter',
    fontSize: enhanced.customization?.fontSize || 14,
    spacing: enhanced.customization?.spacing || 'normal',
    sectionOrder: enhanced.sectionOrder,
  };
  
  return core;
}

export function legacyToCore(legacy: Resume): CoreResumeData {
  const core = createEmptyResumeData();
  
  core.metadata.id = legacy.id;
  
  // Personal Info
  core.personalInfo = {
    fullName: legacy.personalInfo.fullName,
    email: legacy.personalInfo.email,
    phone: legacy.personalInfo.phone,
    location: legacy.personalInfo.location,
    summary: legacy.summary,
    linkedin: legacy.personalInfo.linkedin,
    website: legacy.personalInfo.website,
  };
  
  // Experience
  core.experience = legacy.experience.map(exp => ({
    id: exp.id,
    title: exp.title,
    company: exp.company,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    current: exp.current,
    description: exp.description,
    achievements: exp.achievements,
    technologies: [],
  }));
  
  // Education
  core.education = legacy.education.map(edu => ({
    id: edu.id,
    degree: edu.degree,
    institution: edu.school,
    location: edu.location,
    startDate: edu.startDate,
    endDate: edu.endDate,
    gpa: edu.gpa,
  }));
  
  // Skills
  core.skills = legacy.skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    level: skill.level || 'intermediate',
    category: (skill.category === 'technical' || skill.category === 'soft' || skill.category === 'language' || skill.category === 'tool') 
      ? skill.category as CoreSkill['category']
      : 'technical',
    years: 0,
  }));
  
  // Settings
  core.settings.templateId = legacy.selectedTemplate;
  core.metadata.atsScore = legacy.atsScore;
  core.metadata.createdAt = legacy.createdAt;
  core.metadata.updatedAt = legacy.updatedAt;
  
  return core;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function isValidResumeData(data: any): data is CoreResumeData {
  return (
    data &&
    data.personalInfo &&
    typeof data.personalInfo.fullName === 'string' &&
    typeof data.personalInfo.email === 'string' &&
    Array.isArray(data.experience) &&
    Array.isArray(data.education) &&
    Array.isArray(data.skills) &&
    data.settings &&
    data.metadata
  );
}

export function mergeResumeData(base: CoreResumeData, updates: Partial<CoreResumeData>): CoreResumeData {
  return {
    ...base,
    ...updates,
    personalInfo: { ...base.personalInfo, ...updates.personalInfo },
    settings: { ...base.settings, ...updates.settings },
    metadata: { ...base.metadata, ...updates.metadata, updatedAt: new Date().toISOString() },
  };
}