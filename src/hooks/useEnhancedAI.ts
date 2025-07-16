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
      // Validate required fields
      if (!request.module || !request.task) {
        throw new Error('Module and task are required');
      }

      // 1. TEST AUTHENTICATION STATUS FIRST
      console.log('🔐 Checking authentication status...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Authentication error: Unable to verify session');
      }
      
      if (!session) {
        console.error('❌ No active session');
        throw new Error('Authentication required: Please log in and try again');
      }
      
      console.log('✅ Authentication verified, user:', session.user.email);
      console.log('🔑 Token expires at:', new Date(session.expires_at * 1000));
      
      // Check if token is about to expire (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = session.expires_at - now;
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        console.log('⚠️ Token expiring soon, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          throw new Error('Session expired: Please refresh the page and log in again');
        }
        
        console.log('✅ Token refreshed successfully');
      }

      // 2. TEST WITH SIMPLER FUNCTION FIRST (NO AUTH REQUIRED)
      console.log('🧪 Testing connectivity with test function (no auth)...');
      try {
        const testResult = await supabase.functions.invoke('test-function', {
          body: { test: true, timestamp: Date.now() }
        });
        
        if (testResult.error) {
          console.error('❌ Test function failed:', testResult.error);
          throw new Error(`Basic connectivity failed: ${testResult.error.message}`);
        }
        
        console.log('✅ Basic connectivity test succeeded:', testResult.data);
      } catch (testError) {
        console.error('❌ Test function error:', testError);
        throw new Error(`Network connectivity test failed: ${testError.message}`);
      }

      // 3. TEST AI FUNCTION WITH SIMPLE PING (AUTH REQUIRED)
      console.log('🧪 Testing AI function with authentication...');
      try {
        const pingResult = await supabase.functions.invoke('ai-agent', {
          body: {
            module: 'test',
            task: 'ping',
            input: { test: true }
          }
        });
        
        if (pingResult.error) {
          console.error('❌ AI function ping failed:', pingResult.error);
          
          // Check if it's an authentication issue
          if (pingResult.error.message?.includes('401') || pingResult.error.message?.includes('403')) {
            console.log('🔄 Authentication issue detected, attempting token refresh...');
            const { error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              throw new Error(`Authentication failed: ${refreshError.message}. Please refresh the page and log in again.`);
            }
            
            // Retry after refresh
            const retryResult = await supabase.functions.invoke('ai-agent', {
              body: {
                module: 'test',
                task: 'ping',
                input: { test: true }
              }
            });
            
            if (retryResult.error) {
              throw new Error(`AI function authentication still failing after refresh: ${retryResult.error.message}`);
            }
            
            console.log('✅ AI function authentication test succeeded after refresh:', retryResult.data);
          } else {
            throw new Error(`AI function connectivity failed: ${pingResult.error.message}`);
          }
        } else {
          console.log('✅ AI function authentication test succeeded:', pingResult.data);
        }
      } catch (pingError) {
        console.error('❌ AI function ping error:', pingError);
        
        // If authentication fails, provide helpful guidance
        if (pingError.message?.includes('401') || pingError.message?.includes('403') || pingError.message?.includes('Authentication')) {
          throw new Error(`Authentication required: Please refresh the page and log in again. ${pingError.message}`);
        }
        
        throw new Error(`AI function test failed: ${pingError.message}`);
      }

      // Generate user message content for chat
      let userMessage = '';
      if (request.task === 'chat' && request.input?.message) {
        userMessage = request.input.message;
      } else {
        userMessage = `${request.task} in ${request.module}`;
      }

      // Add user message to context
      addMessage({
        type: 'user',
        content: userMessage,
        module: request.module,
        metadata: request.input
      });

      // Create clean request payload that exactly matches Edge Function expectations
      const requestPayload = {
        module: request.module,
        task: request.task,
        input: request.input || {},
        userId: userProfile?.id || null,
        prompt: request.task === 'chat' ? request.input?.message : undefined
      };

      console.log('🚀 Sending AI request:', JSON.stringify(requestPayload, null, 2));

      // Add timeout and retry logic with exponential backoff and direct fetch fallback
      const makeRequest = async (attempt = 1): Promise<any> => {
        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
          );

          // Try Supabase client first
          console.log(`🔄 Attempt ${attempt}: Using Supabase client...`);
          const requestPromise = supabase.functions.invoke('ai-agent', {
            body: requestPayload,
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const result = await Promise.race([requestPromise, timeoutPromise]);
          console.log('✅ Supabase client request succeeded');
          return result;

        } catch (error) {
          console.log(`❌ Supabase client failed on attempt ${attempt}:`, error.message);
          
          // Try direct fetch as fallback
          try {
            console.log(`🔄 Attempt ${attempt}: Falling back to direct fetch...`);
            
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              throw new Error('No session for direct fetch');
            }

            const functionUrl = `https://dthlgsnakhoftinssokm.supabase.co/functions/v1/ai-agent`;
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Direct fetch timed out after 30 seconds')), 30000)
            );

            const fetchPromise = fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
                'Content-Type': 'application/json',
                'cache-control': 'no-cache'
              },
              body: JSON.stringify(requestPayload)
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Direct fetch request succeeded');
            return { data, error: null };

          } catch (fetchError) {
            console.log(`❌ Direct fetch failed on attempt ${attempt}:`, fetchError.message);
            
            // Retry with exponential backoff if we haven't exhausted attempts
            if (attempt < 3) {
              const delay = Math.pow(2, attempt) * 1000;
              console.log(`⏳ Retry attempt ${attempt + 1} after ${delay}ms delay`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return makeRequest(attempt + 1);
            }
            
            // If all attempts failed, throw the most informative error
            throw new Error(`Both Supabase client and direct fetch failed. Last errors: Supabase: ${error.message}, Direct: ${fetchError.message}`);
          }
        }
      };

      const result = await makeRequest();
      const { data, error } = result;

      console.log('📡 Raw response:', { data, error });

      if (error) {
        console.error('❌ Supabase function invoke error:', error);
        
        // Enhanced error handling with specific messages
        if (error.message?.includes('Failed to fetch')) {
          throw new Error('Failed to send a request to the Edge Function\nIncorrect or Missing Supabase Service URL');
        } else if (error.message?.includes('Function not found') || error.message?.includes('404')) {
          throw new Error('AI service function not found or not deployed properly');
        } else if (error.message?.includes('403') || error.message?.includes('Unauthorized')) {
          throw new Error('Authentication failed - please refresh the page and try again');
        } else if (error.message?.includes('timeout')) {
          throw new Error('Request timed out - the AI service may be overloaded');
        } else if (error.message?.includes('CORS')) {
          throw new Error('Cross-origin request blocked - check function CORS configuration');
        } else {
          throw new Error(`Service error: ${error.message}`);
        }
      }

      if (!data) {
        throw new Error('No response received from AI service');
      }

      console.log('✅ AI response received:', JSON.stringify(data, null, 2));

      // Handle the response structure from Edge Function
      if (data.success) {
        const aiResponse = data.response || data.data;
        
        if (!aiResponse) {
          throw new Error('Empty response received from AI service');
        }
        
        // Add AI response to context
        addMessage({
          type: 'ai',
          content: typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse, null, 2),
          module: request.module,
          metadata: { 
            tokens_used: data.tokens_used,
            requestId: data.requestId 
          }
        });

        return {
          success: true,
          data: aiResponse,
          requestId: data.requestId,
          confidence: data.confidence
        };
      } else {
        throw new Error(data.error || 'AI processing failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('💥 AI request failed:', errorMessage, err);
      
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