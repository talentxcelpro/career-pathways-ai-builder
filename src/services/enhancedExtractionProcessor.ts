import { supabase } from '@/integrations/supabase/client';
import { EnhancedExtractedContent } from './resume-enhancer/interfaces/EnhancedExtractedContent';

export interface ProcessedResumeData {
  extracted: EnhancedExtractedContent;
  enhanced: {
    templateRecommendation: {
      recommended: string;
      reasoning: string;
      alternativeOptions: string[];
    };
    professionalSummary: {
      enhanced: string;
      keywordDensity: number;
      improvements: string[];
      missingElements: string[];
    };
    experience: Array<{
      originalIndex: number;
      enhancedTitle: string;
      enhancedDescription: string;
      enhancedAchievements: string[];
      suggestedKeywords: string[];
      actionVerbs: string[];
      quantificationOpportunities: string[];
      improvements: string[];
    }>;
    skills: {
      recommendedTechnical: string[];
      recommendedSoft: string[];
      industryKeywords: string[];
      emergingSkills: string[];
      certificationSuggestions: string[];
    };
    missingSections: Array<{
      section: string;
      importance: string;
      reason: string;
      suggestions: string[];
    }>;
    atsOptimization: {
      overallScore: number;
      breakdown: {
        keywordOptimization: number;
        formatCompatibility: number;
        contentQuality: number;
        achievementQuantification: number;
        professionalLanguage: number;
      };
      criticalIssues: Array<{
        section: string;
        issue: string;
        solution: string;
        priority: string;
        impact: string;
      }>;
      quickWins: Array<{
        change: string;
        expectedImprovement: string;
        effort: string;
      }>;
    };
    competitiveAnalysis: {
      strengths: string[];
      weaknesses: string[];
      marketPosition: string;
      recommendedFocus: string[];
    };
  };
  processing: {
    version: string;
    timestamp: string;
    confidence: number;
    processingTime: string;
    enhancementLevel: string;
    templateMatched: string;
    industryOptimized: string;
  };
}

export class EnhancedExtractionProcessor {
  /**
   * Process resume text with comprehensive AI extraction and enhancement
   */
  static async processResumeText(
    resumeText: string, 
    onProgress?: (progress: number, status: string) => void
  ): Promise<ProcessedResumeData> {
    try {
      onProgress?.(10, 'Starting AI extraction...');
      
      console.log('Processing resume with enhanced extraction pipeline');
      
      // Call the enhanced AI resume processor
      const { data, error } = await supabase.functions.invoke('ai-resume-reprocessor', {
        body: {
          resumeText,
          operation: 'extract_and_enhance'
        }
      });
      
      if (error) {
        console.error('AI processing error:', error);
        throw new Error(`AI processing failed: ${error.message}`);
      }
      
      onProgress?.(70, 'AI extraction completed, processing data...');
      
      // Validate and normalize the response
      const processedData = this.validateAndNormalizeData(data);
      
      onProgress?.(90, 'Finalizing data structure...');
      
      // Add any missing IDs and ensure data completeness
      const finalData = this.ensureDataCompleteness(processedData);
      
      onProgress?.(100, 'Processing complete!');
      
      console.log('Enhanced extraction completed successfully');
      return finalData;
      
    } catch (error) {
      console.error('Enhanced extraction failed:', error);
      onProgress?.(0, 'Processing failed');
      throw new Error(`Resume processing failed: ${error.message}`);
    }
  }
  
