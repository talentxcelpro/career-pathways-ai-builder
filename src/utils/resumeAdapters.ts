import { EditorResume, createEmptyEditorResume } from '@/types/editor-resume';
import { EnhancedResumeData, Skill, Language, Project, Certification, Award, Reference, VolunteerWork, Education as EnhancedEducation, Experience as EnhancedExperience } from '@/types/enhanced-resume';

// Convert EditorResume (canonical storage) -> EnhancedResumeData (current UI)
export function editorToEnhanced(editor: EditorResume): EnhancedResumeData {
  const enhanced: EnhancedResumeData = {
    personalInfo: {
      fullName: editor.personalInfo.fullName || '',
      email: editor.personalInfo.email || '',
      phone: editor.personalInfo.phone || '',
      location: editor.personalInfo.location || '',
      summary: editor.personalInfo.summary || '',
      linkedin: editor.personalInfo.linkedin || '',
      website: editor.personalInfo.website || '',
      github: editor.personalInfo.github || '',
    },
    professionalSummary: {
      content: editor.personalInfo.summary || '',
      keyHighlights: [],
    },
    experience: (editor.experience || []).map<EnhancedExperience>((e) => ({
      id: e.id,
      title: e.title,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      current: !e.endDate || /present|current/i.test(e.endDate),
      isCurrentRole: !e.endDate || /present|current/i.test(e.endDate),
      description: e.description,
      achievements: e.achievements || [],
      skills: [],
      technologies: e.technologies || [],
    })),
    education: (editor.education || []).map<EnhancedEducation>((ed) => ({
      id: ed.id,
      degree: ed.degree,
      school: ed.institution,
      location: ed.location,
      startDate: ed.startDate,
      endDate: ed.endDate,
      honors: (ed.achievements || []).join('; '),
      relevantCoursework: [],
    })),
    // Flatten skills object into Skill[] for existing UI
    skills: [
      ...(editor.skills?.technical || []).map<Skill>((name, i) => ({ id: `tech-${i}`, name, level: 'intermediate', category: 'technical' })),
      ...(editor.skills?.soft || []).map<Skill>((name, i) => ({ id: `soft-${i}`, name, level: 'intermediate', category: 'soft' })),
      ...(editor.skills?.tools || []).map<Skill>((name, i) => ({ id: `tool-${i}`, name, level: 'intermediate', category: 'tools' })),
    ],
    projects: (editor.projects || []).map<Project>((p) => ({
      id: p.id,
      title: p.name,
      description: p.description,
      technologies: p.technologies || [],
      url: p.link || '',
    })),
    certifications: (editor.certifications || []).map<Certification>((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      date: c.issueDate,
      expirationDate: c.expiryDate || undefined,
      credentialId: c.credentialId || undefined,
      url: c.credentialUrl || undefined,
    })),
    awards: (editor.awards || []).map<Award>((a) => ({
      id: a.id,
      name: a.name,
      issuer: a.issuer,
      date: a.date,
      description: a.description || '',
    })),
    // Also populate Languages section from skills.languages if provided
    languages: (editor.skills?.languages || []).map<Language>((name, i) => ({
      id: `lang-${i}`,
      name,
      proficiency: 'conversational',
      certifications: [],
    })),
    publications: [],
    references: (editor.references || []).map<Reference>((r) => ({
      id: r.id,
      name: r.name,
      title: '',
      company: '',
      email: r.email,
      phone: r.phone,
      relationship: r.relationship,
      available: true,
    })),
    volunteerWork: (editor.volunteerExperience || []).map<VolunteerWork>((v) => ({
      id: v.id,
      role: v.role,
      organization: v.organization,
      location: v.location,
      startDate: v.startDate,
      endDate: v.endDate,
      current: !v.endDate,
      description: v.description,
      impact: '',
      skills: [],
    })),
    trainings: [],
    tools: {
      development: editor.skills?.tools || [],
      design: [],
      analytics: [],
      productivity: [],
      other: [],
    },
    careerObjectives: { statement: '', goals: [] },
    sectionOrder: editor.settings?.sectionOrder?.length ? editor.settings.sectionOrder as any : ['personalInfo', 'professionalSummary', 'experience', 'education', 'skills'],
    selectedTemplate: editor.settings?.templateId || 'modern',
    customization: {
      colorScheme: editor.branding?.colorScheme || 'blue',
      fontFamily: editor.settings?.fontFamily || 'Inter',
      fontSize: editor.settings?.fontSize || 14,
      spacing: 'normal',
    },
  } as EnhancedResumeData;

  return enhanced;
}

