import { EnhancedExtractedContent } from '../interfaces/EnhancedExtractedContent';

interface ATSAnalysis {
  overallScore: number;
  sectionsScore: {
    formatting: number;
    keywords: number;
    content: number;
    structure: number;
  };
  recommendations: Array<{
    category: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
  }>;
  missingKeywords: Array<{
    keyword: string;
    importance: number;
    suggestions: string[];
  }>;
  strengths: string[];
  weaknesses: string[];
}

export class ATSScanner {
  private readonly atsKeywords = {
    'software_engineer': {
      technical: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Git', 'SQL', 'API', 'Agile', 'CI/CD'],
      soft: ['Problem Solving', 'Team Collaboration', 'Communication', 'Leadership', 'Adaptability'],
      tools: ['Docker', 'Kubernetes', 'Jenkins', 'JIRA', 'Confluence', 'VS Code', 'GitHub'],
      methodologies: ['Scrum', 'Agile', 'DevOps', 'Test-Driven Development', 'Code Review']
    },
    'data_scientist': {
      technical: ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn'],
      soft: ['Analytical Thinking', 'Problem Solving', 'Communication', 'Attention to Detail'],
      tools: ['Jupyter', 'Tableau', 'Power BI', 'Excel', 'Google Analytics', 'Apache Spark'],
      methodologies: ['Statistical Analysis', 'Data Mining', 'Predictive Modeling', 'A/B Testing']
    },
    'product_manager': {
      technical: ['Product Strategy', 'Roadmap Planning', 'User Research', 'Data Analysis', 'A/B Testing'],
      soft: ['Leadership', 'Communication', 'Strategic Thinking', 'Stakeholder Management'],
      tools: ['JIRA', 'Confluence', 'Figma', 'Miro', 'Google Analytics', 'Mixpanel'],
      methodologies: ['Agile', 'Scrum', 'Lean', 'Design Thinking', 'User-Centered Design']
    },
    'marketing_manager': {
      technical: ['Digital Marketing', 'SEO', 'SEM', 'Content Marketing', 'Social Media', 'Email Marketing'],
      soft: ['Creativity', 'Communication', 'Strategic Thinking', 'Brand Management'],
      tools: ['Google Ads', 'Facebook Ads', 'HubSpot', 'Mailchimp', 'Hootsuite', 'Google Analytics'],
      methodologies: ['Inbound Marketing', 'Growth Hacking', 'Content Strategy', 'Campaign Management']
    },
    'designer': {
      technical: ['UI/UX Design', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems'],
      soft: ['Creativity', 'Attention to Detail', 'Communication', 'Problem Solving'],
      tools: ['Figma', 'Sketch', 'Adobe Creative Suite', 'InVision', 'Principle', 'Framer'],
      methodologies: ['Design Thinking', 'User-Centered Design', 'Agile Design', 'Design Sprint']
    }
  };

  private readonly atsFormattingRules = [
    { rule: 'Use standard section headers', weight: 10 },
    { rule: 'Include contact information', weight: 15 },
    { rule: 'Use consistent date formatting', weight: 8 },
    { rule: 'Include relevant keywords', weight: 20 },
    { rule: 'Use bullet points for responsibilities', weight: 12 },
    { rule: 'Include quantifiable achievements', weight: 18 },
    { rule: 'Avoid graphics and images', weight: 5 },
    { rule: 'Use standard fonts', weight: 7 },
    { rule: 'Keep consistent formatting', weight: 5 }
  ];

  scanResume(
    resumeData: EnhancedExtractedContent,
    jobDescription?: string,
    targetRole?: string
  ): ATSAnalysis {
    console.log('🔍 Scanning resume for ATS compatibility...');

    const role = this.detectRole(resumeData, targetRole);
    const jobKeywords = jobDescription ? this.extractJobKeywords(jobDescription) : [];
    const roleKeywords = this.atsKeywords[role] || this.atsKeywords['software_engineer'];

    // Calculate section scores
    const formattingScore = this.calculateFormattingScore(resumeData);
    const keywordScore = this.calculateKeywordScore(resumeData, roleKeywords, jobKeywords);
    const contentScore = this.calculateContentScore(resumeData);
    const structureScore = this.calculateStructureScore(resumeData);

    // Calculate overall score
    const overallScore = Math.round(
      (formattingScore * 0.25 + keywordScore * 0.35 + contentScore * 0.25 + structureScore * 0.15)
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      resumeData,
      { formattingScore, keywordScore, contentScore, structureScore },
      roleKeywords,
      jobKeywords
    );

    // Find missing keywords
    const missingKeywords = this.findMissingKeywords(resumeData, roleKeywords, jobKeywords);

    // Identify strengths and weaknesses
    const strengths = this.identifyStrengths(resumeData, { formattingScore, keywordScore, contentScore, structureScore });
    const weaknesses = this.identifyWeaknesses(resumeData, { formattingScore, keywordScore, contentScore, structureScore });

    return {
      overallScore,
      sectionsScore: {
        formatting: formattingScore,
        keywords: keywordScore,
        content: contentScore,
        structure: structureScore
      },
      recommendations,
      missingKeywords,
      strengths,
      weaknesses
    };
  }

  private detectRole(resumeData: EnhancedExtractedContent, targetRole?: string): string {
    if (targetRole && this.atsKeywords[targetRole.toLowerCase().replace(/\s+/g, '_')]) {
      return targetRole.toLowerCase().replace(/\s+/g, '_');
    }

    const experienceText = resumeData.experience
      .map(exp => `${exp.jobTitle} ${exp.responsibilities.join(' ')}`)
      .join(' ')
      .toLowerCase();

    const roleScores = Object.keys(this.atsKeywords).map(role => {
      const keywords = [
        ...this.atsKeywords[role].technical,
        ...this.atsKeywords[role].soft,
        ...this.atsKeywords[role].tools,
        ...this.atsKeywords[role].methodologies
      ];
      
      const score = keywords.reduce((acc, keyword) => {
        return acc + (experienceText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);

      return { role, score };
    });

    const topRole = roleScores.reduce((max, current) => 
      current.score > max.score ? current : max
    );

    return topRole.role;
  }

  private extractJobKeywords(jobDescription: string): string[] {
    const commonKeywords = [
      'experience', 'required', 'preferred', 'skills', 'knowledge', 'proficiency',
      'expertise', 'familiarity', 'understanding', 'background', 'ability'
    ];

    const words = jobDescription.toLowerCase().split(/\W+/);
    const keywordFrequency: { [key: string]: number } = {};

    // Count word frequency
    words.forEach(word => {
      if (word.length > 3 && !commonKeywords.includes(word)) {
        keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
      }
    });

    // Return top keywords
    return Object.entries(keywordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  private calculateFormattingScore(resumeData: EnhancedExtractedContent): number {
    let score = 0;

    // Contact information completeness (30 points)
    const contactInfo = resumeData.personalInfo;
    if (contactInfo.fullName) score += 8;
    if (contactInfo.email) score += 8;
    if (contactInfo.phone) score += 7;
    if (contactInfo.location) score += 7;

    // Section completeness (40 points)
    if (resumeData.professionalSummary.content) score += 10;
    if (resumeData.experience.length > 0) score += 15;
    if (resumeData.education.length > 0) score += 8;
    if (resumeData.skills.technical.length > 0) score += 7;

    // Date formatting consistency (15 points)
    const dateConsistency = this.checkDateConsistency(resumeData);
    score += dateConsistency * 15;

    // Content structure (15 points)
    if (resumeData.experience.some(exp => exp.responsibilities.length > 0)) score += 8;
    if (resumeData.experience.some(exp => exp.achievements.length > 0)) score += 7;

    return Math.min(100, score);
  }

  private calculateKeywordScore(
    resumeData: EnhancedExtractedContent,
    roleKeywords: any,
    jobKeywords: string[]
  ): number {
    const resumeText = this.getResumeText(resumeData).toLowerCase();
    const allRoleKeywords = [
      ...roleKeywords.technical,
      ...roleKeywords.soft,
      ...roleKeywords.tools,
      ...roleKeywords.methodologies
    ];

    // Role-specific keywords (60 points)
    const roleKeywordMatches = allRoleKeywords.filter(keyword => 
      resumeText.includes(keyword.toLowerCase())
    );
    const roleKeywordScore = Math.min(60, (roleKeywordMatches.length / allRoleKeywords.length) * 60);

    // Job-specific keywords (40 points)
    let jobKeywordScore = 0;
    if (jobKeywords.length > 0) {
      const jobKeywordMatches = jobKeywords.filter(keyword => 
        resumeText.includes(keyword.toLowerCase())
      );
      jobKeywordScore = Math.min(40, (jobKeywordMatches.length / jobKeywords.length) * 40);
    } else {
      jobKeywordScore = 40; // Default if no job description provided
    }

    return Math.round(roleKeywordScore + jobKeywordScore);
  }

  private calculateContentScore(resumeData: EnhancedExtractedContent): number {
    let score = 0;

    // Quantifiable achievements (30 points)
    const hasQuantifiableAchievements = this.hasQuantifiableAchievements(resumeData);
    score += hasQuantifiableAchievements * 30;

    // Professional summary quality (20 points)
    const summaryQuality = this.evaluateSummaryQuality(resumeData.professionalSummary);
    score += summaryQuality * 20;

    // Experience descriptions (25 points)
    const experienceQuality = this.evaluateExperienceQuality(resumeData.experience);
    score += experienceQuality * 25;

    // Skills relevance (25 points)
    const skillsRelevance = this.evaluateSkillsRelevance(resumeData.skills);
    score += skillsRelevance * 25;

    return Math.min(100, score);
  }

  private calculateStructureScore(resumeData: EnhancedExtractedContent): number {
    let score = 0;

    // Standard section order (30 points)
    score += 30; // Assume good structure since we control it

    // Consistent formatting (25 points)
    score += 25; // Assume consistent formatting

    // Appropriate length (20 points)
    const totalLength = this.getResumeText(resumeData).length;
    if (totalLength > 1000 && totalLength < 8000) {
      score += 20;
    } else if (totalLength > 500 && totalLength < 10000) {
      score += 15;
    } else {
      score += 10;
    }

    // Section completeness (25 points)
    const completeSections = this.countCompleteSections(resumeData);
    score += Math.min(25, completeSections * 3);

    return Math.min(100, score);
  }

  private generateRecommendations(
    resumeData: EnhancedExtractedContent,
    scores: any,
    roleKeywords: any,
    jobKeywords: string[]
  ): Array<{
    category: string;
    suggestion: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: string;
  }> {
    const recommendations = [];

    // Formatting recommendations
    if (scores.formattingScore < 80) {
      if (!resumeData.personalInfo.fullName) {
        recommendations.push({
          category: 'Contact Information',
          suggestion: 'Add your full name to the resume',
          priority: 'critical' as const,
          impact: 'Essential for ATS parsing'
        });
      }
      if (!resumeData.personalInfo.email) {
        recommendations.push({
          category: 'Contact Information',
          suggestion: 'Include a professional email address',
          priority: 'critical' as const,
          impact: 'Required for recruiter contact'
        });
      }
      if (!resumeData.personalInfo.phone) {
        recommendations.push({
          category: 'Contact Information',
          suggestion: 'Add your phone number',
          priority: 'high' as const,
          impact: 'Important for recruiter contact'
        });
      }
    }

    // Keyword recommendations
    if (scores.keywordScore < 70) {
      recommendations.push({
        category: 'Keywords',
        suggestion: 'Include more industry-specific keywords in your experience descriptions',
        priority: 'high' as const,
        impact: 'Improves ATS matching and ranking'
      });
    }

    // Content recommendations
    if (scores.contentScore < 70) {
      if (!this.hasQuantifiableAchievements(resumeData)) {
        recommendations.push({
          category: 'Content',
          suggestion: 'Add quantifiable achievements with specific numbers, percentages, or metrics',
          priority: 'high' as const,
          impact: 'Demonstrates measurable impact'
        });
      }
      
      if (resumeData.professionalSummary.content.length < 100) {
        recommendations.push({
          category: 'Content',
          suggestion: 'Expand your professional summary to 2-3 sentences highlighting key achievements',
          priority: 'medium' as const,
          impact: 'Provides better first impression'
        });
      }
    }

    // Structure recommendations
    if (scores.structureScore < 70) {
      recommendations.push({
        category: 'Structure',
        suggestion: 'Ensure consistent formatting across all sections',
        priority: 'medium' as const,
        impact: 'Improves ATS parsing accuracy'
      });
    }

    return recommendations;
  }

  private findMissingKeywords(
    resumeData: EnhancedExtractedContent,
    roleKeywords: any,
    jobKeywords: string[]
  ): Array<{
    keyword: string;
    importance: number;
    suggestions: string[];
  }> {
    const resumeText = this.getResumeText(resumeData).toLowerCase();
    const missing = [];

    // Check role-specific keywords
    const allRoleKeywords = [
      ...roleKeywords.technical,
      ...roleKeywords.soft,
      ...roleKeywords.tools,
      ...roleKeywords.methodologies
    ];

    allRoleKeywords.forEach(keyword => {
      if (!resumeText.includes(keyword.toLowerCase())) {
        missing.push({
          keyword,
          importance: roleKeywords.technical.includes(keyword) ? 0.9 : 0.7,
          suggestions: this.generateKeywordSuggestions(keyword)
        });
      }
    });

    // Check job-specific keywords
    jobKeywords.forEach(keyword => {
      if (!resumeText.includes(keyword.toLowerCase())) {
        missing.push({
          keyword,
          importance: 0.8,
          suggestions: this.generateKeywordSuggestions(keyword)
        });
      }
    });

    return missing.slice(0, 10); // Return top 10 missing keywords
  }

  private generateKeywordSuggestions(keyword: string): string[] {
    const suggestions = [];
    
    if (keyword.toLowerCase().includes('javascript')) {
      suggestions.push('Include JavaScript projects in your experience');
      suggestions.push('Add JavaScript frameworks you\'ve used');
    } else if (keyword.toLowerCase().includes('python')) {
      suggestions.push('Mention Python scripts or applications you\'ve built');
      suggestions.push('Include Python libraries you\'re familiar with');
    } else if (keyword.toLowerCase().includes('leadership')) {
      suggestions.push('Describe teams you\'ve led or mentored');
      suggestions.push('Include examples of leadership initiatives');
    } else {
      suggestions.push(`Include examples of ${keyword} in your experience`);
      suggestions.push(`Add ${keyword} to your skills section if relevant`);
    }

    return suggestions;
  }

  private identifyStrengths(resumeData: EnhancedExtractedContent, scores: any): string[] {
    const strengths = [];

    if (scores.formattingScore >= 80) {
      strengths.push('Well-formatted with complete contact information');
    }
    if (scores.keywordScore >= 80) {
      strengths.push('Rich in relevant industry keywords');
    }
    if (scores.contentScore >= 80) {
      strengths.push('Contains quantifiable achievements and strong descriptions');
    }
    if (scores.structureScore >= 80) {
      strengths.push('Well-structured with consistent formatting');
    }

    if (resumeData.experience.length >= 3) {
      strengths.push('Demonstrates progressive career growth');
    }
    if (resumeData.skills.technical.length >= 5) {
      strengths.push('Strong technical skill set');
    }

    return strengths;
  }

  private identifyWeaknesses(resumeData: EnhancedExtractedContent, scores: any): string[] {
    const weaknesses = [];

    if (scores.formattingScore < 70) {
      weaknesses.push('Formatting issues may affect ATS parsing');
    }
    if (scores.keywordScore < 70) {
      weaknesses.push('Missing important industry keywords');
    }
    if (scores.contentScore < 70) {
      weaknesses.push('Lacks quantifiable achievements or strong descriptions');
    }
    if (scores.structureScore < 70) {
      weaknesses.push('Inconsistent structure or formatting');
    }

    if (!this.hasQuantifiableAchievements(resumeData)) {
      weaknesses.push('No quantifiable achievements to demonstrate impact');
    }

    return weaknesses;
  }

  private checkDateConsistency(resumeData: EnhancedExtractedContent): number {
    const dates = [
      ...resumeData.experience.map(exp => [exp.startDate, exp.endDate]).flat(),
      ...resumeData.education.map(edu => [edu.startDate, edu.endDate]).flat()
    ].filter(Boolean);

    if (dates.length === 0) return 0;

    // Check if dates follow consistent patterns
    const hasYear = dates.some(date => /\d{4}/.test(date));
    const hasMonth = dates.some(date => /\w+\s+\d{4}/.test(date));
    
    return hasYear || hasMonth ? 1 : 0.5;
  }

  private getResumeText(resumeData: EnhancedExtractedContent): string {
    return [
      resumeData.personalInfo.fullName,
      resumeData.professionalSummary.content,
      ...resumeData.experience.map(exp => 
        `${exp.jobTitle} ${exp.companyName} ${exp.responsibilities.join(' ')} ${exp.achievements.join(' ')}`
      ),
      ...resumeData.education.map(edu => `${edu.degree} ${edu.institutionName}`),
      ...resumeData.skills.technical.map(skill => skill.skill),
      ...resumeData.skills.soft.map(skill => skill.skill),
      ...resumeData.projects.map(proj => `${proj.title} ${proj.description}`),
      ...resumeData.certifications.map(cert => `${cert.name} ${cert.issuingOrganization}`)
    ].join(' ');
  }

  private hasQuantifiableAchievements(resumeData: EnhancedExtractedContent): number {
    const resumeText = this.getResumeText(resumeData);
    const quantifiablePatterns = [
      /\d+%/g,
      /\d+\+/g,
      /\$\d+/g,
      /\d+x/g,
      /\d+\s*(million|thousand|k|m)/gi
    ];

    const matches = quantifiablePatterns.reduce((total, pattern) => {
      const matches = resumeText.match(pattern);
      return total + (matches ? matches.length : 0);
    }, 0);

    return Math.min(1, matches / 3); // Normalize to 0-1 scale
  }

  private evaluateSummaryQuality(summary: any): number {
    if (!summary.content || summary.content.length < 50) return 0;
    
    let score = 0.5; // Base score for having content
    
    // Check for keywords
    if (summary.content.toLowerCase().includes('experience')) score += 0.2;
    if (summary.content.toLowerCase().includes('skilled')) score += 0.1;
    if (summary.content.toLowerCase().includes('proven')) score += 0.1;
    if (/\d+\+?\s*years?/.test(summary.content)) score += 0.1;
    
    return Math.min(1, score);
  }

  private evaluateExperienceQuality(experience: any[]): number {
    if (experience.length === 0) return 0;
    
    let totalScore = 0;
    
    experience.forEach(exp => {
      let expScore = 0;
      
      if (exp.responsibilities.length > 0) expScore += 0.3;
      if (exp.achievements.length > 0) expScore += 0.3;
      if (exp.responsibilities.some(r => /\d+%|\d+\+|\$\d+/.test(r))) expScore += 0.2;
      if (exp.responsibilities.some(r => r.length > 50)) expScore += 0.2;
      
      totalScore += expScore;
    });
    
    return Math.min(1, totalScore / experience.length);
  }

  private evaluateSkillsRelevance(skills: any): number {
    const technicalSkills = skills.technical.length;
    const softSkills = skills.soft.length;
    
    if (technicalSkills === 0 && softSkills === 0) return 0;
    
    let score = 0;
    if (technicalSkills > 0) score += 0.6;
    if (softSkills > 0) score += 0.4;
    
    // Bonus for having many skills
    if (technicalSkills >= 5) score += 0.2;
    if (softSkills >= 3) score += 0.1;
    
    return Math.min(1, score);
  }

  private countCompleteSections(resumeData: EnhancedExtractedContent): number {
    let count = 0;
    
    if (resumeData.personalInfo.fullName) count++;
    if (resumeData.professionalSummary.content) count++;
    if (resumeData.experience.length > 0) count++;
    if (resumeData.education.length > 0) count++;
    if (resumeData.skills.technical.length > 0) count++;
    if (resumeData.projects.length > 0) count++;
    if (resumeData.certifications.length > 0) count++;
    
    return count;
  }
}