  /**
   * Validate and normalize the AI response data
   */
  private static validateAndNormalizeData(data: any): ProcessedResumeData {
    // Ensure all required sections exist with proper defaults
    const normalized: ProcessedResumeData = {
      extracted: {
        personalInfo: data.extracted?.personalInfo || {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          portfolio: '',
          website: '',
          dateOfBirth: '',
          nationality: ''
        },
        professionalSummary: data.extracted?.professionalSummary || {
          content: '',
          careerBackground: '',
          keySkills: [],
          targetRoles: [],
          goals: ''
        },
        experience: this.normalizeExperience(data.extracted?.experience || []),
        education: this.normalizeEducation(data.extracted?.education || []),
        skills: this.normalizeSkills(data.extracted?.skills || {}),
        certifications: this.normalizeCertifications(data.extracted?.certifications || []),
        projects: this.normalizeProjects(data.extracted?.projects || []),
        languages: this.normalizeLanguages(data.extracted?.languages || []),
        awards: this.normalizeAwards(data.extracted?.awards || []),
        hobbies: data.extracted?.hobbies || [],
        additional: data.extracted?.additional || {
          declaration: '',
          references: [],
          availableUponRequest: false
        },
        metadata: {
          extractionMethod: 'ai-parser',
          processingDate: new Date().toISOString(),
          atsScore: data.enhanced?.atsOptimization?.overallScore || 0,
          completionPercentage: this.calculateCompletionPercentage(data.extracted),
          enhancementSuggestions: data.enhanced?.missingSections?.map((s: any) => s.reason) || [],
          ...data.extracted?.metadata
        }
      },
      enhanced: data.enhanced || {},
      processing: data.processing || {
        version: '4.0-enhanced',
        timestamp: new Date().toISOString(),
        confidence: 0.8,
        processingTime: '0ms',
        enhancementLevel: 'comprehensive',
        templateMatched: 'chronological',
        industryOptimized: 'general'
      }
    };
    
    return normalized;
  }
  
  /**
   * Normalize experience data
   */
  private static normalizeExperience(experience: any[]): EnhancedExtractedContent['experience'] {
    return experience.map((exp, index) => ({
      id: exp.id || `exp_${index}`,
      jobTitle: exp.jobTitle || exp.title || '',
      companyName: exp.companyName || exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : 
                      exp.description ? [exp.description] : [],
      achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
      skillsUsed: Array.isArray(exp.skillsUsed) ? exp.skillsUsed : 
                  Array.isArray(exp.technologies) ? exp.technologies : [],
      tools: Array.isArray(exp.tools) ? exp.tools : []
    }));
  }
  
  /**
   * Normalize education data
   */
  private static normalizeEducation(education: any[]): EnhancedExtractedContent['education'] {
    return education.map((edu, index) => ({
      id: edu.id || `edu_${index}`,
      degree: edu.degree || '',
      institutionName: edu.institutionName || edu.school || '',
      location: edu.location || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      grade: edu.grade || edu.gpa || '',
      percentage: edu.percentage || '',
      cgpa: edu.cgpa || '',
      honors: edu.honors || '',
      coursework: Array.isArray(edu.coursework) ? edu.coursework : 
                  Array.isArray(edu.relevantCoursework) ? edu.relevantCoursework : []
    }));
  }
  
  /**
   * Normalize skills data
   */
  private static normalizeSkills(skills: any): EnhancedExtractedContent['skills'] {
    return {
      technical: Array.isArray(skills.technical) ? 
        skills.technical.map((skill: any, index: number) => 
          typeof skill === 'string' 
            ? { skill, proficiency: 'intermediate' as const, category: 'general' }
            : { 
                skill: skill.skill || skill.name || '',
                proficiency: skill.proficiency || 'intermediate' as const,
                category: skill.category || 'general'
              }
        ) : [],
      soft: Array.isArray(skills.soft) ? 
        skills.soft.map((skill: any) => 
          typeof skill === 'string'
            ? { skill, proficiency: 'intermediate' as const }
            : {
                skill: skill.skill || skill.name || '',
                proficiency: skill.proficiency || 'intermediate' as const
              }
        ) : [],
      languages: Array.isArray(skills.languages) ? 
        skills.languages.map((lang: any) => 
          typeof lang === 'string'
            ? { language: lang, proficiency: 'conversational' as const }
            : {
                language: lang.language || lang.name || '',
                proficiency: lang.proficiency || 'conversational' as const
              }
        ) : []
    };
  }
  
