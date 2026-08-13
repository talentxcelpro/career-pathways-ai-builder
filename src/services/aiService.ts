import { supabase } from '@/integrations/supabase/client';

// Enhanced AI Call Options for new tool-based approach
export interface AIToolCallOptions {
  toolSlug: string;
  operationType?: string;
  input: Record<string, any>;
  background?: boolean;
  customPrompt?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

// Legacy AI Call Options (maintained for backward compatibility)
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

// New interfaces for enhanced AI management
export interface AIToolConfig {
  id: string;
  tool_name: string;
  tool_slug: string;
  description: string;
  prompt_template: string;
  system_message: string;
  model_name: string;
  max_tokens: number;
  temperature: number;
  is_enabled: boolean;
  is_premium: boolean;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  cost_per_request: number;
  category: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface AIOperationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output_data?: any;
  error_message?: string;
  progress?: number;
}

class AIService {
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enhanced AI tool method - use this for new tool-based requests
   */
  async callTool(params: AIToolCallOptions): Promise<AIResponse> {
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
      console.error('AI Tool Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI service error'
      };
    }
  }

  /**
   * Get all available AI tools
   */
  async getAvailableTools(category?: string): Promise<AIToolConfig[]> {
    try {
      let query = supabase
        .from('ai_tools_config')
        .select('*')
        .eq('is_enabled', true);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('tool_name');

      if (error) {
        throw error;
      }

      return data as AIToolConfig[];
    } catch (error) {
      console.error('Failed to get available tools:', error);
      return [];
    }
  }

  /**
   * Get AI tool configuration by slug
   */
  async getToolConfig(toolSlug: string): Promise<AIToolConfig | null> {
    try {
      const { data, error } = await supabase
        .from('ai_tools_config')
        .select('*')
        .eq('tool_slug', toolSlug)
        .single();

      if (error) {
        console.error('Tool config error:', error);
        return null;
      }

      return data as AIToolConfig;
    } catch (error) {
      console.error('Failed to get tool config:', error);
      return null;
    }
  }

  /**
   * Check operation status for background operations
   */
  async checkOperationStatus(operationId: string): Promise<AIOperationStatus | null> {
    try {
      const { data, error } = await supabase
        .from('ai_operation_queue')
        .select('id, status, output_data, error_message')
        .eq('id', operationId)
        .single();

      if (error) {
        console.error('Operation status error:', error);
        return null;
      }

      return data as AIOperationStatus;
    } catch (error) {
      console.error('Failed to check operation status:', error);
      return null;
    }
  }

