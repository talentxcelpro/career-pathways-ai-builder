import { supabase } from "@/integrations/supabase/client";

export interface ATSAnalysisResult {
  score: number;
  keywordScore: number;
  formatScore: number;
  contentScore: number;
  strengthsFound: string[];
  issuesFound: string[];
  recommendations: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
}

/**
 * Analyzes resume for ATS compatibility using AI
 */
export const analyzeATS = async (
  resumeData: any,
  jobDescription?: string
): Promise<ATSAnalysisResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('ats-analyzer', {
      body: { resumeData, jobDescription }
    });

    if (error) {
      console.error('Error calling ats-analyzer function:', error);
      throw new Error(error.message || 'Failed to analyze resume');
    }

    if (!data.success) {
      throw new Error(data.error || 'ATS analysis failed');
    }

    return data.analysis;
  } catch (error) {
    console.error('ATS analysis error:', error);
    throw error;
  }
};
