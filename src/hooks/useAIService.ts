import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AIRequest {
  module: string;
  task: string;
  input: any;
  userId?: string;
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId?: string;
}

export const useAIService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = async (request: AIRequest): Promise<AIResponse> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent', {
        body: request
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as AIResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Resume scoring
  const scoreResume = async (resumeText: string, jobDescription?: string) => {
    return await callAI({
      module: 'resume_builder',
      task: 'score',
      input: { resumeText, jobDescription }
    });
  };

  // Job matching
  const matchJobs = async (userProfile: any, jobListings: any[], preferences: any) => {
    return await callAI({
      module: 'jobs',
      task: 'match',
      input: { userProfile, jobListings, preferences }
    });
  };

  // Career path generation
  const generateCareerPath = async (
    currentRole: string,
    targetRole: string,
    skills: string[],
    experience: string,
    timeframe: string
  ) => {
    return await callAI({
      module: 'career_map',
      task: 'generate',
      input: { currentRole, targetRole, skills, experience, timeframe }
    });
  };

  // Course recommendations
  const recommendCourses = async (
    userProfile: any,
    careerGoals: any,
    skillGaps: string[],
    learningPreferences: any
  ) => {
    return await callAI({
      module: 'learning',
      task: 'recommend',
      input: { userProfile, careerGoals, skillGaps, learningPreferences }
    });
  };

  // Job description generation
  const generateJobDescription = async (
    jobTitle: string,
    companyInfo: any,
    requirements: string[],
    benefits: string[]
  ) => {
    return await callAI({
      module: 'employer',
      task: 'generate_jd',
      input: { jobTitle, companyInfo, requirements, benefits }
    });
  };

  return {
    loading,
    error,
    callAI,
    scoreResume,
    matchJobs,
    generateCareerPath,
    recommendCourses,
    generateJobDescription
  };
};