import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ComprehensiveATSAnalysis {
  overallScore: number;
  sections: {
    contact: { score: number; issues: string[]; suggestions: string[] };
    summary: { score: number; issues: string[]; suggestions: string[] };
    experience: { score: number; issues: string[]; suggestions: string[] };
    education: { score: number; issues: string[]; suggestions: string[] };
    skills: { score: number; issues: string[]; suggestions: string[] };
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
    strengths: string[];
  };
  competitiveAnalysis: {
    industryStandard: number;
    ranking: string;
    improvementAreas: string[];
  };
  actionableSteps: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    impact: string;
    section: string;
  }>;
}

export const useComprehensiveATS = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ComprehensiveATSAnalysis | null>(null);

  const analyzeResume = useCallback(async (
    resumeData: any,
    options?: {
      jobDescription?: string;
      targetRole?: string;
      industry?: string;
    }
  ) => {
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('comprehensive-ats-analyzer', {
        body: {
          resumeData,
          jobDescription: options?.jobDescription,
          targetRole: options?.targetRole,
          industry: options?.industry
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Analysis failed');

      setAnalysis(data.analysis);
      
      if (data.analysis.overallScore >= 80) {
        toast.success(`Excellent ATS score: ${data.analysis.overallScore}/100`);
      } else if (data.analysis.overallScore >= 60) {
        toast.info(`Good ATS score: ${data.analysis.overallScore}/100. Check suggestions for improvements.`);
      } else {
        toast.warning(`ATS score: ${data.analysis.overallScore}/100. Important improvements needed.`);
      }

      return data.analysis;
    } catch (error) {
      console.error('Comprehensive ATS analysis error:', error);
      toast.error('Failed to analyze resume');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getSectionScore = useCallback((section: keyof ComprehensiveATSAnalysis['sections']) => {
    return analysis?.sections[section]?.score || 0;
  }, [analysis]);

  const getCriticalIssues = useCallback(() => {
    if (!analysis) return [];
    return analysis.actionableSteps.filter(step => step.priority === 'critical');
  }, [analysis]);

  return {
    analyzeResume,
    analysis,
    isAnalyzing,
    getSectionScore,
    getCriticalIssues
  };
};
