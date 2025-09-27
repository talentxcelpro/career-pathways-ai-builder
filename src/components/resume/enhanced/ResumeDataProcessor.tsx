import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ProcessedResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    linkedin?: string;
    website?: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  awards: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    description: string;
  }>;
}

export const useResumeDataProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processRawResumeData = useCallback((rawData: any): ProcessedResumeData => {
    console.log('Processing raw resume data:', rawData);

    try {
      const processed: ProcessedResumeData = {
        personalInfo: {
          fullName: rawData?.personalInfo?.fullName || '',
          email: rawData?.personalInfo?.email || '',
          phone: rawData?.personalInfo?.phone || '',
          location: rawData?.personalInfo?.location || '',
          summary: rawData?.personalInfo?.summary || '',
          linkedin: rawData?.personalInfo?.linkedin || '',
          website: rawData?.personalInfo?.website || '',
        },
        experience: processExperience(rawData?.experience || []),
        education: processEducation(rawData?.education || []),
        skills: processSkills(rawData?.skills || []),
        projects: processProjects(rawData?.projects || []),
        certifications: processCertifications(rawData?.certifications || []),
        awards: processAwards(rawData?.awards || []),
      };

      console.log('Processed resume data:', processed);
      return processed;
    } catch (error) {
      console.error('Error processing resume data:', error);
      toast.error('Error processing resume data');
      return getEmptyResumeData();
    }
  }, []);

  const processExperience = (experience: any[]): ProcessedResumeData['experience'] => {
    return experience.map((exp, index) => ({
      id: exp.id || `exp-${index}-${Date.now()}`,
      title: exp.title || exp.position || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: exp.description || '',
      achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
    }));
  };

  const processEducation = (education: any[]): ProcessedResumeData['education'] => {
    return education.map((edu, index) => ({
      id: edu.id || `edu-${index}-${Date.now()}`,
      degree: edu.degree || '',
      school: edu.school || edu.institution || '',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa || '',
      honors: edu.honors || '',
    }));
  };

  const processSkills = (skills: any): string[] => {
    // Handle different skill formats
    if (Array.isArray(skills)) {
      return skills
        .map(skill => typeof skill === 'string' ? skill : skill?.skill || skill?.name || '')
        .filter(Boolean);
    }

    if (skills && typeof skills === 'object') {
      const allSkills: string[] = [];
      
      // Technical skills
      if (skills.technical) {
        if (Array.isArray(skills.technical)) {
          allSkills.push(...skills.technical.map(skill => 
            typeof skill === 'string' ? skill : skill?.skill || skill?.name || ''
          ).filter(Boolean));
        } else {
          // Handle nested technical skills
          Object.values(skills.technical).forEach((category: any) => {
            if (Array.isArray(category)) {
              allSkills.push(...category.map(skill => 
                typeof skill === 'string' ? skill : skill?.skill || skill?.name || ''
              ).filter(Boolean));
            }
          });
        }
      }

      // Soft skills
      if (Array.isArray(skills.soft)) {
        allSkills.push(...skills.soft.map(skill => 
          typeof skill === 'string' ? skill : skill?.skill || skill?.name || ''
        ).filter(Boolean));
      }

      // Languages
      if (Array.isArray(skills.languages)) {
        allSkills.push(...skills.languages.map(lang => 
          typeof lang === 'string' ? lang : lang?.language || lang?.skill || lang?.name || ''
        ).filter(Boolean));
      }

      // Certifications
      if (Array.isArray(skills.certifications)) {
        allSkills.push(...skills.certifications.map(cert => 
          typeof cert === 'string' ? cert : cert?.skill || cert?.name || ''
        ).filter(Boolean));
      }

      return [...new Set(allSkills)]; // Remove duplicates
    }

    return [];
  };

  const processProjects = (projects: any[]): ProcessedResumeData['projects'] => {
    return projects.map((project, index) => ({
      id: project.id || `proj-${index}-${Date.now()}`,
      title: project.title || project.name || '',
      description: project.description || '',
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      url: project.url || project.link || '',
    }));
  };

  const processCertifications = (certifications: any[]): ProcessedResumeData['certifications'] => {
    return certifications.map((cert, index) => ({
      id: cert.id || `cert-${index}-${Date.now()}`,
      name: cert.name || cert.title || '',
      issuer: cert.issuer || cert.organization || '',
      date: cert.date || cert.dateIssued || '',
      url: cert.url || cert.link || '',
    }));
  };

  const processAwards = (awards: any[]): ProcessedResumeData['awards'] => {
    return awards.map((award, index) => ({
      id: award.id || `award-${index}-${Date.now()}`,
      name: award.name || award.title || '',
      issuer: award.issuer || award.organization || '',
      date: award.date || '',
      description: award.description || '',
    }));
  };

  const getEmptyResumeData = (): ProcessedResumeData => ({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: [],
  });

  const validateResumeData = useCallback((data: ProcessedResumeData): boolean => {
    // Basic validation
    const hasPersonalInfo = data.personalInfo.fullName || data.personalInfo.email;
    const hasContent = data.experience.length > 0 || data.education.length > 0 || data.skills.length > 0;
    
    return hasPersonalInfo && hasContent;
  }, []);

  return {
    processRawResumeData,
    validateResumeData,
    getEmptyResumeData,
    isProcessing,
    setIsProcessing,
  };
};