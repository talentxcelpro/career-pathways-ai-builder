// ============================================
// UNIFIED AI SERVICE MANAGER - PHASE 3 FOUNDATION
// ============================================
// This service manages all AI operations with unified architecture

import { supabase } from '@/integrations/supabase/client';
import { CoreResumeData } from '@/types/resume-core';
import { toast } from 'sonner';

export interface AIServiceRequest {
  operationType: 'resume_enhance' | 'job_match' | 'cover_letter' | 'interview_prep' | 'career_advice' | 'ats_optimize';
  inputData: any;
  targetRole?: string;
  options?: {
    priority?: 'low' | 'medium' | 'high';
    background?: boolean;
    responseFormat?: 'text' | 'json' | 'structured';
    maxTokens?: number;
    model?: string;
  };
}

export interface AIServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  processing_time?: number;
  cost_estimate?: number;
  tokens_used?: number;
  recommendations?: string[];
  feedback_id?: string;
}

export interface AIJobMatch {
  job_id: string;
  match_score: number;
  matching_factors: string[];
  skill_gaps: string[];
  salary_comparison?: {
    job_salary_min?: number;
    job_salary_max?: number;
    market_avg?: number;
  };
  recommendations: string[];
}

export interface AIResumeEnhancement {
  enhanced_sections: {
    [key: string]: {
      original: string;
      enhanced: string;
      improvements: string[];
    };
  };
  ats_score: {
    overall: number;
    keyword_density: number;
    formatting: number;
    structure: number;
  };
  suggestions: string[];
  keywords_to_add: string[];
}

export interface AICoverLetter {
  content: string;
  sections: {
    opening: string;
    body: string;
    closing: string;
  };
  tone: 'professional' | 'enthusiastic' | 'formal' | 'friendly';
  customization_notes: string[];
}

export interface AICareerInsight {
  career_paths: Array<{
    title: string;
    description: string;
    required_skills: string[];
    timeline: string;
    growth_potential: number;
  }>;
  skill_recommendations: Array<{
    skill: string;
    importance: number;
    learning_resources: string[];
  }>;
  market_insights: {
    demand_level: 'low' | 'medium' | 'high';
    avg_salary_range: string;
    trending_skills: string[];
  };
}

export interface AIFeedback {
  operation_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback_text?: string;
  improvement_suggestions?: string[];
}

