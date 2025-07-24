import { useState, useEffect, useCallback } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';
import { useDebounce } from '@/hooks/useDebounce';

export interface ATSAnalysisResult {
  overallScore: number;
  sections: {
    personalInfo: ATSSectionScore;
    summary: ATSSectionScore;
    experience: ATSSectionScore;
    education: ATSSectionScore;
    skills: ATSSectionScore;
  };
  keywords: {
    matched: string[];
    missing: string[];
    density: number;
    recommendations: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  trafficLight: 'red' | 'yellow' | 'green';
}

export interface ATSSectionScore {
  score: number;
  status: 'red' | 'yellow' | 'green';
  issues: string[];
  suggestions: string[];
  improvements: string[];
}

interface JobDescriptionAnalysis {
  keywords: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  industry: string;
  role: string;
}

export const useRealTimeATS = (resumeData: EnhancedResumeData, jobDescription?: string) => {
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobAnalysis, setJobAnalysis] = useState<JobDescriptionAnalysis | null>(null);
  
  // Debounce resume data changes to avoid excessive API calls
  const debouncedResumeData = useDebounce(resumeData, 1000);
  const debouncedJobDescription = useDebounce(jobDescription, 1500);

  // Analyze job description for keywords and requirements
  const analyzeJobDescription = useCallback((description: string): JobDescriptionAnalysis => {
    const keywords = extractKeywords(description);
    const skills = extractSkills(description);
    const experienceLevel = extractExperienceLevel(description);
    const industry = extractIndustry(description);
    const role = extractRole(description);

    return {
      keywords: keywords.slice(0, 20), // Top 20 keywords
      requiredSkills: skills.required,
      preferredSkills: skills.preferred,
      experienceLevel,
      industry,
      role
    };
  }, []);

