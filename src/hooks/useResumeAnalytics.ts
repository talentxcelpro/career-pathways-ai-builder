
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

interface ResumeMetrics {
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  applicationRate: number;
  interviewRate: number;
  weeklyTrend: Array<{ date: string; views: number; downloads: number }>;
  topSources: Array<{ source: string; count: number }>;
}

interface ResumeEvent {
  event_type: string;
  source?: string;
  created_at: string;
}

export const useResumeAnalytics = (resumeData: EnhancedResumeData | null | string) => {
  const [analytics, setAnalytics] = useState<ResumeAnalytics>({
    overallScore: 0,
    atsScore: 0,
    suggestions: []
  });

  const [metrics, setMetrics] = useState<ResumeMetrics>({
    totalViews: 0,
    totalDownloads: 0,
    totalShares: 0,
    applicationRate: 0,
    interviewRate: 0,
    weeklyTrend: [],
    topSources: []
  });

  const [events, setEvents] = useState<ResumeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAnalysis = useCallback(async () => {
    if (!resumeData || typeof resumeData === 'string') return;
    
    setIsLoading(true);

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

    // Mock metrics data
    const mockMetrics: ResumeMetrics = {
      totalViews: Math.floor(Math.random() * 500) + 100,
      totalDownloads: Math.floor(Math.random() * 100) + 20,
      totalShares: Math.floor(Math.random() * 50) + 5,
      applicationRate: Math.random() * 10 + 2,
      interviewRate: Math.random() * 20 + 5,
      weeklyTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10,
        downloads: Math.floor(Math.random() * 20) + 2
      })),
      topSources: [
        { source: 'LinkedIn', count: 45 },
        { source: 'Indeed', count: 32 },
        { source: 'Direct', count: 28 },
        { source: 'Glassdoor', count: 15 }
      ]
    };

    const mockEvents: ResumeEvent[] = [
      { event_type: 'viewed', source: 'LinkedIn', created_at: new Date().toISOString() },
      { event_type: 'downloaded', source: 'Indeed', created_at: new Date(Date.now() - 86400000).toISOString() },
      { event_type: 'shared', created_at: new Date(Date.now() - 172800000).toISOString() }
    ];

    setAnalytics({
      overallScore: Math.min(overallScore, 100),
      atsScore: Math.min(atsScore, 100),
      suggestions
    });

    setMetrics(mockMetrics);
    setEvents(mockEvents);
    setIsLoading(false);
  }, [resumeData]);

  return {
    ...analytics,
    metrics,
    events,
    isLoading,
    refreshAnalysis
  };
};
