import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAIRateLimit } from '@/hooks/useAIRateLimit';
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
  const rateLimit = useAIRateLimit('ai_tools');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  const invokeAITool = useCallback(async (options: AIServiceOptions): Promise<AIServiceResponse> => {
    // Check rate limit before processing
    if (!rateLimit.canMakeRequest()) {
      const timeUntilReset = Math.ceil(rateLimit.getTimeUntilReset() / (1000 * 60));
      toast.error(`Rate limit exceeded. Try again in ${timeUntilReset} minutes.`);
      return {
        success: false,
        error: 'Rate limit exceeded'
      };
    }

    setIsProcessing(true);
    setCurrentOperation(options.toolSlug);

    try {
      // Record the request for rate limiting
      rateLimit.recordRequest();
      
      console.log(`🚀 Invoking AI tool: ${options.toolSlug}`, options);

      // Direct HTTP call to the edge function
      const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/ai-gateway`;
      
      console.log('📨 Making direct HTTP call to:', functionUrl);

      const requestBody = {
        toolSlug: options.toolSlug,
        inputData: options.inputData,
        requestMetadata: {
          category: options.category,
          priority: options.priority || 0,
          timestamp: new Date().toISOString()
        }
      };

      console.log('📋 Request body:', requestBody);

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📦 Response status:', response.status);
      console.log('📦 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 AI Gateway response:', data);

      if (!data) {
        throw new Error('No data received from AI Gateway');
      }

      if (!data.success) {
        throw new Error(data.error || 'AI processing failed');
      }

      // Log successful usage
      try {
        const user = await supabase.auth.getUser();
        await supabase.from('ai_usage_logs').insert({
          user_id: user.data.user?.id,
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
      } catch (logError) {
        console.warn('⚠️ Failed to log AI usage:', logError);
      }

      return {
        success: true,
        data: data.data,
        cost: data.cost,
        tokensUsed: data.tokensUsed,
        responseTime: data.responseTime
      };

    } catch (error: any) {
      console.error(`❌ AI tool ${options.toolSlug} failed:`, error);
      
      // Log failed usage
      try {
        const user = await supabase.auth.getUser();
        await supabase.from('ai_usage_logs').insert({
          user_id: user.data.user?.id,
          tool_slug: options.toolSlug,
          feature_type: options.category || 'general',
          request_type: 'ai_tool_invocation',
          request_data: options.inputData,
          success: false,
          error_message: error.message
        });
      } catch (logError) {
        console.warn('⚠️ Failed to log AI usage:', logError);
      }

      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsProcessing(false);
      setCurrentOperation(null);
    }
  }, [rateLimit]);

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
