import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SmartTitleSuggestion {
  title: string;
  reasoning: string;
  atsScore: number;
  keywords: string[];
}

export interface ToneAdjustmentResult {
  adjustedContent: string;
  changes: Array<{
    original: string;
    adjusted: string;
    reason: string;
  }>;
  tone: string;
  impactScore: number;
  suggestions: string[];
}

export interface KeywordOptimization {
  atsScore: number;
  keywordAnalysis: {
    matched: string[];
    missing: string[];
    density: number;
    distribution: string;
  };
  recommendations: Array<{
    keyword: string;
    priority: string;
    suggestion: string;
    naturalIntegration: string;
    section: string;
  }>;
  optimizedSections: {
    summary?: string;
    skills?: string;
    experience?: string;
  };
  industryKeywords: {
    technical: string[];
    soft: string[];
    industry: string[];
  };
  improvementTips: string[];
}

export const useAIResumeEnhancements = () => {
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isAdjustingTone, setIsAdjustingTone] = useState(false);
  const [isOptimizingKeywords, setIsOptimizingKeywords] = useState(false);

  const generateSmartTitles = async (
    resumeData: any,
    targetRole?: string,
    industry?: string,
    experience?: string
  ): Promise<{
    titles: SmartTitleSuggestion[];
    recommendations: {
      bestTitle: string;
      alternatives: string[];
      tips: string[];
    };
  } | null> => {
    setIsGeneratingTitles(true);
    
    try {
      console.log('Generating smart resume titles...');
      
      const { data, error } = await supabase.functions.invoke('ai-resume-title-generator', {
        body: {
          resumeData,
          targetRole,
          industry,
          experience
        }
      });

      if (error) {
        console.error('Smart title generation error:', error);
        throw new Error(`Title generation failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Title generation unsuccessful');
      }

      toast.success('Smart resume titles generated successfully!');
      return {
        titles: data.titles,
        recommendations: data.recommendations
      };

    } catch (error) {
      console.error('Smart title generation failed:', error);
      toast.error(`Failed to generate titles: ${error.message}`);
      return null;
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const adjustTone = async (
    content: string,
    targetTone: string,
    sectionType: string,
    context?: string
  ): Promise<ToneAdjustmentResult | null> => {
    setIsAdjustingTone(true);
    
    try {
      console.log('Adjusting tone for:', sectionType, 'to', targetTone);
      
      const { data, error } = await supabase.functions.invoke('ai-tone-adjuster', {
        body: {
          content,
          targetTone,
          sectionType,
          context
        }
      });

      if (error) {
        console.error('Tone adjustment error:', error);
        throw new Error(`Tone adjustment failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Tone adjustment unsuccessful');
      }

      toast.success(`Content tone adjusted to ${targetTone}!`);
      return {
        adjustedContent: data.adjustedContent,
        changes: data.changes,
        tone: data.tone,
        impactScore: data.impactScore,
        suggestions: data.suggestions
      };

    } catch (error) {
      console.error('Tone adjustment failed:', error);
      toast.error(`Failed to adjust tone: ${error.message}`);
      return null;
    } finally {
      setIsAdjustingTone(false);
    }
  };

  const optimizeKeywords = async (
    resumeContent: any,
    jobDescription?: string,
    targetRole?: string,
    industry?: string
  ): Promise<KeywordOptimization | null> => {
    setIsOptimizingKeywords(true);
    
    try {
      console.log('Optimizing keywords for ATS...');
      
      const { data, error } = await supabase.functions.invoke('ai-keyword-optimizer', {
        body: {
          resumeContent,
          jobDescription,
          targetRole,
          industry
        }
      });

      if (error) {
        console.error('Keyword optimization error:', error);
        throw new Error(`Keyword optimization failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Keyword optimization unsuccessful');
      }

      toast.success('Keywords optimized for ATS compatibility!');
      return {
        atsScore: data.atsScore,
        keywordAnalysis: data.keywordAnalysis,
        recommendations: data.recommendations,
        optimizedSections: data.optimizedSections,
        industryKeywords: data.industryKeywords,
        improvementTips: data.improvementTips
      };

    } catch (error) {
      console.error('Keyword optimization failed:', error);
      toast.error(`Failed to optimize keywords: ${error.message}`);
      return null;
    } finally {
      setIsOptimizingKeywords(false);
    }
  };

  return {
    // Title Generation
    generateSmartTitles,
    isGeneratingTitles,
    
    // Tone Adjustment
    adjustTone,
    isAdjustingTone,
    
    // Keyword Optimization
    optimizeKeywords,
    isOptimizingKeywords,
  };
};