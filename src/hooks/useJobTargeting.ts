import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JobTargetingAnalysis {
  matchScore: number;
  jdKeywords: string[];
  resumeKeywords: string[];
  matched: string[];
  missing: string[];
  recommendations: string[];
  sectionsToUpdate: { section: 'summary' | 'experience' | 'skills' | 'projects' | 'education'; suggestions: string[] }[];
}

export const useJobTargeting = (resumeData: any) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JobTargetingAnalysis | null>(null);

  const analyze = useCallback(async (jobDescription: string) => {
    if (!jobDescription?.trim()) {
      toast.error('Please paste a job description first.');
      return;
    }
    if (!resumeData) {
      toast.error('Resume data not available.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-enhancer', {
        body: {
          action: 'keyword_match',
          resumeData,
          jobDescription,
        },
      });

      if (error) throw error;

      setResult(data?.analysis || null);
      if (data?.analysis) {
        toast.success('Job match analysis ready');
      }
    } catch (e: any) {
      console.error('Job targeting failed:', e);
      toast.error(e?.message || 'Failed to analyze job description');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeData]);

  const reset = useCallback(() => setResult(null), []);

  return { isAnalyzing, result, analyze, reset };
};