// Convert EnhancedResumeData (current UI) -> EditorResume (canonical storage)
export function enhancedToEditor(enhanced: EnhancedResumeData): EditorResume {
  const editor: EditorResume = createEmptyEditorResume();

  editor.personalInfo = {
    fullName: enhanced.personalInfo?.fullName || '',
    professionalTitle: '',
    email: enhanced.personalInfo?.email || '',
    phone: enhanced.personalInfo?.phone || '',
    location: enhanced.personalInfo?.location || '',
    linkedin: enhanced.personalInfo?.linkedin || '',
    github: enhanced.personalInfo?.github || '',
    website: enhanced.personalInfo?.website || '',
    summary: enhanced.professionalSummary?.content || enhanced.personalInfo?.summary || '',
  };

  editor.experience = (enhanced.experience || []).map((e) => ({
    id: e.id,
    title: e.title,
    company: e.company,
    location: e.location,
    startDate: e.startDate,
    endDate: e.endDate,
    description: e.description,
    achievements: e.achievements || [],
    technologies: e.technologies || [],
  }));

  editor.education = (enhanced.education || []).map((ed) => ({
    id: ed.id,
    degree: ed.degree,
    institution: ed.school,
    location: ed.location,
    startDate: ed.startDate,
    endDate: ed.endDate,
    description: ed.honors || '',
    achievements: ed.relevantCoursework || [],
  }));

  // Group skills back into buckets
  const technical: string[] = [];
  const soft: string[] = [];
  const tools: string[] = [];

  (enhanced.skills || []).forEach((s) => {
    const name = s.name;
    if (!name) return;
    const cat = (s.category || '').toLowerCase();
    if (cat.includes('soft')) soft.push(name);
    else if (cat.includes('tool')) tools.push(name);
    else technical.push(name);
  });

  // Add language names
  const languageNames = (enhanced.languages || []).map((l) => l.name).filter(Boolean);

  editor.skills = {
    technical,
    soft,
    languages: languageNames,
    tools,
  };

  editor.projects = (enhanced.projects || []).map((p) => ({
    id: p.id,
    name: p.title,
    description: p.description,
    technologies: p.technologies || [],
    link: p.url || p.githubUrl || '',
  }));

  editor.certifications = (enhanced.certifications || []).map((c) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    issueDate: c.date,
    expiryDate: c.expirationDate || '',
    credentialId: c.credentialId || '',
    credentialUrl: c.url || '',
  }));

  editor.awards = (enhanced.awards || []).map((a) => ({
    id: a.id,
    name: a.name,
    issuer: a.issuer,
    date: a.date,
    description: a.description || '',
  }));

  editor.volunteerExperience = (enhanced.volunteerWork || []).map((v) => ({
    id: v.id,
    role: v.role,
    organization: v.organization,
    location: v.location,
    startDate: v.startDate,
    endDate: v.endDate,
    description: v.description,
  }));

  editor.references = (enhanced.references || []).map((r) => ({
    id: r.id,
    name: r.name,
    relationship: r.relationship,
    email: r.email,
    phone: r.phone,
  }));

  editor.interests = [];

  editor.branding = {
    logoUrl: '',
    tagline: '',
    colorScheme: enhanced.customization?.colorScheme || 'blue',
  };

  editor.settings = {
    templateId: enhanced.selectedTemplate || 'default-template',
    fontFamily: enhanced.customization?.fontFamily || 'Arial',
    fontSize: (enhanced.customization?.fontSize as any) || 12,
    lineHeight: 1.5,
    sectionOrder: (enhanced.sectionOrder as any) || [
      'personalInfo',
      'summary',
      'experience',
      'education',
      'skills',
    ],
  };

  // Note: history is maintained by UI when needed
  editor.history = [];

  return editor;
}
