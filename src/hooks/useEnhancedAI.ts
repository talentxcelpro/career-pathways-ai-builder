import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAI } from '@/contexts/AIContext';
import { toast } from 'sonner';

interface EnhancedAIRequest {
  module: string;
  task: string;
  input: any;
  context?: any;
  userId?: string;
}

interface EnhancedAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId?: string;
  suggestions?: string[];
  confidence?: number;
}

export const useEnhancedAI = () => {
  const { currentModule, userProfile, sessionId, addMessage, setLoading, setError } = useAI();
  const [processing, setProcessing] = useState(false);

  const callEnhancedAI = useCallback(async (request: EnhancedAIRequest): Promise<EnhancedAIResponse> => {
    setProcessing(true);
    setLoading(true);
    setError(null);

    try {
      // Add user message to context
      addMessage({
        type: 'user',
        content: `${request.task} in ${request.module}`,
        module: request.module,
        metadata: request.input
      });

      const enhancedRequest = {
        ...request,
        module: request.module || currentModule,
        context: {
          userProfile,
          sessionId,
          currentModule,
          timestamp: new Date().toISOString(),
          ...request.context
        },
        userId: userProfile?.id
      };

      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: enhancedRequest
      });

      if (error) {
        throw new Error(error.message);
      }

      const response = data as EnhancedAIResponse;

      // Add AI response to context
      if (response.success && response.data) {
        addMessage({
          type: 'ai',
          content: typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2),
          module: request.module || currentModule,
          metadata: response
        });
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(`AI Error: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  }, [currentModule, userProfile, sessionId, addMessage, setLoading, setError]);

  // Network Module AI Functions
  const generatePost = useCallback(async (topic: string, tone: 'professional' | 'casual' | 'thought-leadership' = 'professional') => {
    return await callEnhancedAI({
      module: 'network',
      task: 'generate_post',
      input: { topic, tone }
    });
  }, [callEnhancedAI]);

  const suggestConnections = useCallback(async (industry?: string, role?: string) => {
    return await callEnhancedAI({
      module: 'network',
      task: 'suggest_connections',
      input: { industry, role }
    });
  }, [callEnhancedAI]);

  const optimizeProfile = useCallback(async (section: 'summary' | 'headline' | 'experience' | 'all' = 'all') => {
    return await callEnhancedAI({
      module: 'network',
      task: 'optimize_profile',
      input: { section }
    });
  }, [callEnhancedAI]);

  // Jobs Module AI Functions
  const matchJobs = useCallback(async (preferences?: any) => {
    return await callEnhancedAI({
      module: 'jobs',
      task: 'match_jobs',
      input: { preferences }
    });
  }, [callEnhancedAI]);

  const tailorResume = useCallback(async (jobId: string, jobDescription: string) => {
    return await callEnhancedAI({
      module: 'jobs',
      task: 'tailor_resume',
      input: { jobId, jobDescription }
    });
  }, [callEnhancedAI]);

  const prepareInterview = useCallback(async (jobId: string, companyName: string, role: string) => {
    return await callEnhancedAI({
      module: 'jobs',
      task: 'prepare_interview',
      input: { jobId, companyName, role }
    });
  }, [callEnhancedAI]);

  // Employer Module AI Functions
  const generateJobDescription = useCallback(async (
    jobTitle: string,
    companyInfo: any,
    requirements: string[],
    benefits: string[]
  ) => {
    return await callEnhancedAI({
      module: 'employer',
      task: 'generate_jd',
      input: { jobTitle, companyInfo, requirements, benefits }
    });
  }, [callEnhancedAI]);

  const rankCandidates = useCallback(async (jobId: string, candidates: any[]) => {
    return await callEnhancedAI({
      module: 'employer',
      task: 'rank_candidates',
      input: { jobId, candidates }
    });
  }, [callEnhancedAI]);

  const generateScreeningQuestions = useCallback(async (jobTitle: string, skills: string[]) => {
    return await callEnhancedAI({
      module: 'employer',
      task: 'screening_questions',
      input: { jobTitle, skills }
    });
  }, [callEnhancedAI]);

  // Companies Module AI Functions
  const analyzeCompany = useCallback(async (companyId: string, companyName: string) => {
    return await callEnhancedAI({
      module: 'companies',
      task: 'analyze_company',
      input: { companyId, companyName }
    });
  }, [callEnhancedAI]);

  const suggestRoles = useCallback(async (companyId: string) => {
    return await callEnhancedAI({
      module: 'companies',
      task: 'suggest_roles',
      input: { companyId }
    });
  }, [callEnhancedAI]);

  const assessCultureFit = useCallback(async (companyId: string) => {
    return await callEnhancedAI({
      module: 'companies',
      task: 'culture_fit',
      input: { companyId }
    });
  }, [callEnhancedAI]);

  // Resume Builder AI Functions
  const analyzeResume = useCallback(async (resumeText: string, targetRole?: string) => {
    return await callEnhancedAI({
      module: 'resume_builder',
      task: 'analyze',
      input: { resumeText, targetRole }
    });
  }, [callEnhancedAI]);

  const optimizeResume = useCallback(async (resumeText: string, jobDescription?: string) => {
    return await callEnhancedAI({
      module: 'resume_builder',
      task: 'optimize',
      input: { resumeText, jobDescription }
    });
  }, [callEnhancedAI]);

  const generateResumeSections = useCallback(async (sectionType: string, content: any) => {
    return await callEnhancedAI({
      module: 'resume_builder',
      task: 'generate_section',
      input: { sectionType, content }
    });
  }, [callEnhancedAI]);

  // Tools Module AI Functions
  const interpretAssessment = useCallback(async (assessmentType: string, results: any) => {
    return await callEnhancedAI({
      module: 'tools',
      task: 'interpret_assessment',
      input: { assessmentType, results }
    });
  }, [callEnhancedAI]);

  const generateDocument = useCallback(async (documentType: 'cv' | 'cover_letter' | 'portfolio', specifications: any) => {
    return await callEnhancedAI({
      module: 'tools',
      task: 'generate_document',
      input: { documentType, specifications }
    });
  }, [callEnhancedAI]);

  // Services Module AI Functions
  const recommendServices = useCallback(async (userActivity: any, goals: any) => {
    return await callEnhancedAI({
      module: 'services',
      task: 'recommend',
      input: { userActivity, goals }
    });
  }, [callEnhancedAI]);

  const suggestUpgrade = useCallback(async (currentPlan: string, usage: any) => {
    return await callEnhancedAI({
      module: 'services',
      task: 'suggest_upgrade',
      input: { currentPlan, usage }
    });
  }, [callEnhancedAI]);

  // Learning Module AI Functions
  const createLearningPath = useCallback(async (currentRole: string, targetRole: string, timeframe: string) => {
    return await callEnhancedAI({
      module: 'learning',
      task: 'create_path',
      input: { currentRole, targetRole, timeframe }
    });
  }, [callEnhancedAI]);

  const recommendCourses = useCallback(async (skillGaps: string[], preferences: any) => {
    return await callEnhancedAI({
      module: 'learning',
      task: 'recommend_courses',
      input: { skillGaps, preferences }
    });
  }, [callEnhancedAI]);

  const analyzeSkillGaps = useCallback(async (targetRole: string) => {
    return await callEnhancedAI({
      module: 'learning',
      task: 'skill_gaps',
      input: { targetRole }
    });
  }, [callEnhancedAI]);

  // Colleges Module AI Functions
  const recommendInstitutions = useCallback(async (program: string, preferences: any) => {
    return await callEnhancedAI({
      module: 'colleges',
      task: 'recommend_institutions',
      input: { program, preferences }
    });
  }, [callEnhancedAI]);

  const generateSOP = useCallback(async (program: string, background: any, goals: any) => {
    return await callEnhancedAI({
      module: 'colleges',
      task: 'generate_sop',
      input: { program, background, goals }
    });
  }, [callEnhancedAI]);

  const comparePrograms = useCallback(async (programs: any[]) => {
    return await callEnhancedAI({
      module: 'colleges',
      task: 'compare_programs',
      input: { programs }
    });
  }, [callEnhancedAI]);

  // Career Map AI Functions
  const generateCareerRoadmap = useCallback(async (
    currentRole: string,
    targetRole: string,
    timeframe: string,
    preferences: any
  ) => {
    return await callEnhancedAI({
      module: 'career_map',
      task: 'generate_roadmap',
      input: { currentRole, targetRole, timeframe, preferences }
    });
  }, [callEnhancedAI]);

  const trackMilestones = useCallback(async (goals: any[], progress: any) => {
    return await callEnhancedAI({
      module: 'career_map',
      task: 'track_milestones',
      input: { goals, progress }
    });
  }, [callEnhancedAI]);

  const assessCareerFit = useCallback(async (role: string) => {
    return await callEnhancedAI({
      module: 'career_map',
      task: 'assess_fit',
      input: { role }
    });
  }, [callEnhancedAI]);

  return {
    // Core functions
    callEnhancedAI,
    processing,
    
    // Network functions
    generatePost,
    suggestConnections,
    optimizeProfile,
    
    // Jobs functions
    matchJobs,
    tailorResume,
    prepareInterview,
    
    // Employer functions
    generateJobDescription,
    rankCandidates,
    generateScreeningQuestions,
    
    // Companies functions
    analyzeCompany,
    suggestRoles,
    assessCultureFit,
    
    // Resume Builder functions
    analyzeResume,
    optimizeResume,
    generateResumeSections,
    
    // Tools functions
    interpretAssessment,
    generateDocument,
    
    // Services functions
    recommendServices,
    suggestUpgrade,
    
    // Learning functions
    createLearningPath,
    recommendCourses,
    analyzeSkillGaps,
    
    // Colleges functions
    recommendInstitutions,
    generateSOP,
    comparePrograms,
    
    // Career Map functions
    generateCareerRoadmap,
    trackMilestones,
    assessCareerFit
  };
};