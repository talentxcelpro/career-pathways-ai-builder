
import { useState, useCallback } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface GrammarIssue {
  id: string;
  type: 'grammar' | 'spelling' | 'style';
  text: string;
  suggestion: string;
  position: { start: number; end: number };
  severity: 'error' | 'warning' | 'suggestion';
}

interface ContentSuggestion {
  id: string;
  type: 'improvement' | 'addition' | 'replacement';
  section: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  originalText?: string;
  suggestedText?: string;
}

export const useContentIntelligence = (resumeData: EnhancedResumeData | null) => {
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<Record<string, ContentSuggestion[]>>({});
  const [industryKeywords, setIndustryKeywords] = useState<string[]>([]);

  const runContentAnalysis = useCallback(async () => {
    if (!resumeData) return;

    // Simulate content analysis - in real implementation, this would call AI service
    const mockGrammarIssues: GrammarIssue[] = [];
    const mockSuggestions: Record<string, ContentSuggestion[]> = {};
    const mockKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker',
      'Kubernetes', 'Agile', 'Scrum', 'CI/CD', 'Git', 'REST API',
      'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Microservices'
    ];

    // Analyze summary for issues
    if (resumeData.personalInfo.summary) {
      const summary = resumeData.personalInfo.summary;
      
      if (summary.length < 50) {
        mockSuggestions.personalInfo = mockSuggestions.personalInfo || [];
        mockSuggestions.personalInfo.push({
          id: 'summary-length',
          type: 'improvement',
          section: 'Professional Summary',
          title: 'Expand your summary',
          description: 'Your summary is too brief. Aim for 2-3 sentences highlighting your key strengths.',
          impact: 'medium'
        });
      }

      if (!summary.includes('years')) {
        mockSuggestions.personalInfo = mockSuggestions.personalInfo || [];
        mockSuggestions.personalInfo.push({
          id: 'experience-mention',
          type: 'addition',
          section: 'Professional Summary',
          title: 'Mention your experience',
          description: 'Include years of experience to give context to your expertise.',
          impact: 'high'
        });
      }
    }

    // Analyze experience section
    resumeData.experience.forEach((exp, index) => {
      if (!exp.achievements || exp.achievements.length === 0) {
        mockSuggestions.experience = mockSuggestions.experience || [];
        mockSuggestions.experience.push({
          id: `exp-achievements-${index}`,
          type: 'addition',
          section: 'Experience',
          title: 'Add quantified achievements',
          description: `Add specific achievements with numbers and metrics for ${exp.title} role.`,
          impact: 'high'
        });
      }

      if (exp.description.length < 100) {
        mockSuggestions.experience = mockSuggestions.experience || [];
        mockSuggestions.experience.push({
          id: `exp-description-${index}`,
          type: 'improvement',
          section: 'Experience',
          title: 'Expand job description',
          description: `Provide more detailed description of your responsibilities and impact.`,
          impact: 'medium'
        });
      }
    });

    // Check for grammar issues
    const textToCheck = [
      resumeData.personalInfo.summary,
      ...resumeData.experience.map(exp => exp.description)
    ].filter(Boolean).join(' ');

    if (textToCheck.includes('recieve')) {
      mockGrammarIssues.push({
        id: 'spelling-receive',
        type: 'spelling',
        text: 'recieve',
        suggestion: 'receive',
        position: { start: 0, end: 7 },
        severity: 'error'
      });
    }

    setGrammarIssues(mockGrammarIssues);
    setContentSuggestions(mockSuggestions);
    setIndustryKeywords(mockKeywords);
  }, [resumeData]);

  return {
    grammarIssues,
    contentSuggestions,
    industryKeywords,
    runContentAnalysis
  };
};
