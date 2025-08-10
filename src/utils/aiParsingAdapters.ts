// Convert AI parsing results to EditorResume format
import { EditorResume, createEmptyEditorResume } from '@/types/editor-resume';

export function aiDataToEditor(aiData: any): EditorResume {
  const editor = createEmptyEditorResume();
  
  // Map personal info
  if (aiData.personal) {
    editor.personalInfo.fullName = aiData.personal.fullName || aiData.personal.name || '';
    editor.personalInfo.email = aiData.personal.email || '';
    editor.personalInfo.phone = aiData.personal.phone || '';
    editor.personalInfo.location = aiData.personal.location || '';
    editor.personalInfo.linkedin = aiData.personal.linkedin || '';
    editor.personalInfo.github = aiData.personal.github || '';
    editor.personalInfo.website = aiData.personal.website || aiData.personal.portfolio || '';
    editor.personalInfo.professionalTitle = aiData.personal.title || aiData.personal.professionalTitle || '';
  }

  // Map summary
  editor.personalInfo.summary = aiData.summary || aiData.profile?.summary || '';

  // Map experience
  const toArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);
  editor.experience = toArray(aiData.experience).map((e: any, i: number) => ({
    id: e.id || `exp-${i + 1}`,
    title: e.title || e.role || '',
    company: e.company || e.companyName || '',
    location: e.location || '',
    startDate: e.startDate || e.start || '',
    endDate: e.endDate || e.end || '',
    description: e.description || '',
    achievements: e.bullets || e.achievements || [],
    technologies: e.technologies || e.tech || [],
  }));

  // Map education
  editor.education = toArray(aiData.education).map((ed: any, i: number) => ({
    id: ed.id || `edu-${i + 1}`,
    degree: ed.degree || ed.title || '',
    institution: ed.institution || ed.school || ed.institutionName || '',
    location: ed.location || '',
    startDate: ed.startDate || ed.start || '',
    endDate: ed.endDate || ed.end || '',
    description: ed.description || '',
    achievements: ed.achievements || ed.honors ? [ed.honors] : [],
  }));

  // Map skills - categorize them intelligently
  const skills = toArray(aiData.skills);
  const technical: string[] = [];
  const soft: string[] = [];
  const languages: string[] = [];
  const tools: string[] = [];

  skills.forEach((s: any) => {
    const name = typeof s === 'string' ? s : (s.name || s.skill || '');
    if (!name) return;
    
    const category = (typeof s === 'object' && s.category ? s.category : 'technical').toLowerCase();
    const lowerName = name.toLowerCase();
    
    if (category.includes('soft') || lowerName.includes('communication') || lowerName.includes('leadership') || lowerName.includes('teamwork')) {
      soft.push(name);
    } else if (category.includes('language') || lowerName.includes('english') || lowerName.includes('spanish') || lowerName.includes('french')) {
      languages.push(name);
    } else if (category.includes('tool') || lowerName.includes('office') || lowerName.includes('excel') || lowerName.includes('powerpoint')) {
      tools.push(name);
    } else {
      technical.push(name);
    }
  });

  editor.skills = { technical, soft, languages, tools };

  // Map projects if available
  if (aiData.projects) {
    editor.projects = toArray(aiData.projects).map((p: any, i: number) => ({
      id: p.id || `proj-${i + 1}`,
      name: p.name || p.title || '',
      description: p.description || '',
      technologies: p.technologies || p.tech || [],
      link: p.link || p.url || p.github || '',
    }));
  }

  // Map certifications if available
  if (aiData.certifications) {
    editor.certifications = toArray(aiData.certifications).map((c: any, i: number) => ({
      id: c.id || `cert-${i + 1}`,
      name: c.name || c.title || '',
      issuer: c.issuer || c.organization || '',
      issueDate: c.issueDate || c.date || c.issued || '',
      expiryDate: c.expiryDate || c.expires || '',
      credentialId: c.credentialId || c.id || '',
      credentialUrl: c.credentialUrl || c.url || '',
    }));
  }

  // Map awards if available
  if (aiData.awards) {
    editor.awards = toArray(aiData.awards).map((a: any, i: number) => ({
      id: a.id || `award-${i + 1}`,
      name: a.name || a.title || '',
      issuer: a.issuer || a.organization || '',
      date: a.date || a.year || '',
      description: a.description || '',
    }));
  }

  // Map volunteer experience if available
  if (aiData.volunteer) {
    editor.volunteerExperience = toArray(aiData.volunteer).map((v: any, i: number) => ({
      id: v.id || `vol-${i + 1}`,
      role: v.role || v.title || '',
      organization: v.organization || v.company || '',
      location: v.location || '',
      startDate: v.startDate || v.start || '',
      endDate: v.endDate || v.end || '',
      description: v.description || '',
    }));
  }

  // Map interests if available
  if (aiData.interests) {
    editor.interests = Array.isArray(aiData.interests) ? aiData.interests : [aiData.interests];
  }

  // Map references if available
  if (aiData.references) {
    editor.references = toArray(aiData.references).map((r: any, i: number) => ({
      id: r.id || `ref-${i + 1}`,
      name: r.name || '',
      relationship: r.relationship || r.title || '',
      email: r.email || '',
      phone: r.phone || '',
    }));
  }

  return editor;
}