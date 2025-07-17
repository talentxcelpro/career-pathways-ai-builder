
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
      console.log('Starting title generation with data:', { resumeData, targetRole, industry, experience });
      
      // Validate input data
      if (!resumeData || typeof resumeData !== 'object') {
        console.warn('Invalid resume data provided, using fallback');
        const fallbackResult = {
          titles: [
            {
              title: "Professional " + (targetRole || "Specialist"),
              reasoning: "Generic professional title suitable for most roles",
              atsScore: 75,
              keywords: ["professional", targetRole || "specialist"].filter(Boolean)
            }
          ],
          recommendations: {
            bestTitle: "Professional " + (targetRole || "Specialist"),
            alternatives: ["Experienced Professional", "Skilled Professional"],
            tips: ["Add more specific skills to improve title suggestions"]
          }
        };
        setIsGeneratingTitles(false);
        return fallbackResult;
      }

      const { data, error } = await supabase.functions.invoke('ai-resume-title-generator', {
        body: {
          resumeData,
          targetRole,
          industry,
          experience
        }
      });

      if (error) {
        console.error('Title generation error:', error);
        throw new Error(`Title generation failed: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('Title generation unsuccessful:', data);
        throw new Error(data?.error || 'Title generation unsuccessful');
      }

      console.log('Title generation successful:', data);
      toast.success('Smart resume titles generated successfully!');
      
      return {
        titles: data.titles || [],
        recommendations: data.recommendations || {
          bestTitle: "Professional",
          alternatives: [],
          tips: []
        }
      };

    } catch (error) {
      console.error('Title generation failed:', error);
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
      
      // Validate input
      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content provided for tone adjustment');
      }

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
        // Return a fallback response instead of throwing
        return {
          adjustedContent: content,
          changes: [],
          tone: targetTone,
          impactScore: 70,
          suggestions: ['Tone adjustment service is temporarily unavailable. Please try again in a few moments.']
        };
      }

      // Handle both successful and fallback responses
      if (data) {
        if (data.success === false) {
          // Service returned a fallback response
          console.warn('Tone adjustment returned fallback:', data.error);
          return {
            adjustedContent: data.adjustedContent || content,
            changes: data.changes || [],
            tone: data.tone || targetTone,
            impactScore: data.impactScore || 70,
            suggestions: data.suggestions || ['Service temporarily unavailable']
          };
        }
        
        // Successful response
        toast.success(`Content tone adjusted to ${targetTone}!`);
        return {
          adjustedContent: data.adjustedContent,
          changes: data.changes || [],
          tone: data.tone,
          impactScore: data.impactScore || 0,
          suggestions: data.suggestions || []
        };
      }

      // No data returned
      return {
        adjustedContent: content,
        changes: [],
        tone: targetTone,
        impactScore: 70,
        suggestions: ['No response from tone adjustment service']
      };

    } catch (error) {
      console.error('Tone adjustment failed:', error);
      
      // Return fallback instead of null
      return {
        adjustedContent: content,
        changes: [],
        tone: targetTone,
        impactScore: 70,
        suggestions: ['Tone adjustment is temporarily unavailable. Please try again later.']
      };
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
      console.log('Starting keyword optimization with data:', { 
        resumeContent: resumeContent ? 'present' : 'null', 
        jobDescription: jobDescription ? 'present' : 'null',
        targetRole, 
        industry 
      });
      
      // Validate input data
      if (!resumeContent) {
        console.warn('No resume content provided for keyword optimization');
        const fallbackResult: KeywordOptimization = {
          atsScore: 60,
          keywordAnalysis: {
            matched: [],
            missing: ["professional", "experience", "skills"],
            density: 0,
            distribution: "low"
          },
          recommendations: [
            {
              keyword: "professional",
              priority: "high",
              suggestion: "Add professional experience details",
              naturalIntegration: "Include in summary section",
              section: "summary"
            }
          ],
          optimizedSections: {
            summary: "Please add resume content to get personalized optimization suggestions.",
            skills: "Upload or create your resume to optimize keywords",
            experience: "Resume data needed for experience optimization"
          },
          industryKeywords: {
            technical: ["software", "development", "programming"],
            soft: ["communication", "teamwork", "leadership"],
            industry: ["technology", "business", "professional"]
          },
          improvementTips: [
            "Upload your resume to get personalized keyword suggestions",
            "Include specific skills and technologies you've worked with",
            "Add measurable achievements and results"
          ]
        };
        
        toast.success('Keyword optimization completed with default suggestions!');
        return fallbackResult;
      }

      const requestBody = {
        resumeContent,
        jobDescription,
        targetRole,
        industry
      };

      console.log('Making request to ai-keyword-optimizer with body:', requestBody);

      const { data, error } = await supabase.functions.invoke('ai-keyword-optimizer', {
        body: requestBody
      });

      if (error) {
        console.error('Keyword optimization error:', error);
        throw new Error(`Keyword optimization failed: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('Keyword optimization unsuccessful:', data);
        throw new Error(data?.error || 'Keyword optimization unsuccessful');
      }

      console.log('Keyword optimization successful:', data);
      toast.success('Keywords optimized for ATS compatibility!');
      
      return {
        atsScore: data.atsScore || 60,
        keywordAnalysis: data.keywordAnalysis || {
          matched: [],
          missing: [],
          density: 0,
          distribution: "low"
        },
        recommendations: data.recommendations || [],
        optimizedSections: data.optimizedSections || {},
        industryKeywords: data.industryKeywords || {
          technical: [],
          soft: [],
          industry: []
        },
        improvementTips: data.improvementTips || []
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
