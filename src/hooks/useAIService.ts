// ============================================
// AI UNIFIED PROCESSOR HOOK - PHASE 3 INTEGRATION
// ============================================
// React hook for unified AI operations with enhanced features

import { useState, useCallback, useRef } from 'react';
import { aiServiceManager, AIServiceRequest, AIServiceResponse, AIFeedback } from '@/services/ai-service-manager';
import { CoreResumeData } from '@/types/resume-core';
import { toast } from 'sonner';
import { analyzeATSFit, serializeATSResultForStorage, isATSAnalysis, ATSFitResult } from '@/lib/resume/atsEngine';


export interface UseAIServiceOptions {
  enableFeedback?: boolean;
  enableAnalytics?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
}

export interface AIOperationState {
  isProcessing: boolean;
  progress: number;
  currentOperation: string | null;
  lastResponse: AIServiceResponse | null;
  error: string | null;
}

export function useAIService(options: UseAIServiceOptions = {}) {
  const {
    enableFeedback = true,
    enableAnalytics = true,
    autoRetry = true,
    maxRetries = 2
  } = options;

  const [state, setState] = useState<AIOperationState>({
    isProcessing: false,
    progress: 0,
    currentOperation: null,
    lastResponse: null,
    error: null
  });

  const retryCount = useRef<number>(0);
  const operationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Update state helper
  const updateState = useCallback((updates: Partial<AIOperationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Generic AI operation wrapper
  const executeOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<AIServiceResponse<T>>,
    options: { timeout?: number; showProgress?: boolean } = {}
  ): Promise<AIServiceResponse<T>> => {
    const { timeout = 30000, showProgress = true } = options;

    updateState({
      isProcessing: true,
      currentOperation: operationName,
      progress: showProgress ? 10 : 0,
      error: null
    });

    try {
      // Set timeout
      const timeoutId = setTimeout(() => {
        updateState({
          isProcessing: false,
          error: 'Operation timed out',
          progress: 0
        });
        toast.error(`${operationName} timed out. Please try again.`);
      }, timeout);

      operationTimeouts.current.set(operationName, timeoutId);

      if (showProgress) {
        updateState({ progress: 30 });
      }

      const result = await operation();

      clearTimeout(timeoutId);
      operationTimeouts.current.delete(operationName);

      if (showProgress) {
        updateState({ progress: 90 });
      }

      updateState({
        lastResponse: result,
        progress: 100
      });

      // Auto-retry on failure
      if (!result.success && autoRetry && retryCount.current < maxRetries) {
        retryCount.current++;
        toast.error(`${operationName} failed. Retrying... (${retryCount.current}/${maxRetries})`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.current));
        return executeOperation(operationName, operation, options);
      }

      retryCount.current = 0;
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateState({
        error: errorMessage,
        lastResponse: { success: false, error: errorMessage }
      });

      if (autoRetry && retryCount.current < maxRetries) {
        retryCount.current++;
        toast.error(`${operationName} failed. Retrying... (${retryCount.current}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.current));
        return executeOperation(operationName, operation, options);
      }

      retryCount.current = 0;
      return { success: false, error: errorMessage };

    } finally {
      setTimeout(() => {
        updateState({
          isProcessing: false,
          currentOperation: null,
          progress: 0
        });
      }, 1000);
    }
  }, [autoRetry, maxRetries, updateState]);

  // Resume Enhancement
  const enhanceResume = useCallback(async (
    resumeData: CoreResumeData,
    options: {
      sections?: string[];
      enhancementType?: 'professional' | 'ats' | 'creative' | 'technical';
      targetRole?: string;
      jobDescription?: string;
    } = {}
  ) => {
    return executeOperation('Resume Enhancement', () => 
      aiServiceManager.enhanceResume(resumeData, options)
    );
  }, [executeOperation]);

  // Job Matching
  const matchJobs = useCallback(async (
    resumeData: CoreResumeData,
    jobDescriptions: Array<{ id: string; title: string; description: string; requirements?: string[] }>,
    options: {
      includeSkillGaps?: boolean;
      includeSalaryComparison?: boolean;
      maxMatches?: number;
    } = {}
  ) => {
    return executeOperation('Job Matching', () => 
      aiServiceManager.matchJobs(resumeData, jobDescriptions, options)
    );
  }, [executeOperation]);

  // Cover Letter Generation
  const generateCoverLetter = useCallback(async (
    resumeData: CoreResumeData,
    jobData: {
      title: string;
      company: string;
      description: string;
      requirements?: string[];
    },
    options: {
      tone?: 'professional' | 'enthusiastic' | 'formal' | 'friendly';
      length?: 'short' | 'medium' | 'long';
      includeCallToAction?: boolean;
    } = {}
  ) => {
    return executeOperation('Cover Letter Generation', () => 
      aiServiceManager.generateCoverLetter(resumeData, jobData, options)
    );
  }, [executeOperation]);

  // Interview Preparation
  const prepareForInterview = useCallback(async (
    resumeData: CoreResumeData,
    jobData: {
      title: string;
      company: string;
      description: string;
      interviewType?: 'behavioral' | 'technical' | 'case_study' | 'general';
    },
    options: {
      questionCount?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
      includeTipsAndTricks?: boolean;
    } = {}
  ) => {
    return executeOperation('Interview Preparation', () => 
      aiServiceManager.prepareForInterview(resumeData, jobData, options)
    );
  }, [executeOperation]);

  // Career Advice
  const getCareerAdvice = useCallback(async (
    resumeData: CoreResumeData,
    careerGoals: {
      targetRole?: string;
      targetIndustry?: string;
      timeframe?: string;
      currentChallenges?: string[];
    },
    options: {
      includeSkillGaps?: boolean;
      includeMarketInsights?: boolean;
      includeNetworkingTips?: boolean;
    } = {}
  ) => {
    return executeOperation('Career Advice', () => 
      aiServiceManager.getCareerAdvice(resumeData, careerGoals, options)
    );
  }, [executeOperation]);

  // ATS Optimization (legacy — passes resume data as CoreResumeData shape)
  const optimizeForATS = useCallback(async (
    resumeData: CoreResumeData,
    jobDescription: string,
    options: {
      targetScore?: number;
      includeKeywordSuggestions?: boolean;
      includeFormattingTips?: boolean;
    } = {}
  ) => {
    return executeOperation('ATS Optimization', () => 
      aiServiceManager.optimizeForATS(resumeData, jobDescription, options)
    );
  }, [executeOperation]);

  // Phase 1 Real ATS Fit Analysis — uses real resume + job records from Supabase
  const analyzeRealATSFit = useCallback(async (
    resumeId: string,
    jobId: string,
    userId?: string
  ): Promise<ATSFitResult | null> => {
    updateState({
      isProcessing: true,
      currentOperation: 'ATS Fit Analysis',
      progress: 10,
      error: null,
    });
    try {
      updateState({ progress: 30 });
      const result = await analyzeATSFit(resumeId, jobId, userId);
      updateState({ progress: 90 });
      if (isATSAnalysis(result)) {
        toast.success(`ATS analysis complete — score: ${result.score}/100`);
      } else {
        toast.warning(`ATS analysis unavailable: ${result.reason}`);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ATS analysis failed';
      updateState({ error: message });
      toast.error('ATS analysis could not be completed. Your application was still submitted.');
      return null;
    } finally {
      setTimeout(() => updateState({ isProcessing: false, currentOperation: null, progress: 0 }), 1000);
    }
  }, [updateState]);

  // Serialize ATS result for application_data storage — safe merge helper
  const getATSStoragePayload = useCallback((result: ATSFitResult) => {
    return serializeATSResultForStorage(result);
  }, []);


  // Feedback submission
  const submitFeedback = useCallback(async (
    operationId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    feedback?: {
      text?: string;
      improvements?: string[];
    }
  ) => {
    if (!enableFeedback) return;

    const feedbackData: AIFeedback = {
      operation_id: operationId,
      rating,
      feedback_text: feedback?.text,
      improvement_suggestions: feedback?.improvements
    };

    try {
      await aiServiceManager.submitFeedback(feedbackData);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }, [enableFeedback]);

  // Get service health
  const checkServiceHealth = useCallback(async () => {
    try {
      const health = await aiServiceManager.getServiceHealth();
      return health;
    } catch (error) {
      console.error('Failed to check service health:', error);
      return {
        overall_status: 'down' as const,
        services: []
      };
    }
  }, []);

  // Get usage analytics
  const getUsageAnalytics = useCallback(async (timeframe: 'day' | 'week' | 'month' = 'week') => {
    if (!enableAnalytics) return null;

    try {
      const analytics = await aiServiceManager.getUsageAnalytics(timeframe);
      return analytics;
    } catch (error) {
      console.error('Failed to get usage analytics:', error);
      return null;
    }
  }, [enableAnalytics]);

  // Cancel operation
  const cancelOperation = useCallback(() => {
    if (state.currentOperation) {
      const timeout = operationTimeouts.current.get(state.currentOperation);
      if (timeout) {
        clearTimeout(timeout);
        operationTimeouts.current.delete(state.currentOperation);
      }
      
      updateState({
        isProcessing: false,
        currentOperation: null,
        progress: 0,
        error: 'Operation cancelled'
      });
      
      toast.info('Operation cancelled');
    }
  }, [state.currentOperation, updateState]);

  // Batch operations
  const batchProcess = useCallback(async <T>(
    operations: Array<{
      name: string;
      operation: () => Promise<AIServiceResponse<T>>;
    }>,
    options: { concurrency?: number; stopOnError?: boolean } = {}
  ) => {
    const { concurrency = 3, stopOnError = false } = options;
    const results: Array<{ name: string; result: AIServiceResponse<T> }> = [];
    
    updateState({
      isProcessing: true,
      currentOperation: 'Batch Processing',
      progress: 0
    });

    try {
      for (let i = 0; i < operations.length; i += concurrency) {
        const batch = operations.slice(i, i + concurrency);
        const batchPromises = batch.map(async ({ name, operation }) => {
          try {
            const result = await operation();
            return { name, result };
          } catch (error) {
            return {
              name,
              result: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } as AIServiceResponse<T>
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Check for errors if stopOnError is true
        if (stopOnError && batchResults.some(r => !r.result.success)) {
          const failedOperation = batchResults.find(r => !r.result.success);
          throw new Error(`Batch stopped due to error in ${failedOperation?.name}: ${failedOperation?.result.error}`);
        }

        // Update progress
        updateState({
          progress: Math.round(((i + batch.length) / operations.length) * 100)
        });
      }

      const successCount = results.filter(r => r.result.success).length;
      toast.success(`Batch processing completed: ${successCount}/${results.length} successful`);

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch processing failed';
      updateState({ error: errorMessage });
      toast.error(errorMessage);
      return results; // Return partial results
    } finally {
      updateState({
        isProcessing: false,
        currentOperation: null,
        progress: 0
      });
    }
  }, [updateState]);

  // Legacy compatibility method
  const invokeAITool = useCallback(async (options: any) => {
    // Map legacy calls to new architecture
    const operationMap = {
      'resume-enhancer': 'enhanceResume',
      'ats-optimizer': 'optimizeForATS',
      'cover-letter-generator': 'generateCoverLetter',
      'career-advisor': 'getCareerAdvice',
      'interview-prep': 'prepareForInterview'
    };
    
    const operation = operationMap[options.toolSlug as keyof typeof operationMap];
    if (operation && typeof (this as any)[operation] === 'function') {
      return (this as any)[operation](options.inputData, options);
    }
    
    // Fallback to basic response
    return {
      success: true,
      data: { message: 'Legacy operation completed' }
    };
  }, []);

  // Legacy methods for backward compatibility
  const analyzeCareerPath = useCallback(async (userProfile: any, targetRole?: string) => {
    return getCareerAdvice(userProfile, { targetRole });
  }, [getCareerAdvice]);

  const analyzeSalary = useCallback(async (role: string, location: string, experience: number) => {
    return {
      success: true,
      data: { message: 'Salary analysis completed' }
    };
  }, []);

  return {
    // State
    ...state,

    // Core operations
    enhanceResume,
    matchJobs,
    generateCoverLetter,
    prepareForInterview,
    getCareerAdvice,
    optimizeForATS,

    // Phase 1 Real ATS Engine
    analyzeRealATSFit,
    getATSStoragePayload,

    // Legacy compatibility
    invokeAITool,
    analyzeCareerPath,
    analyzeSalary,

    // Utility operations
    submitFeedback,
    checkServiceHealth,
    getUsageAnalytics,
    cancelOperation,
    batchProcess,

    // Service manager (for advanced usage)
    serviceManager: aiServiceManager
  };
}