class AIServiceManager {
  private baseUrl = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1';
  private sessionId: string;
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.sessionId = `ai_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Rate limiting check
  private checkRateLimit(operationType: string): boolean {
    const now = Date.now();
    const key = operationType;
    const limit = this.rateLimits.get(key);
    
    if (!limit || now > limit.resetTime) {
      this.rateLimits.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return true;
    }
    
    if (limit.count >= 10) { // 10 requests per minute
      return false;
    }
    
    limit.count++;
    return true;
  }

  // Core AI request method
  private async makeAIRequest<T>(request: AIServiceRequest): Promise<AIServiceResponse<T>> {
    if (!this.checkRateLimit(request.operationType)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait before making another request.'
      };
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${this.baseUrl}/ai-unified-processor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          ...request,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      
      // Log successful operations
      if (result.success) {
        this.logOperation(request.operationType, 'success', result);
      }
      
      return result;

    } catch (error) {
      console.error('AI Service Request Failed:', error);
      this.logOperation(request.operationType, 'error', { error: error.message });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error'
      };
    }
  }

  // Logging operations
  private async logOperation(operationType: string, status: 'success' | 'error', data: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('ai_usage_logs').insert({
        user_id: user?.id,
        operation_type: operationType,
        status,
        request_data: data.request || {},
        response_data: data.response || data,
        session_id: this.sessionId,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to log AI operation:', error);
    }
  }

  // Resume Enhancement
  async enhanceResume(
    resumeData: CoreResumeData, 
    options: {
      sections?: string[];
      enhancementType?: 'professional' | 'ats' | 'creative' | 'technical';
      targetRole?: string;
      jobDescription?: string;
    } = {}
  ): Promise<AIServiceResponse<AIResumeEnhancement>> {
    const result = await this.makeAIRequest<AIResumeEnhancement>({
      operationType: 'resume_enhance',
      inputData: {
        resumeData,
        sections: options.sections || ['personalInfo', 'experience', 'skills'],
        enhancementType: options.enhancementType || 'professional',
        jobDescription: options.jobDescription
      },
      targetRole: options.targetRole,
      options: {
        priority: 'high',
        responseFormat: 'structured'
      }
    });

    if (result.success) {
      toast.success('Resume enhanced successfully!');
    } else {
      toast.error(result.error || 'Failed to enhance resume');
    }

    return result;
  }

  // Job Matching
  async matchJobs(
    resumeData: CoreResumeData,
    jobDescriptions: Array<{ id: string; title: string; description: string; requirements?: string[] }>,
    options: {
      includeSkillGaps?: boolean;
      includeSalaryComparison?: boolean;
      maxMatches?: number;
    } = {}
  ): Promise<AIServiceResponse<AIJobMatch[]>> {
    const result = await this.makeAIRequest<AIJobMatch[]>({
      operationType: 'job_match',
      inputData: {
        resumeData,
        jobDescriptions,
        includeSkillGaps: options.includeSkillGaps !== false,
        includeSalaryComparison: options.includeSalaryComparison !== false,
        maxMatches: options.maxMatches || 10
      },
      options: {
        priority: 'medium',
        responseFormat: 'structured'
      }
    });

    if (result.success) {
      toast.success(`Found ${result.data?.length || 0} job matches!`);
    } else {
      toast.error(result.error || 'Failed to match jobs');
    }

    return result;
  }

  // Cover Letter Generation
  async generateCoverLetter(
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
  ): Promise<AIServiceResponse<AICoverLetter>> {
    const result = await this.makeAIRequest<AICoverLetter>({
      operationType: 'cover_letter',
      inputData: {
        resumeData,
        jobData,
        tone: options.tone || 'professional',
        length: options.length || 'medium',
        includeCallToAction: options.includeCallToAction !== false
      },
      options: {
        priority: 'medium',
        responseFormat: 'structured'
      }
    });

    if (result.success) {
      toast.success('Cover letter generated successfully!');
    } else {
      toast.error(result.error || 'Failed to generate cover letter');
    }

    return result;
  }

  // Interview Preparation
  async prepareForInterview(
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
  ): Promise<AIServiceResponse<{
    questions: Array<{
      question: string;
      type: string;
      suggested_answer: string;
      tips: string[];
    }>;
    general_tips: string[];
    company_insights: string[];
  }>> {
    const result = await this.makeAIRequest({
      operationType: 'interview_prep',
      inputData: {
        resumeData,
        jobData,
        questionCount: options.questionCount || 10,
        difficulty: options.difficulty || 'medium',
        includeTipsAndTricks: options.includeTipsAndTricks !== false
      },
      options: {
        priority: 'medium',
        responseFormat: 'structured'
      }
    });

    if (result.success) {
      toast.success('Interview preparation ready!');
    } else {
      toast.error(result.error || 'Failed to prepare interview materials');
    }

    return result as AIServiceResponse<{
      questions: Array<{
        question: string;
        type: string;
        suggested_answer: string;
        tips: string[];
      }>;
      general_tips: string[];
      company_insights: string[];
    }>;
  }

  // Career Advice
  async getCareerAdvice(
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
  ): Promise<AIServiceResponse<AICareerInsight>> {
    const result = await this.makeAIRequest<AICareerInsight>({
      operationType: 'career_advice',
      inputData: {
        resumeData,
        careerGoals,
        includeSkillGaps: options.includeSkillGaps !== false,
        includeMarketInsights: options.includeMarketInsights !== false,
        includeNetworkingTips: options.includeNetworkingTips !== false
      },
      options: {
        priority: 'low',
        responseFormat: 'structured'
      }
    });

    if (result.success) {
      toast.success('Career insights generated!');
    } else {
      toast.error(result.error || 'Failed to generate career advice');
    }

    return result;
  }

  // ATS Optimization
  async optimizeForATS(
    resumeData: CoreResumeData,
    jobDescription: string,
    options: {
      targetScore?: number;
      includeKeywordSuggestions?: boolean;
      includeFormattingTips?: boolean;
    } = {}
  ): Promise<AIServiceResponse<{
    optimized_resume: CoreResumeData;
    ats_score: {
      current: number;
      potential: number;
      improvements: string[];
    };
    keyword_suggestions: Array<{
      keyword: string;
      importance: number;
      current_mentions: number;
      suggested_mentions: number;
    }>;
    formatting_improvements: string[];
  }>> {
    const result = await this.makeAIRequest({
      operationType: 'ats_optimize',
      inputData: {
        resumeData,
        jobDescription,
        targetScore: options.targetScore || 85,
        includeKeywordSuggestions: options.includeKeywordSuggestions !== false,
        includeFormattingTips: options.includeFormattingTips !== false
      },
      options: {
        priority: 'high',
        responseFormat: 'structured'
      }
    });

    if (result.success) {
      toast.success('Resume optimized for ATS!');
    } else {
      toast.error(result.error || 'Failed to optimize resume');
    }

    return result as AIServiceResponse<{
      optimized_resume: CoreResumeData;
      ats_score: {
        current: number;
        potential: number;
        improvements: string[];
      };
      keyword_suggestions: Array<{
        keyword: string;
        importance: number;
        current_mentions: number;
        suggested_mentions: number;
      }>;
      formatting_improvements: string[];
    }>;
  }

  // Feedback Collection
  async submitFeedback(feedback: AIFeedback): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('ai_feedback_system').insert({
        user_id: user?.id,
        operation_id: feedback.operation_id,
        rating: feedback.rating,
        feedback_text: feedback.feedback_text,
        metadata: {
          improvement_suggestions: feedback.improvement_suggestions,
          session_id: this.sessionId
        }
      });
      
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  }

  // Get AI service health status
  async getServiceHealth(): Promise<{
    overall_status: 'healthy' | 'degraded' | 'down';
    services: Array<{
      name: string;
      status: 'up' | 'down';
      response_time?: number;
      last_checked: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai-health-check`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        }
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to check AI service health:', error);
      return {
        overall_status: 'down',
        services: []
      };
    }
  }

  // Get usage analytics
  async getUsageAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    total_operations: number;
    successful_operations: number;
    failed_operations: number;
    average_response_time: number;
    cost_estimate: number;
    popular_operations: Array<{
      operation: string;
      count: number;
      success_rate: number;
    }>;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let dateFilter = new Date();
      
      switch (timeframe) {
        case 'day':
          dateFilter.setDate(dateFilter.getDate() - 1);
          break;
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7);
          break;
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', dateFilter.toISOString());

      if (error) throw error;

      const analytics = {
        total_operations: data.length,
        successful_operations: data.filter(log => log.status === 'success').length,
        failed_operations: data.filter(log => log.status === 'error').length,
        average_response_time: data.length > 0 
          ? data.reduce((sum, log) => sum + (log.response_time || 0), 0) / data.length 
          : 0,
        cost_estimate: data.reduce((sum, log) => sum + (log.cost_estimate || 0), 0),
        popular_operations: this.calculatePopularOperations(data)
      };

      return analytics;
    } catch (error) {
      console.error('Failed to get usage analytics:', error);
      return {
        total_operations: 0,
        successful_operations: 0,
        failed_operations: 0,
        average_response_time: 0,
        cost_estimate: 0,
        popular_operations: []
      };
    }
  }

  private calculatePopularOperations(logs: any[]) {
    const operationCounts: { [key: string]: { total: number; successful: number } } = {};
    
    logs.forEach(log => {
      if (!operationCounts[log.operation_type]) {
        operationCounts[log.operation_type] = { total: 0, successful: 0 };
      }
      operationCounts[log.operation_type].total++;
      if (log.status === 'success') {
        operationCounts[log.operation_type].successful++;
      }
    });

    return Object.entries(operationCounts)
      .map(([operation, counts]) => ({
        operation,
        count: counts.total,
        success_rate: counts.total > 0 ? (counts.successful / counts.total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

// Export singleton instance
export const aiServiceManager = new AIServiceManager();