import { supabase } from '@/integrations/supabase/client';

export interface AICallOptions {
  module: string;
  feature: string;
  input: Record<string, any>;
  customPrompt?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokensUsed: number;
    responseTime: number;
    costEstimate: number;
  };
  featureStatus?: {
    enabled: boolean;
    lastSuccess: string | null;
  };
}

export interface AIFeatureStatus {
  id: string;
  module_name: string;
  feature_name: string;
  feature_key: string;
  enabled: boolean;
  last_checked: string | null;
  last_success: string | null;
  last_error: string | null;
  error_message: string | null;
  usage_count: number;
  success_count: number;
  error_count: number;
  average_response_time: number | null;
  prompt_version: string;
  notes: string | null;
}

class AIService {
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Main AI call method - routes all AI requests through the unified gateway
   */
  async call(params: AICallOptions): Promise<AIResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await supabase.functions.invoke('ai-gateway', {
        body: {
          ...params,
          userId: user?.id,
          sessionId: this.sessionId
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'AI service error');
      }

      return response.data as AIResponse;
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error'
      };
    }
  }

  /**
   * Check if a specific AI feature is enabled and working
   */
  async checkFeatureStatus(module: string, featureKey: string): Promise<AIFeatureStatus | null> {
    try {
      const { data, error } = await supabase
        .from('ai_features_status')
        .select('*')
        .eq('module_name', module)
        .eq('feature_key', featureKey)
        .single();

      if (error) {
        console.error('Feature status check error:', error);
        return null;
      }

      return data as AIFeatureStatus;
    } catch (error) {
      console.error('Feature status check failed:', error);
      return null;
    }
  }

  /**
   * Get all AI features status for admin dashboard
   */
  async getAllFeaturesStatus(): Promise<AIFeatureStatus[]> {
    try {
      const { data, error } = await supabase
        .from('ai_features_status')
        .select('*')
        .order('module_name', { ascending: true })
        .order('feature_name', { ascending: true });

      if (error) {
        throw error;
      }

      return data as AIFeatureStatus[];
    } catch (error) {
      console.error('Failed to get all features status:', error);
      return [];
    }
  }

  /**
   * Get AI usage analytics
   */
  async getUsageAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
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
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        totalCalls: data.length,
        successfulCalls: data.filter(log => log.success).length,
        failedCalls: data.filter(log => !log.success).length,
        totalTokens: data.reduce((sum, log) => sum + (log.tokens_used || 0), 0),
        totalCost: data.reduce((sum, log) => sum + ((log as any).cost_estimate || 0), 0),
        averageResponseTime: data.length > 0 
          ? data.reduce((sum, log) => sum + ((log as any).response_time || 0), 0) / data.length 
          : 0,
        usageByModule: this.groupByModule(data),
        recentActivity: data.slice(0, 10)
      };
    } catch (error) {
      console.error('Failed to get usage analytics:', error);
      return null;
    }
  }

  private groupByModule(logs: any[]) {
    return logs.reduce((acc, log) => {
      const module = log.module_name;
      if (!acc[module]) {
        acc[module] = {
          calls: 0,
          tokens: 0,
          cost: 0,
          successRate: 0
        };
      }
      acc[module].calls++;
      acc[module].tokens += log.tokens_used || 0;
      acc[module].cost += log.cost_estimate || 0;
      
      // Calculate success rate
      const moduleLogs = logs.filter(l => l.module_name === module);
      const successfulLogs = moduleLogs.filter(l => l.success);
      acc[module].successRate = (successfulLogs.length / moduleLogs.length) * 100;
      
      return acc;
    }, {});
  }

  // Convenience methods for specific AI features

  /**
   * Network AI Features
   */
  async suggestPosts(profileData: any, recentActivity: any[], targetAudience?: string) {
    return this.call({
      module: 'Network',
      feature: 'smart_post_suggestions',
      input: {
        profile_data: JSON.stringify(profileData),
        recent_activity: JSON.stringify(recentActivity),
        target_audience: targetAudience || 'professional network'
      }
    });
  }

  async enhanceComment(originalComment: string, postContext: string) {
    return this.call({
      module: 'Network',
      feature: 'comment_enhancer',
      input: {
        original_comment: originalComment,
        post_context: postContext
      }
    });
  }

  async generateIntro(userBackground: any, targetAudience: string, purpose: string) {
    return this.call({
      module: 'Network',
      feature: 'intro_generator',
      input: {
        user_background: JSON.stringify(userBackground),
        target_audience: targetAudience,
        networking_purpose: purpose
      }
    });
  }

  /**
   * Jobs AI Features
   */
  async analyzeJobMatch(candidateData: any, jobDescription: string) {
    return this.call({
      module: 'Jobs',
      feature: 'match_gpt',
      input: {
        candidate_data: JSON.stringify(candidateData),
        job_description: jobDescription
      }
    });
  }

  async summarizeJobDescription(jobDescription: string) {
    return this.call({
      module: 'Jobs',
      feature: 'jd_summarizer',
      input: {
        job_description: jobDescription
      }
    });
  }

  async generateSmartApplication(candidateProfile: any, jobDescription: string) {
    return this.call({
      module: 'Jobs',
      feature: 'smart_apply',
      input: {
        candidate_profile: JSON.stringify(candidateProfile),
        job_description: jobDescription
      }
    });
  }

  /**
   * Resume AI Features
   */
  async enhanceResume(sectionContent: string, targetRole: string) {
    return this.call({
      module: 'Resume Builder',
      feature: 'resume_enhancer',
      input: {
        section_content: sectionContent,
        target_role: targetRole
      }
    });
  }

  async scoreATS(resumeText: string, jobDescription: string) {
    return this.call({
      module: 'Resume Builder',
      feature: 'ats_scoring',
      input: {
        resume_text: resumeText,
        job_description: jobDescription
      }
    });
  }

  /**
   * Tools AI Features
   */
  async generateCoverLetter(candidateInfo: any, jobInfo: any, tone: string = 'professional') {
    return this.call({
      module: 'Tools',
      feature: 'cover_letter_generator',
      input: {
        candidate_info: JSON.stringify(candidateInfo),
        job_info: JSON.stringify(jobInfo),
        tone: tone
      }
    });
  }

  /**
   * Career Mapping AI Features
   */
  async generateCareerRoadmap(currentRole: string, targetRole: string, timeframe: string, skills: string[]) {
    return this.call({
      module: 'Career Map',
      feature: 'career_roadmap',
      input: {
        current_role: currentRole,
        target_role: targetRole,
        timeframe: timeframe,
        current_skills: JSON.stringify(skills)
      }
    });
  }

  /**
   * Colleges AI Features
   */
  async discoverColleges(userProfile: any, preferences: any) {
    return this.call({
      module: 'Colleges',
      feature: 'college_discovery',
      input: {
        user_profile: JSON.stringify(userProfile),
        preferences: JSON.stringify(preferences)
      }
    });
  }

  async recommendCourses(userProfile: any, careerGoals: any, collegeId?: string) {
    return this.call({
      module: 'Colleges',
      feature: 'course_recommender',
      input: {
        user_profile: JSON.stringify(userProfile),
        career_goals: JSON.stringify(careerGoals),
        college_id: collegeId
      }
    });
  }

  async compareColleges(colleges: any[], comparisonCriteria: string[]) {
    return this.call({
      module: 'Colleges',
      feature: 'college_comparison',
      input: {
        colleges: JSON.stringify(colleges),
        criteria: JSON.stringify(comparisonCriteria)
      }
    });
  }

  async askCollegeQuestion(question: string, context?: any) {
    return this.call({
      module: 'Colleges',
      feature: 'college_qa_assistant',
      input: {
        question: question,
        context: context ? JSON.stringify(context) : null
      }
    });
  }

  async generateSOP(templateData: any, documentType: string = 'sop') {
    return this.call({
      module: 'Colleges',
      feature: 'sop_lor_generator',
      input: {
        template_data: JSON.stringify(templateData),
        document_type: documentType
      }
    });
  }

  async analyzeCollegeReviews(reviews: any[]) {
    return this.call({
      module: 'Colleges',
      feature: 'review_analysis',
      input: {
        reviews: JSON.stringify(reviews)
      }
    });
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export utility function to check if AI is available
export async function isAIFeatureAvailable(module: string, featureKey: string): Promise<boolean> {
  const status = await aiService.checkFeatureStatus(module, featureKey);
  return status ? status.enabled : false;
}
