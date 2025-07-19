import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIServiceOptions {
  toolSlug: string;
  inputData: any;
  priority?: number;
  category?: string;
}

export interface AIServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
  cost?: number;
  tokensUsed?: number;
  responseTime?: number;
}

export const useAIService = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  const invokeAITool = useCallback(async (options: AIServiceOptions): Promise<AIServiceResponse> => {
    setIsProcessing(true);
    setCurrentOperation(options.toolSlug);

    try {
      console.log(`Invoking AI tool: ${options.toolSlug}`, options);

      // Get the AI tool configuration and admin inputs
      const { data: toolConfig, error: configError } = await supabase
        .from('ai_tools_config')
        .select('*')
        .eq('tool_slug', options.toolSlug)
        .eq('is_enabled', true)
        .single();

      if (configError || !toolConfig) {
        throw new Error(`AI tool ${options.toolSlug} not found or disabled`);
      }

      // Get admin inputs for this tool
      const { data: adminInputs, error: inputsError } = await supabase
        .from('ai_admin_inputs')
        .select('*')
        .eq('tool_slug', options.toolSlug)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (inputsError) {
        console.warn('Failed to fetch admin inputs:', inputsError);
      }

      // Invoke the unified AI gateway
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          toolSlug: options.toolSlug,
          inputData: options.inputData,
          toolConfig,
          adminInputs: adminInputs || [],
          requestMetadata: {
            category: options.category,
            priority: options.priority || 0,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        throw new Error(`AI service error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'AI processing failed');
      }

      // Log successful usage
      await supabase.from('ai_usage_logs').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        tool_slug: options.toolSlug,
        feature_type: options.category || 'general',
        request_type: 'ai_tool_invocation',
        request_data: options.inputData,
        response_data: data.data,
        success: true,
        tokens_used: data.tokensUsed || 0,
        cost_estimate: data.cost || 0,
        response_time: data.responseTime || 0
      });

      return {
        success: true,
        data: data.data,
        cost: data.cost,
        tokensUsed: data.tokensUsed,
        responseTime: data.responseTime
      };

    } catch (error: any) {
      console.error(`AI tool ${options.toolSlug} failed:`, error);
      
      // Log failed usage
      try {
        await supabase.from('ai_usage_logs').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          tool_slug: options.toolSlug,
          feature_type: options.category || 'general',
          request_type: 'ai_tool_invocation',
          request_data: options.inputData,
          success: false,
          error_message: error.message
        });
      } catch (logError) {
        console.warn('Failed to log AI usage:', logError);
      }

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, []);

  const enhanceResume = useCallback(async (resumeContent: any, options: {
    sectionType?: 'summary' | 'experience' | 'skills' | 'education' | 'all';
    enhancementType?: 'professional' | 'achievements' | 'ats' | 'general';
  } = {}) => {
    const result = await invokeAITool({
      toolSlug: 'resume-enhancer',
      inputData: { ...resumeContent, ...options },
      category: 'resume'
    });

    if (result.success) {
      toast.success('Resume enhanced successfully!');
    } else {
      toast.error(result.error || 'Failed to enhance resume');
    }

    return result;
  }, [invokeAITool]);

  const optimizeForATS = useCallback(async (resumeContent: any, jobDescription?: string) => {
    const result = await invokeAITool({
      toolSlug: 'ats-optimizer',
      inputData: { resumeContent, jobDescription },
      category: 'resume'
    });

    if (result.success) {
      toast.success('Resume optimized for ATS!');
    } else {
      toast.error(result.error || 'Failed to optimize resume');
    }

    return result;
  }, [invokeAITool]);

  const generateCoverLetter = useCallback(async (resumeContent: any, jobData: any) => {
    const result = await invokeAITool({
      toolSlug: 'cover-letter-generator',
      inputData: { resumeContent, jobData },
      category: 'cover_letter'
    });

    if (result.success) {
      toast.success('Cover letter generated!');
    } else {
      toast.error(result.error || 'Failed to generate cover letter');
    }

    return result;
  }, [invokeAITool]);

  const analyzeCareerPath = useCallback(async (userProfile: any, targetRole?: string) => {
    const result = await invokeAITool({
      toolSlug: 'career-advisor',
      inputData: { userProfile, targetRole },
      category: 'career'
    });

    if (result.success) {
      toast.success('Career analysis completed!');
    } else {
      toast.error(result.error || 'Failed to analyze career path');
    }

    return result;
  }, [invokeAITool]);

  const prepareForInterview = useCallback(async (jobData: any, userProfile: any) => {
    const result = await invokeAITool({
      toolSlug: 'interview-prep',
      inputData: { jobData, userProfile },
      category: 'interview'
    });

    if (result.success) {
      toast.success('Interview preparation ready!');
    } else {
      toast.error(result.error || 'Failed to prepare interview materials');
    }

    return result;
  }, [invokeAITool]);

  const analyzeSalary = useCallback(async (role: string, location: string, experience: number) => {
    const result = await invokeAITool({
      toolSlug: 'salary-analyzer',
      inputData: { role, location, experience },
      category: 'salary'
    });

    if (result.success) {
      toast.success('Salary analysis completed!');
    } else {
      toast.error(result.error || 'Failed to analyze salary data');
    }

    return result;
  }, [invokeAITool]);

  return {
    // Core AI service
    invokeAITool,
    isProcessing,
    currentOperation,

    // Specific AI tools
    enhanceResume,
    optimizeForATS,
    generateCoverLetter,
    analyzeCareerPath,
    prepareForInterview,
    analyzeSalary
  };
};