  // Extract keywords from text using NLP-like approach
  const extractKeywords = (text: string): string[] => {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'will', 'be', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did',
      'a', 'an', 'as', 'this', 'that', 'these', 'those', 'we', 'you', 'they', 'them'
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));

    const frequency: Record<string, number> = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30)
      .map(([word]) => word);
  };

  // Extract skills from job description
  const extractSkills = (text: string) => {
    const skillPatterns = {
      required: /(?:required|must have|essential|mandatory)[^.]*?(?:skills?|experience|knowledge)[^.]*?([^.]+)/gi,
      preferred: /(?:preferred|nice to have|desired|plus|bonus)[^.]*?(?:skills?|experience|knowledge)[^.]*?([^.]+)/gi
    };

    const required: string[] = [];
    const preferred: string[] = [];

    let match;
    while ((match = skillPatterns.required.exec(text)) !== null) {
      required.push(...extractSkillsFromText(match[1]));
    }

    while ((match = skillPatterns.preferred.exec(text)) !== null) {
      preferred.push(...extractSkillsFromText(match[1]));
    }

    return { required, preferred };
  };

  const extractSkillsFromText = (text: string): string[] => {
    const techSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'typescript', 'sql',
      'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'figma', 'sketch'
    ];
    
    const skills: string[] = [];
    const lowerText = text.toLowerCase();
    
    techSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        skills.push(skill);
      }
    });

    return skills;
  };

  const extractExperienceLevel = (text: string): string => {
    const levels = {
      'entry': /(?:entry.level|junior|0-2 years|graduate|new grad)/i,
      'mid': /(?:mid.level|3-5 years|intermediate|experienced)/i,
      'senior': /(?:senior|lead|6+ years|5+ years|expert)/i,
      'executive': /(?:director|manager|vp|cto|ceo|executive)/i
    };

    for (const [level, pattern] of Object.entries(levels)) {
      if (pattern.test(text)) return level;
    }
    return 'mid';
  };

  const extractIndustry = (text: string): string => {
    const industries = {
      'technology': /(?:tech|software|saas|startup|fintech)/i,
      'finance': /(?:finance|banking|investment|trading)/i,
      'healthcare': /(?:healthcare|medical|pharma|biotech)/i,
      'consulting': /(?:consulting|advisory|strategy)/i,
      'education': /(?:education|university|academic)/i
    };

    for (const [industry, pattern] of Object.entries(industries)) {
      if (pattern.test(text)) return industry;
    }
    return 'general';
  };

  const extractRole = (text: string): string => {
    const roles = {
      'software-engineer': /(?:software engineer|developer|programmer)/i,
      'product-manager': /(?:product manager|pm)/i,
      'data-scientist': /(?:data scientist|analyst|ml engineer)/i,
      'designer': /(?:designer|ux|ui)/i,
      'marketing': /(?:marketing|growth|digital marketing)/i
    };

    for (const [role, pattern] of Object.entries(roles)) {
      if (pattern.test(text)) return role;
    }
    return 'general';
  };

  // Analyze resume sections for ATS compatibility
  const analyzeResumeSection = (
    sectionName: string, 
    content: any, 
    jobKeywords: string[] = []
  ): ATSSectionScore => {
    const analysis = {
      score: 0,
      status: 'red' as const,
      issues: [] as string[],
      suggestions: [] as string[],
      improvements: [] as string[]
    };

    switch (sectionName) {
      case 'personalInfo':
        return analyzePersonalInfo(content);
      case 'summary':
        return analyzeSummary(content, jobKeywords);
      case 'experience':
        return analyzeExperience(content, jobKeywords);
      case 'education':
        return analyzeEducation(content);
      case 'skills':
        return analyzeSkills(content, jobKeywords);
      default:
        return analysis;
    }
  };

  const analyzePersonalInfo = (info: any): ATSSectionScore => {
    const analysis: ATSSectionScore = {
      score: 0,
      status: 'red',
      issues: [],
      suggestions: [],
      improvements: []
    };

    let score = 0;
    const required = ['fullName', 'email', 'phone'];
    const missing = required.filter(field => !info[field]);

    if (missing.length === 0) {
      score += 40;
    } else {
      analysis.issues.push(`Missing required fields: ${missing.join(', ')}`);
    }

    if (info.linkedin) score += 20;
    else analysis.suggestions.push('Add LinkedIn profile URL');

    if (info.location) score += 20;
    else analysis.suggestions.push('Add location for better job matching');

    if (info.website || info.github) score += 20;
    else analysis.suggestions.push('Add portfolio website or GitHub profile');

    analysis.score = score;
    analysis.status = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';

    return analysis;
  };

  const analyzeSummary = (summary: any, keywords: string[]): ATSSectionScore => {
    const analysis: ATSSectionScore = {
      score: 0,
      status: 'red',
      issues: [],
      suggestions: [],
      improvements: []
    };

    const content = summary?.content || '';
    let score = 0;

    if (!content) {
      analysis.issues.push('Professional summary is missing');
      return analysis;
    }

    const wordCount = content.split(' ').length;
    if (wordCount < 50) {
      analysis.issues.push('Summary is too short (minimum 50 words)');
    } else if (wordCount > 150) {
      analysis.issues.push('Summary is too long (maximum 150 words)');
    } else {
      score += 30;
    }

    // Check for action verbs
    const actionVerbs = ['led', 'managed', 'developed', 'created', 'improved', 'achieved'];
    const hasActionVerbs = actionVerbs.some(verb => content.toLowerCase().includes(verb));
    if (hasActionVerbs) {
      score += 25;
    } else {
      analysis.suggestions.push('Include action verbs (led, managed, developed, etc.)');
    }

    // Check for quantifiable achievements
    const hasNumbers = /\d+/.test(content);
    if (hasNumbers) {
      score += 25;
    } else {
      analysis.suggestions.push('Include quantifiable achievements with numbers');
    }

    // Check for keyword match
    const matchedKeywords = keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    const keywordScore = Math.min((matchedKeywords.length / keywords.length) * 20, 20);
    score += keywordScore;

    if (keywordScore < 10) {
      analysis.suggestions.push('Include more relevant keywords from the job description');
    }

    analysis.score = Math.round(score);
    analysis.status = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';

    return analysis;
  };

  const analyzeExperience = (experiences: any[], keywords: string[]): ATSSectionScore => {
    const analysis: ATSSectionScore = {
      score: 0,
      status: 'red',
      issues: [],
      suggestions: [],
      improvements: []
    };

    if (!experiences || experiences.length === 0) {
      analysis.issues.push('No work experience listed');
      return analysis;
    }

    let totalScore = 0;
    const maxScore = 100;

    // Check each experience entry
    experiences.forEach((exp, index) => {
      let expScore = 0;

      // Required fields
      const requiredFields = ['title', 'company', 'startDate', 'description'];
      const missingFields = requiredFields.filter(field => !exp[field]);
      
      if (missingFields.length === 0) {
        expScore += 20;
      } else {
        analysis.issues.push(`Experience ${index + 1}: Missing ${missingFields.join(', ')}`);
      }

      // Check for action verbs in descriptions
      const description = exp.description || '';
      const actionVerbs = ['led', 'managed', 'developed', 'created', 'improved', 'achieved'];
      const hasActionVerbs = actionVerbs.some(verb => description.toLowerCase().includes(verb));
      
      if (hasActionVerbs) {
        expScore += 20;
      } else {
        analysis.suggestions.push(`Experience ${index + 1}: Use action verbs to start bullet points`);
      }

      // Check for quantifiable achievements
      const hasNumbers = /\d+/.test(description);
      if (hasNumbers) {
        expScore += 20;
      } else {
        analysis.suggestions.push(`Experience ${index + 1}: Include quantifiable achievements`);
      }

      // Keyword matching
      const matchedKeywords = keywords.filter(keyword => 
        description.toLowerCase().includes(keyword.toLowerCase())
      );
      const keywordScore = Math.min((matchedKeywords.length / Math.max(keywords.length, 1)) * 40, 40);
      expScore += keywordScore;

      totalScore += expScore;
    });

    analysis.score = Math.round(totalScore / experiences.length);
    analysis.status = analysis.score >= 80 ? 'green' : analysis.score >= 60 ? 'yellow' : 'red';

    return analysis;
  };

  const analyzeEducation = (education: any[]): ATSSectionScore => {
    const analysis: ATSSectionScore = {
      score: 80, // Education is generally well-formatted
      status: 'green',
      issues: [],
      suggestions: [],
      improvements: []
    };

    if (!education || education.length === 0) {
      analysis.score = 60;
      analysis.status = 'yellow';
      analysis.suggestions.push('Consider adding education information');
    }

    return analysis;
  };

  const analyzeSkills = (skills: any[], keywords: string[]): ATSSectionScore => {
    const analysis: ATSSectionScore = {
      score: 0,
      status: 'red',
      issues: [],
      suggestions: [],
      improvements: []
    };

    if (!skills || skills.length === 0) {
      analysis.issues.push('No skills listed');
      return analysis;
    }

    let score = 0;

    // Check skill count
    if (skills.length >= 8) {
      score += 30;
    } else {
      analysis.suggestions.push('Add more skills (aim for 8-15 relevant skills)');
    }

    // Check for skill categories
    const categories = [...new Set(skills.map(skill => skill.category))];
    if (categories.length >= 2) {
      score += 20;
    } else {
      analysis.suggestions.push('Organize skills into categories (Technical, Soft Skills, etc.)');
    }

    // Check keyword matching
    const skillNames = skills.map(skill => skill.name?.toLowerCase() || skill.toLowerCase());
    const matchedKeywords = keywords.filter(keyword => 
      skillNames.some(skill => skill.includes(keyword.toLowerCase()))
    );
    
    const keywordScore = Math.min((matchedKeywords.length / Math.max(keywords.length, 1)) * 50, 50);
    score += keywordScore;

    if (keywordScore < 25) {
      analysis.suggestions.push('Include more skills mentioned in the job description');
    }

    analysis.score = Math.round(score);
    analysis.status = score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';

    return analysis;
  };

  // Main analysis function
  const performAnalysis = useCallback(async () => {
    if (!debouncedResumeData) return;

    setIsAnalyzing(true);
    
    try {
      // Analyze job description if provided
      let jobKeywords: string[] = [];
      if (debouncedJobDescription) {
        const analysis = analyzeJobDescription(debouncedJobDescription);
        setJobAnalysis(analysis);
        jobKeywords = analysis.keywords;
      }

      // Analyze each resume section
      const sections = {
        personalInfo: analyzeResumeSection('personalInfo', debouncedResumeData.personalInfo, jobKeywords),
        summary: analyzeResumeSection('summary', debouncedResumeData.professionalSummary, jobKeywords),
        experience: analyzeResumeSection('experience', debouncedResumeData.experience, jobKeywords),
        education: analyzeResumeSection('education', debouncedResumeData.education, jobKeywords),
        skills: analyzeResumeSection('skills', debouncedResumeData.skills, jobKeywords)
      };

      // Calculate overall score
      const overallScore = Math.round(
        Object.values(sections).reduce((sum, section) => sum + section.score, 0) / 5
      );

      // Determine traffic light status
      const trafficLight: 'red' | 'yellow' | 'green' = 
        overallScore >= 80 ? 'green' : overallScore >= 60 ? 'yellow' : 'red';

      // Analyze formatting
      const formatting = {
        score: 85, // Assume good formatting for now
        issues: [] as string[],
        improvements: [] as string[]
      };

      const result: ATSAnalysisResult = {
        overallScore,
        sections,
        keywords: {
          matched: jobKeywords.slice(0, 10), // Top matched keywords
          missing: jobKeywords.slice(10, 15), // Missing keywords
          density: jobKeywords.length / 100, // Keyword density
          recommendations: jobKeywords.slice(15, 20) // Recommended keywords
        },
        formatting,
        trafficLight
      };

      setAtsAnalysis(result);
    } catch (error) {
      console.error('ATS analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [debouncedResumeData, debouncedJobDescription, analyzeJobDescription]);

  // Run analysis when resume data or job description changes
  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  return {
    atsAnalysis,
    jobAnalysis,
    isAnalyzing,
    performAnalysis
  };
};