import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ATSAnalysis {
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
    recommendations: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  competitiveAnalysis: {
    industryStandard: number;
    positionVsMarket: string;
    improvementPotential: number;
  };
}

export interface JobSpecificOptimization {
  optimizedContent: any;
  changes: Array<{
    section: string;
    original: string;
    optimized: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  matchScore: number;
  keywordAlignment: {
    before: number;
    after: number;
    improvement: number;
  };
  industryAlignment: {
    score: number;
    recommendations: string[];
  };
}

export interface ResumePerformanceAnalytics {
  views: number;
  downloads: number;
  applications: number;
  responseRate: number;
  industryBenchmark: {
    avgViews: number;
    avgResponseRate: number;
    ranking: string;
  };
  improvementSuggestions: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    expectedImpact: string;
  }>;
  trendAnalysis: {
    viewTrend: 'increasing' | 'decreasing' | 'stable';
    seasonalFactors: string[];
    bestPerformingDays: string[];
  };
}

export const useAdvancedAIFeatures = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingAnalytics, setIsGeneratingAnalytics] = useState(false);

  const performAdvancedATSAnalysis = useCallback(async (
    resumeContent: any,
    jobDescription?: string,
    targetRole?: string,
    industry?: string
  ): Promise<ATSAnalysis | null> => {
    setIsAnalyzing(true);
    
    try {
      console.log('Performing advanced ATS analysis...');
      
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          toolSlug: 'ats-optimizer',
          inputData: {
            resumeContent,
            jobDescription,
            targetRole,
            industry
          },
          requestMetadata: {
            category: 'resume',
            operation: 'advanced_ats_analysis'
          }
        }
      });

      if (error) {
        console.error('ATS analysis error:', error);
        throw new Error(`ATS analysis failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'ATS analysis unsuccessful');
      }

      toast.success('Advanced ATS analysis completed!');
      return data.data;

    } catch (error) {
      console.error('ATS analysis failed:', error);
      toast.error(`Failed to analyze resume: ${error.message}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const optimizeForSpecificJob = useCallback(async (
    resumeContent: any,
    jobDescription: string,
    targetRole: string,
    industry: string,
    optimizationLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  ): Promise<JobSpecificOptimization | null> => {
    setIsOptimizing(true);
    
    try {
      console.log('Optimizing resume for specific job...');
      
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          toolSlug: 'job-matcher',
          inputData: {
            resumeContent,
            jobDescription,
            targetRole,
            industry,
            optimizationLevel
          },
          requestMetadata: {
            category: 'jobs',
            operation: 'job_specific_optimization'
          }
        }
      });

      if (error) {
        console.error('Job optimization error:', error);
        throw new Error(`Job optimization failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Job optimization unsuccessful');
      }

      toast.success('Resume optimized for target job!');
      return data.data;

    } catch (error) {
      console.error('Job optimization failed:', error);
      toast.error(`Failed to optimize resume: ${error.message}`);
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const generatePerformanceAnalytics = useCallback(async (
    resumeId: string,
    timeframe: '30d' | '90d' | '1y' = '30d'
  ): Promise<ResumePerformanceAnalytics | null> => {
    setIsGeneratingAnalytics(true);
    
    try {
      console.log('Generating performance analytics...');
      
      // Get resume analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('resume_analytics')
        .select('*')
        .eq('resume_id', resumeId)
        .gte('created_at', new Date(Date.now() - (timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000).toISOString());

      if (analyticsError) throw analyticsError;

      const { data, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          operation: 'performance_analytics',
          resumeId,
          analyticsData,
          timeframe
        }
      });

      if (error) {
        console.error('Analytics generation error:', error);
        throw new Error(`Analytics generation failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analytics generation unsuccessful');
      }

      toast.success('Performance analytics generated!');
      return data.analytics;

    } catch (error) {
      console.error('Analytics generation failed:', error);
      toast.error(`Failed to generate analytics: ${error.message}`);
      return null;
    } finally {
      setIsGeneratingAnalytics(false);
    }
  }, []);

  const generateIntelligentSuggestions = useCallback(async (
    resumeContent: any,
    userProfile: any,
    marketTrends?: any
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-comprehensive', {
        body: {
          operation: 'intelligent_suggestions',
          resumeContent,
          userProfile,
          marketTrends
        }
      });

      if (error) throw error;
      return data.suggestions;
    } catch (error) {
      console.error('Intelligent suggestions failed:', error);
      toast.error('Failed to generate suggestions');
      return null;
    }
  }, []);

  return {
    // Advanced ATS Analysis
    performAdvancedATSAnalysis,
    isAnalyzing,
    
    // Job-Specific Optimization
    optimizeForSpecificJob,
    isOptimizing,
    
    // Performance Analytics
    generatePerformanceAnalytics,
    isGeneratingAnalytics,
    
    // Intelligent Suggestions
    generateIntelligentSuggestions,
  };
};