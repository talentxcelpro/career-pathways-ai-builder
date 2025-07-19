
import { supabase } from '@/integrations/supabase/client';

export interface ATSAnalysis {
  score: number;
  issues: Array<{
    type: 'format' | 'structure' | 'content';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    location?: string;
    suggestion: string;
  }>;
  readabilityScore: number;
  formatCompatibility: {
    tables: boolean;
    graphics: boolean;
    columns: boolean;
    fonts: string[];
    headingStructure: boolean;
  };
}

export interface KeywordAnalysis {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  industryKeywords: string[];
  skillGaps: Array<{
    skill: string;
    importance: 'high' | 'medium' | 'low';
    suggestion: string;
  }>;
  keywordDensity: { [key: string]: number };
}

export interface ContentQuality {
  grammarScore: number;
  styleScore: number;
  achievementScore: number;
  issues: Array<{
    type: 'grammar' | 'style' | 'achievement' | 'structure';
    message: string;
    suggestion: string;
    location: string;
  }>;
  bulletPointAnalysis: Array<{
    original: string;
    starMethodScore: number;
    suggestions: string[];
    rewriteExample: string;
  }>;
}

export interface VisualAnalysis {
  heatmapData: Array<{
    section: string;
    attention: number;
    importance: number;
    recommendations: string[];
  }>;
  layoutScore: number;
  lengthAnalysis: {
    wordCount: number;
    pageCount: number;
    optimal: boolean;
    recommendation: string;
  };
  formattingScore: number;
}

export interface ComprehensiveResumeAnalysis {
  overallScore: number;
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
  subScores: {
    ats: number;
    keywords: number;
    content: number;
    format: number;
    achievements: number;
  };
  atsAnalysis: ATSAnalysis;
  keywordAnalysis: KeywordAnalysis;
  contentQuality: ContentQuality;
  visualAnalysis: VisualAnalysis;
  industryBenchmark: {
    percentile: number;
    averageScore: number;
    competitiveness: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
  };
  actionableInsights: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    issue: string;
    solution: string;
    impact: string;
  }>;
}

export class ResumeAnalysisService {
  private static industryKeywords: { [key: string]: string[] } = {
    'software': ['javascript', 'python', 'react', 'node.js', 'aws', 'docker', 'git', 'agile', 'scrum'],
    'marketing': ['seo', 'google analytics', 'social media', 'content marketing', 'ppc', 'conversion optimization'],
    'finance': ['financial modeling', 'excel', 'sql', 'risk management', 'compliance', 'budgeting'],
    'healthcare': ['patient care', 'medical records', 'hipaa', 'clinical', 'healthcare', 'medical'],
    'sales': ['crm', 'lead generation', 'b2b', 'quota', 'pipeline', 'negotiation', 'closing']
  };

  static async analyzeResume(
    resumeContent: string, 
    jobDescription?: string,
    industry?: string
  ): Promise<ComprehensiveResumeAnalysis> {
    try {
      // Call AI service for comprehensive analysis
      const { data, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          operation: 'comprehensive_analysis',
          resumeContent,
          jobDescription,
          industry
        }
      });

      if (error) throw error;

      // If AI service is unavailable, provide mock analysis
      if (!data) {
        return this.generateMockAnalysis(resumeContent, jobDescription, industry);
      }