  /**
   * Get user's AI operation history
   */
  async getOperationHistory(limit: number = 20): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ai_operation_queue')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get operation history:', error);
      return [];
    }
  }

  // New tool-based convenience methods using the enhanced architecture

  /**
   * Resume Tools (New Architecture)
   */
  async tailorResume(resumeText: string, jobDescription: string, background?: boolean) {
    return this.callTool({
      toolSlug: 'resume-tailor',
      input: {
        resume_text: resumeText,
        job_description: jobDescription
      },
      background
    });
  }

  async analyzeResumeATS(resumeText: string, jobDescription: string) {
    return this.callTool({
      toolSlug: 'resume-score',
      input: {
        resume_text: resumeText,
        job_description: jobDescription
      }
    });
  }

  /**
   * Application Tools (New Architecture)
   */
  async generateCoverLetterNew(candidateInfo: any, jobInfo: any, tone: string = 'professional') {
    return this.callTool({
      toolSlug: 'cover-letter',
      input: {
        candidate_info: typeof candidateInfo === 'string' ? candidateInfo : JSON.stringify(candidateInfo),
        job_info: typeof jobInfo === 'string' ? jobInfo : JSON.stringify(jobInfo),
        tone
      }
    });
  }

  /**
   * Career Tools (New Architecture)
   */
  async findCareerPaths(currentBackground: any, interests: string[], targetIndustry?: string) {
    return this.callTool({
      toolSlug: 'career-pathfinder',
      input: {
        current_background: typeof currentBackground === 'string' ? currentBackground : JSON.stringify(currentBackground),
        interests: JSON.stringify(interests),
        target_industry: targetIndustry
      }
    });
  }

  async performCareerSWOT(profileData: any, careerGoals: any) {
    return this.callTool({
      toolSlug: 'career-swot',
      input: {
        profile_data: typeof profileData === 'string' ? profileData : JSON.stringify(profileData),
        career_goals: typeof careerGoals === 'string' ? careerGoals : JSON.stringify(careerGoals)
      }
    });
  }

  async createCareerRoadmap(currentRole: string, targetRole: string, timeframe: string, background?: boolean) {
    return this.callTool({
      toolSlug: 'ai-roadmap',
      input: {
        current_role: currentRole,
        target_role: targetRole,
        timeframe: timeframe
      },
      background
    });
  }

  /**
   * Job Tools (New Architecture)
   */
  async matchJobsGPT(candidateProfile: any, jobDescriptions: any[]) {
    return this.callTool({
      toolSlug: 'job-match',
      input: {
        candidate_profile: typeof candidateProfile === 'string' ? candidateProfile : JSON.stringify(candidateProfile),
        job_descriptions: JSON.stringify(jobDescriptions)
      }
    });
  }

  /**
   * Interview Tools (New Architecture)
   */
  async simulateInterview(jobDescription: string, candidateBackground: any, interviewType: string = 'general') {
    return this.callTool({
      toolSlug: 'interview-qa',
      input: {
        job_description: jobDescription,
        candidate_background: typeof candidateBackground === 'string' ? candidateBackground : JSON.stringify(candidateBackground),
        interview_type: interviewType
      }
    });
  }

  /**
   * Skills Tools (New Architecture)
   */
  async analyzeSkillGaps(currentSkills: string[], targetRole: string, experience_level: string = 'intermediate') {
    return this.callTool({
      toolSlug: 'skills-gap',
      input: {
        current_skills: JSON.stringify(currentSkills),
        target_role: targetRole,
        experience_level
      }
    });
  }

  /**
   * Networking Tools (New Architecture)
   */
  async createOutreachMessage(targetProfile: any, purpose: string, connectionContext?: string) {
    return this.callTool({
      toolSlug: 'outreach-message',
      input: {
        target_profile: typeof targetProfile === 'string' ? targetProfile : JSON.stringify(targetProfile),
        purpose: purpose,
        connection_context: connectionContext
      }
    });
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

  /**
   * DEFENSIVE CANDIDATE CONTEXT EXTRACTOR
   * Safely fetches and unifies candidate career data with defensive null-guards
   * to prevent silent failures or unparsed AI prompts.
   */
  async getUnifiedCandidateContext(userId: string) {
    if (!userId) {
      return {
        hasData: false,
        passport: null,
        primaryResume: null,
        skills: [],
        assessments: [],
        completenessScore: 0
      };
    }

    try {
      // Parallel queries with graceful fallback handling
      const [passportRes, resumeRes, skillsRes, assessmentsRes] = await Promise.all([
        supabase.from('career_passport').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('resumes').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('assessment_attempts').select('*').eq('user_id', userId)
      ]);

      const passport = passportRes?.data || null;
      const primaryResume = resumeRes?.data || null;
      const skills = (skillsRes?.data || []).map(s => ({
        name: s.skill_name || s.name || 'Unspecified Skill',
        level: s.proficiency_level || 'Intermediate',
        verified: Boolean(s.verified || s.is_verified)
      }));
      const assessments = (assessmentsRes?.data || []).map(a => ({
        title: a.assessment_title || 'Skill Assessment',
        score: typeof a.score === 'number' ? a.score : 0,
        passed: Boolean(a.passed)
      }));

      const hasData = Boolean(passport || primaryResume || skills.length > 0);
      const completenessScore = hasData 
        ? Math.min(100, (passport ? 30 : 0) + (primaryResume ? 40 : 0) + Math.min(30, skills.length * 5))
        : 0;

      return {
        hasData,
        passport,
        primaryResume,
        skills,
        assessments,
        completenessScore
      };
    } catch (err) {
      console.warn('⚠️ Defensive Candidate Context fetch warning:', err);
      return {
        hasData: false,
        passport: null,
        primaryResume: null,
        skills: [],
        assessments: [],
        completenessScore: 0
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export utility function to check if AI is available
export async function isAIFeatureAvailable(module: string, featureKey: string): Promise<boolean> {
  const status = await aiService.checkFeatureStatus(module, featureKey);
  return status ? status.enabled : false;
}
