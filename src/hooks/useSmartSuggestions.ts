import { useState, useCallback } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SmartSuggestion {
  id: string;
  type: 'content' | 'formatting' | 'keyword' | 'achievement';
  section: string;
  title: string;
  description: string;
  content: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface SuggestionRequest {
  section: string;
  currentContent: any;
  targetRole?: string;
  industry?: string;
  experienceLevel?: string;
  jobDescription?: string;
}

export const useSmartSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate STAR format suggestions for experience section
  const generateSTARSuggestions = useCallback((experiences: any[]): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];

    experiences.forEach((exp, index) => {
      const description = exp.description || '';
      
      // Check if using STAR format
      const hasSTAR = /situation|task|action|result/i.test(description);
      const hasQuantifiableResults = /\d+%|\$\d+|\d+\s*(users|customers|projects|teams)/i.test(description);
      
      if (!hasSTAR) {
        suggestions.push({
          id: `star-${index}`,
          type: 'content',
          section: 'experience',
          title: 'Convert to STAR Format',
          description: `Transform ${exp.title} description using STAR (Situation, Task, Action, Result) format`,
          content: generateSTARExample(exp),
          confidence: 85,
          impact: 'high',
          reasoning: 'STAR format makes achievements more compelling and ATS-friendly'
        });
      }

      if (!hasQuantifiableResults) {
        suggestions.push({
          id: `quantify-${index}`,
          type: 'achievement',
          section: 'experience',
          title: 'Add Quantifiable Results',
          description: `Include specific metrics and numbers for ${exp.title}`,
          content: generateQuantifiableExample(exp),
          confidence: 90,
          impact: 'high',
          reasoning: 'Quantified achievements demonstrate concrete impact and value'
        });
      }
    });

    return suggestions;
  }, []);

  // Generate professional summary suggestions
  const generateSummarySuggestions = useCallback((
    summary: string, 
    targetRole?: string, 
    experience?: any[]
  ): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    const wordCount = summary.split(' ').length;

    if (wordCount < 50) {
      suggestions.push({
        id: 'summary-length',
        type: 'content',
        section: 'summary',
        title: 'Expand Professional Summary',
        description: 'Your summary is too brief. Aim for 50-100 words.',
        content: generateExpandedSummary(summary, targetRole, experience),
        confidence: 95,
        impact: 'high',
        reasoning: 'A comprehensive summary improves first impression and keyword match'
      });
    }

    if (!/\d+/.test(summary)) {
      suggestions.push({
        id: 'summary-metrics',
        type: 'achievement',
        section: 'summary',
        title: 'Add Quantifiable Achievements',
        description: 'Include specific numbers and metrics in your summary',
        content: addMetricsToSummary(summary, experience),
        confidence: 85,
        impact: 'medium',
        reasoning: 'Numbers in summary immediately demonstrate your impact'
      });
    }

    return suggestions;
  }, []);

  // Generate skills suggestions based on role and industry
  const generateSkillsSuggestions = useCallback((
    currentSkills: any[], 
    targetRole?: string,
    industry?: string,
    jobDescription?: string
  ): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    
    // Get role-specific skill recommendations
    const recommendedSkills = getRoleSpecificSkills(targetRole, industry);
    const currentSkillNames = currentSkills.map(skill => 
      (skill.name || skill).toLowerCase()
    );

    const missingSkills = recommendedSkills.filter(skill => 
      !currentSkillNames.some(current => current.includes(skill.toLowerCase()))
    );

    if (missingSkills.length > 0) {
      suggestions.push({
        id: 'skills-missing',
        type: 'keyword',
        section: 'skills',
        title: 'Add Industry-Relevant Skills',
        description: `Consider adding these ${targetRole || 'role'}-specific skills`,
        content: missingSkills.slice(0, 5).join(', '),
        confidence: 80,
        impact: 'medium',
        reasoning: 'Industry-specific skills improve ATS matching and recruiter appeal'
      });
    }

    // Analyze job description for missing skills
    if (jobDescription) {
      const jobSkills = extractSkillsFromJobDescription(jobDescription);
      const missingJobSkills = jobSkills.filter(skill => 
        !currentSkillNames.some(current => current.includes(skill.toLowerCase()))
      );

      if (missingJobSkills.length > 0) {
        suggestions.push({
          id: 'skills-job-match',
          type: 'keyword',
          section: 'skills',
          title: 'Match Job Requirements',
          description: 'Add skills mentioned in the job description',
          content: missingJobSkills.slice(0, 5).join(', '),
          confidence: 95,
          impact: 'high',
          reasoning: 'Including job-specific skills significantly improves ATS matching'
        });
      }
    }

    return suggestions;
  }, []);

  // Generate AI-powered suggestions for any section
  const generateAISuggestions = useCallback(async (request: SuggestionRequest): Promise<SmartSuggestion[]> => {
    try {
      setIsGenerating(true);

      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          toolSlug: 'smart-suggestions',
          inputData: {
            section: request.section,
            currentContent: request.currentContent,
            targetRole: request.targetRole,
            industry: request.industry,
            experienceLevel: request.experienceLevel,
            jobDescription: request.jobDescription
          },
          requestMetadata: {
            category: 'resume',
            operation: 'smart_suggestions'
          }
        }
      });

      if (error) {
        console.error('AI suggestions error:', error);
        throw new Error(`AI suggestions failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'AI suggestions unsuccessful');
      }

      return data.suggestions || [];
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      toast.error('Failed to generate smart suggestions');
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Get comprehensive suggestions for entire resume
  const getComprehensiveSuggestions = useCallback(async (
    resumeData: EnhancedResumeData,
    options?: {
      targetRole?: string;
      industry?: string;
      jobDescription?: string;
    }
  ) => {
    const allSuggestions: SmartSuggestion[] = [];

    // Generate rule-based suggestions
    const starSuggestions = generateSTARSuggestions(resumeData.experience);
    const summarySuggestions = generateSummarySuggestions(
      resumeData.professionalSummary?.content || '',
      options?.targetRole,
      resumeData.experience
    );
    const skillsSuggestions = generateSkillsSuggestions(
      resumeData.skills,
      options?.targetRole,
      options?.industry,
      options?.jobDescription
    );

    allSuggestions.push(...starSuggestions, ...summarySuggestions, ...skillsSuggestions);

    // Generate AI-powered suggestions for each section
    try {
      const sections = ['summary', 'experience', 'skills'];
      
      for (const section of sections) {
        const aiSuggestions = await generateAISuggestions({
          section,
          currentContent: getSectionContent(resumeData, section),
          targetRole: options?.targetRole,
          industry: options?.industry,
          jobDescription: options?.jobDescription
        });
        
        allSuggestions.push(...aiSuggestions);
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }

    // Sort by impact and confidence
    allSuggestions.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      if (impactOrder[a.impact] !== impactOrder[b.impact]) {
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
      return b.confidence - a.confidence;
    });

    setSuggestions(allSuggestions);
    return allSuggestions;
  }, [generateSTARSuggestions, generateSummarySuggestions, generateSkillsSuggestions, generateAISuggestions]);

  // Apply suggestion to resume data
  const applySuggestion = useCallback((
    suggestion: SmartSuggestion,
    resumeData: EnhancedResumeData
  ): EnhancedResumeData => {
    const updatedData = { ...resumeData };

    switch (suggestion.section) {
      case 'summary':
        if (updatedData.professionalSummary) {
          updatedData.professionalSummary.content = suggestion.content;
        }
        break;
      
      case 'experience':
        // Apply to specific experience item or all
        // Implementation depends on suggestion structure
        break;
      
      case 'skills':
        // Add suggested skills
        const newSkills = suggestion.content.split(', ').map((skill, index) => ({
          id: `suggested-${index}`,
          name: skill,
          level: 'intermediate' as const,
          category: 'technical'
        }));
        updatedData.skills = [...updatedData.skills, ...newSkills];
        break;
    }

    return updatedData;
  }, []);

  return {
    suggestions,
    isGenerating,
    generateAISuggestions,
    getComprehensiveSuggestions,
    applySuggestion
  };
};

// Helper functions
function generateSTARExample(experience: any): string {
  return `**Situation:** Brief context about the challenge or opportunity
**Task:** Your specific responsibility or goal
**Action:** Concrete steps you took to address the situation
**Result:** Quantifiable outcome and impact (${experience.title} at ${experience.company})`;
}

function generateQuantifiableExample(experience: any): string {
  return `Consider adding specific metrics such as:
• Increased efficiency by X%
• Managed team of X people
• Generated $X in revenue
• Improved process time by X hours
• Achieved X% customer satisfaction`;
}

function generateExpandedSummary(current: string, role?: string, experience?: any[]): string {
  const years = experience?.length ? experience.length * 2 : 5;
  return `${role || 'Professional'} with ${years}+ years of experience delivering exceptional results. ${current} Proven track record of [specific achievement] and expertise in [key skills]. Passionate about [industry/field] and committed to driving innovation and growth.`;
}

function addMetricsToSummary(summary: string, experience?: any[]): string {
  return summary + ' Achieved measurable results including [X% improvement], [$ amount saved/generated], and [specific milestone]. Led teams of [X people] and managed projects worth [$X].';
}

function getRoleSpecificSkills(role?: string, industry?: string): string[] {
  const skillsMap: Record<string, string[]> = {
    'software-engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'AWS', 'Docker'],
    'product-manager': ['Product Strategy', 'Agile', 'Scrum', 'Analytics', 'A/B Testing', 'Roadmapping'],
    'data-scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Tableau'],
    'designer': ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Wireframing'],
    'marketing': ['Digital Marketing', 'SEO', 'Google Analytics', 'Social Media', 'Content Strategy']
  };

  return skillsMap[role || ''] || [];
}

function extractSkillsFromJobDescription(jobDescription: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'SQL', 'Git', 'Agile', 'Scrum', 'Figma', 'Adobe', 'Analytics', 'Excel'
  ];

  return commonSkills.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );
}

function getSectionContent(resumeData: EnhancedResumeData, section: string): any {
  switch (section) {
    case 'summary':
      return resumeData.professionalSummary;
    case 'experience':
      return resumeData.experience;
    case 'skills':
      return resumeData.skills;
    case 'education':
      return resumeData.education;
    default:
      return null;
  }
}