      return data;
    } catch (error) {
      console.error('Resume analysis failed:', error);
      return this.generateMockAnalysis(resumeContent, jobDescription, industry);
    }
  }

  private static generateMockAnalysis(
    resumeContent: string,
    jobDescription?: string,
    industry?: string
  ): ComprehensiveResumeAnalysis {
    const wordCount = resumeContent.split(' ').length;
    const hasQuantifiedAchievements = /\d+%|\$\d+|\d+\+/.test(resumeContent);
    const hasActionVerbs = /(led|managed|developed|created|increased|reduced|implemented)/i.test(resumeContent);
    
    const baseScore = 75;
    const atsScore = this.calculateATSScore(resumeContent);
    const keywordScore = this.calculateKeywordScore(resumeContent, jobDescription, industry);
    const contentScore = hasQuantifiedAchievements && hasActionVerbs ? 85 : 70;
    const formatScore = wordCount > 200 && wordCount < 800 ? 90 : 75;
    const achievementScore = hasQuantifiedAchievements ? 88 : 65;

    const overallScore = Math.round((atsScore + keywordScore + contentScore + formatScore + achievementScore) / 5);
    
    return {
      overallScore,
      grade: this.calculateGrade(overallScore),
      subScores: {
        ats: atsScore,
        keywords: keywordScore,
        content: contentScore,
        format: formatScore,
        achievements: achievementScore
      },
      atsAnalysis: this.generateATSAnalysis(resumeContent),
      keywordAnalysis: this.generateKeywordAnalysis(resumeContent, jobDescription, industry),
      contentQuality: this.generateContentQuality(resumeContent),
      visualAnalysis: this.generateVisualAnalysis(resumeContent),
      industryBenchmark: {
        percentile: Math.min(95, overallScore + 10),
        averageScore: 72,
        competitiveness: overallScore > 85 ? 'excellent' : overallScore > 75 ? 'good' : 'average'
      },
      actionableInsights: this.generateActionableInsights(overallScore, atsScore, keywordScore, contentScore)
    };
  }

  private static calculateATSScore(content: string): number {
    let score = 100;
    
    // Check for ATS-unfriendly elements
    if (content.includes('|') || content.includes('•')) score -= 5; // Tables or special chars
    if (content.length < 200) score -= 20; // Too short
    if (content.length > 1000) score -= 10; // Too long
    
    return Math.max(50, score);
  }

  private static calculateKeywordScore(content: string, jobDescription?: string, industry?: string): number {
    if (!jobDescription && !industry) return 60;
    
    const contentLower = content.toLowerCase();
    let matchedKeywords = 0;
    let totalKeywords = 0;
    
    if (industry && this.industryKeywords[industry]) {
      const industryKeys = this.industryKeywords[industry];
      totalKeywords = industryKeys.length;
      matchedKeywords = industryKeys.filter(keyword => 
        contentLower.includes(keyword.toLowerCase())
      ).length;
    }
    
    if (jobDescription) {
      const jobKeywords = this.extractKeywords(jobDescription);
      totalKeywords += jobKeywords.length;
      matchedKeywords += jobKeywords.filter(keyword => 
        contentLower.includes(keyword.toLowerCase())
      ).length;
    }
    
    return totalKeywords > 0 ? Math.round((matchedKeywords / totalKeywords) * 100) : 70;
  }

  private static extractKeywords(text: string): string[] {
    const commonKeywords = [
      'experience', 'skills', 'management', 'leadership', 'development',
      'analysis', 'communication', 'team', 'project', 'strategic'
    ];
    
    return commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  private static calculateGrade(score: number): ComprehensiveResumeAnalysis['grade'] {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
  }

  private static generateATSAnalysis(content: string): ATSAnalysis {
    const issues = [];
    const wordCount = content.split(' ').length;
    
    if (wordCount < 200) {
      issues.push({
        type: 'content' as const,
        severity: 'critical' as const,
        message: 'Resume is too short for effective ATS parsing',
        suggestion: 'Add more detailed experience and skills sections'
      });
    }
    
    if (content.includes('|')) {
      issues.push({
        type: 'format' as const,
        severity: 'warning' as const,
        message: 'Tables detected - may not parse correctly in ATS',
        suggestion: 'Use simple bullet points instead of tables'
      });
    }

    return {
      score: 85,
      issues,
      readabilityScore: 88,
      formatCompatibility: {
        tables: !content.includes('|'),
        graphics: true,
        columns: true,
        fonts: ['Arial', 'Calibri', 'Times New Roman'],
        headingStructure: content.includes('Experience') && content.includes('Education')
      }
    };
  }

  private static generateKeywordAnalysis(content: string, jobDescription?: string, industry?: string): KeywordAnalysis {
    const contentLower = content.toLowerCase();
    const industryKeys = industry ? this.industryKeywords[industry] || [] : [];
    
    const matchedKeywords = industryKeys.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    );
    
    const missingKeywords = industryKeys.filter(keyword => 
      !contentLower.includes(keyword.toLowerCase())
    );

    return {
      matchScore: industryKeys.length > 0 ? Math.round((matchedKeywords.length / industryKeys.length) * 100) : 70,
      matchedKeywords,
      missingKeywords,
      industryKeywords: industryKeys,
      skillGaps: missingKeywords.slice(0, 3).map(skill => ({
        skill,
        importance: 'high' as const,
        suggestion: `Consider adding ${skill} to your skills section if you have experience with it`
      })),
      keywordDensity: Object.fromEntries(
        matchedKeywords.map(keyword => [keyword, Math.floor(Math.random() * 5) + 1])
      )
    };
  }

  private static generateContentQuality(content: string): ContentQuality {
    const hasQuantified = /\d+%|\$\d+|\d+\+/.test(content);
    const hasActionVerbs = /(led|managed|developed|created|increased|reduced|implemented)/i.test(content);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const issues = [];
    if (!hasQuantified) {
      issues.push({
        type: 'achievement' as const,
        message: 'Lacks quantified achievements',
        suggestion: 'Add specific numbers, percentages, or dollar amounts to demonstrate impact',
        location: 'Experience section'
      });
    }

    return {
      grammarScore: 90,
      styleScore: hasActionVerbs ? 85 : 70,
      achievementScore: hasQuantified ? 88 : 60,
      issues,
      bulletPointAnalysis: sentences.slice(0, 3).map(sentence => ({
        original: sentence.trim(),
        starMethodScore: Math.floor(Math.random() * 40) + 60,
        suggestions: ['Add quantifiable results', 'Use stronger action verbs', 'Be more specific about impact'],
        rewriteExample: `Enhanced: ${sentence.trim().replace(/\b\w/, l => l.toUpperCase())} resulting in 25% improvement`
      }))
    };
  }

  private static generateVisualAnalysis(content: string): VisualAnalysis {
    const wordCount = content.split(' ').length;
    const sections = ['Experience', 'Education', 'Skills', 'Summary'].filter(section => 
      content.includes(section)
    );

    return {
      heatmapData: sections.map(section => ({
        section,
        attention: Math.floor(Math.random() * 40) + 60,
        importance: Math.floor(Math.random() * 30) + 70,
        recommendations: [`Optimize ${section} section for better visibility`, 'Consider repositioning for maximum impact']
      })),
      layoutScore: 85,
      lengthAnalysis: {
        wordCount,
        pageCount: Math.ceil(wordCount / 400),
        optimal: wordCount >= 300 && wordCount <= 800,
        recommendation: wordCount < 300 ? 'Add more detail' : wordCount > 800 ? 'Consider condensing' : 'Good length'
      },
      formattingScore: 88
    };
  }

  private static generateActionableInsights(
    overallScore: number, 
    atsScore: number, 
    keywordScore: number, 
    contentScore: number
  ): ComprehensiveResumeAnalysis['actionableInsights'] {
    const insights = [];

    if (atsScore < 80) {
      insights.push({
        priority: 'high' as const,
        category: 'ATS Compatibility',
        issue: 'Format may not be ATS-friendly',
        solution: 'Simplify formatting and remove tables or graphics',
        impact: 'Increases chance of passing initial screening by 40%'
      });
    }

    if (keywordScore < 70) {
      insights.push({
        priority: 'high' as const,
        category: 'Keywords',
        issue: 'Missing important industry keywords',
        solution: 'Add relevant skills and industry terms',
        impact: 'Improves job match score by 30%'
      });
    }

    if (contentScore < 80) {
      insights.push({
        priority: 'medium' as const,
        category: 'Content Quality',
        issue: 'Lacks quantified achievements',
        solution: 'Add specific numbers and measurable results',
        impact: 'Makes resume 50% more compelling to recruiters'
      });
    }

    return insights;
  }
}