  /**
   * Normalize certifications data
   */
  private static normalizeCertifications(certifications: any[]): EnhancedExtractedContent['certifications'] {
    return certifications.map((cert, index) => ({
      id: cert.id || `cert_${index}`,
      name: cert.name || '',
      issuingOrganization: cert.issuingOrganization || cert.issuer || '',
      issueDate: cert.issueDate || cert.date || '',
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || cert.url || ''
    }));
  }
  
  /**
   * Normalize projects data
   */
  private static normalizeProjects(projects: any[]): EnhancedExtractedContent['projects'] {
    return projects.map((project, index) => ({
      id: project.id || `proj_${index}`,
      title: project.title || '',
      description: project.description || '',
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      githubUrl: project.githubUrl || project.url || '',
      liveUrl: project.liveUrl || '',
      role: project.role || '',
      achievements: Array.isArray(project.achievements) ? project.achievements : []
    }));
  }
  
  /**
   * Normalize languages data
   */
  private static normalizeLanguages(languages: any[]): EnhancedExtractedContent['languages'] {
    return languages.map((lang: any) => ({
      language: lang.language || lang.name || '',
      proficiency: lang.proficiency || 'conversational' as const,
      certifications: Array.isArray(lang.certifications) ? lang.certifications : []
    }));
  }
  
  /**
   * Normalize awards data
   */
  private static normalizeAwards(awards: any[]): EnhancedExtractedContent['awards'] {
    return awards.map((award, index) => ({
      id: award.id || `award_${index}`,
      name: award.name || '',
      issuer: award.issuer || '',
      date: award.date || '',
      description: award.description || '',
      context: award.context || ''
    }));
  }
  
  /**
   * Calculate completion percentage
   */
  private static calculateCompletionPercentage(extracted: any): number {
    let score = 0;
    const maxScore = 100;
    
    // Personal info (20 points)
    if (extracted.personalInfo?.fullName) score += 5;
    if (extracted.personalInfo?.email) score += 5;
    if (extracted.personalInfo?.phone) score += 5;
    if (extracted.personalInfo?.location) score += 5;
    
    // Professional summary (15 points)
    if (extracted.professionalSummary?.content) score += 15;
    
    // Experience (30 points)
    const expCount = extracted.experience?.length || 0;
    score += Math.min(expCount * 10, 30);
    
    // Education (15 points)
    if (extracted.education?.length > 0) score += 15;
    
    // Skills (10 points)
    const skillCount = (extracted.skills?.technical?.length || 0) + (extracted.skills?.soft?.length || 0);
    score += Math.min(skillCount * 2, 10);
    
    // Additional sections (10 points)
    if (extracted.certifications?.length > 0) score += 3;
    if (extracted.projects?.length > 0) score += 3;
    if (extracted.awards?.length > 0) score += 2;
    if (extracted.languages?.length > 0) score += 2;
    
    return Math.min(score, maxScore);
  }
  
  /**
   * Ensure data completeness with proper IDs and structure
   */
  private static ensureDataCompleteness(data: ProcessedResumeData): ProcessedResumeData {
    // Add unique IDs where missing
    data.extracted.experience.forEach((exp, index) => {
      if (!exp.id) exp.id = `exp_${Date.now()}_${index}`;
    });
    
    data.extracted.education.forEach((edu, index) => {
      if (!edu.id) edu.id = `edu_${Date.now()}_${index}`;
    });
    
    data.extracted.certifications.forEach((cert, index) => {
      if (!cert.id) cert.id = `cert_${Date.now()}_${index}`;
    });
    
    data.extracted.projects.forEach((proj, index) => {
      if (!proj.id) proj.id = `proj_${Date.now()}_${index}`;
    });
    
    data.extracted.awards.forEach((award, index) => {
      if (!award.id) award.id = `award_${Date.now()}_${index}`;
    });
    
    return data;
  }
}