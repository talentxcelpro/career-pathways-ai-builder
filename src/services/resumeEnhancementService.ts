import { supabase } from "@/integrations/supabase/client";

export type EnhancementAction = 
  | "enhance_section" 
  | "generate_summary" 
  | "optimize_for_job" 
  | "suggest_bullets";

export interface EnhanceResumeRequest {
  action: EnhancementAction;
  content: string;
  jobDescription?: string;
}

export interface EnhanceResumeResponse {
  success: boolean;
  enhanced: string;
  action: EnhancementAction;
  error?: string;
}

/**
 * Call the enhance-resume edge function to get AI-powered resume enhancements
 */
export const enhanceResume = async (
  request: EnhanceResumeRequest
): Promise<EnhanceResumeResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-resume', {
      body: request
    });

    if (error) {
      console.error('Error calling enhance-resume function:', error);
      throw new Error(error.message || 'Failed to enhance resume');
    }

    if (!data.success) {
      throw new Error(data.error || 'Enhancement failed');
    }

    return data;
  } catch (error) {
    console.error('Resume enhancement error:', error);
    throw error;
  }
};

/**
 * Enhance a specific section of the resume
 */
export const enhanceSection = async (content: string): Promise<string> => {
  const response = await enhanceResume({
    action: "enhance_section",
    content
  });
  return response.enhanced;
};

/**
 * Generate a professional summary
 */
export const generateSummary = async (resumeContent: string): Promise<string> => {
  const response = await enhanceResume({
    action: "generate_summary",
    content: resumeContent
  });
  return response.enhanced;
};

/**
 * Optimize resume for a specific job description
 */
export const optimizeForJob = async (
  resumeContent: string, 
  jobDescription: string
): Promise<string> => {
  const response = await enhanceResume({
    action: "optimize_for_job",
    content: resumeContent,
    jobDescription
  });
  return response.enhanced;
};

/**
 * Generate bullet points for a job experience
 */
export const suggestBullets = async (jobInfo: string): Promise<string> => {
  const response = await enhanceResume({
    action: "suggest_bullets",
    content: jobInfo
  });
  return response.enhanced;
};
