
import { useState, useCallback } from 'react';
import { EnhancedResumeData } from '@/types/enhanced-resume';

interface ResumeAnalytics {
  overallScore: number;
  atsScore: number;
  suggestions: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export const useResumeAnalytics = (resumeData: EnhancedResumeData | null) => {
  const [analytics, setAnalytics] = useState<ResumeAnalytics>({
    overallScore: 0,
    atsScore: 0,
    suggestions: []
  });

  const refreshAnalysis = useCallback(async () => {
    if (!resumeData) return;

    // Simulate analysis - in real implementation, this would call AI service
    let overallScore = 0;
    let atsScore = 0;
    const suggestions: any[] = [];

    // Calculate scores based on resume completeness
    if (resumeData.personalInfo.fullName) overallScore += 10;
    if (resumeData.personalInfo.email) overallScore += 10;
    if (resumeData.personalInfo.phone) overallScore += 5;
    if (resumeData.personalInfo.summary) overallScore += 15;
    if (resumeData.experience.length > 0) overallScore += 25;
    if (resumeData.education.length > 0) overallScore += 15;
    if (resumeData.skills.length > 0) overallScore += 20;

    // ATS Score calculation
    atsScore = overallScore;
    if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.length > 100) atsScore += 5;
    if (resumeData.skills.length >= 5) atsScore += 5;
    if (resumeData.experience.some(exp => exp.achievements.length > 0)) atsScore += 5;

    // Generate suggestions
    if (!resumeData.personalInfo.summary) {
      suggestions.push({
        id: 'add-summary',
        type: 'content',
        title: 'Add Professional Summary',
        description: 'A compelling summary can increase your chances by 30%',
        impact: 'high'
      });
    }

    if (resumeData.skills.length < 5) {
      suggestions.push({
        id: 'add-skills',
        type: 'skills',
        title: 'Add More Skills',
        description: 'Include at least 5-8 relevant skills for better visibility',
        impact: 'medium'
      });
    }

    if (resumeData.experience.length === 0) {
      suggestions.push({
        id: 'add-experience',
        type: 'experience',
        title: 'Add Work Experience',
        description: 'Include your professional experience to strengthen your profile',
        impact: 'high'
      });
    }

    setAnalytics({
      overallScore: Math.min(overallScore, 100),
      atsScore: Math.min(atsScore, 100),
      suggestions
    });
  }, [resumeData]);

  return {
    ...analytics,
    refreshAnalysis
  };
};
