import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSmartEnhancement = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const enhanceSection = useCallback(async (
    section: 'summary' | 'experience' | 'skills' | 'education',
    content: string,
    options?: {
      targetRole?: string;
      industry?: string;
      style?: string;
    }
  ) => {
    setIsEnhancing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhance-section', {
        body: {
          section,
          content,
          targetRole: options?.targetRole,
          industry: options?.industry,
          style: options?.style
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Enhancement failed');

      toast.success(`${section} enhanced successfully!`);
      return data.enhanced;
    } catch (error) {
      console.error('Section enhancement error:', error);
      toast.error(`Failed to enhance ${section}`);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  const getSmartSuggestions = useCallback(async (
    resumeData: any,
    options?: {
      targetRole?: string;
      industry?: string;
      marketTrends?: any;
    }
  ) => {
    setIsGeneratingSuggestions(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('smart-suggestions', {
        body: {
          resumeData,
          targetRole: options?.targetRole,
          industry: options?.industry,
          marketTrends: options?.marketTrends
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Suggestion generation failed');

      toast.success(`Generated ${data.count} smart suggestions`);
      return data.suggestions;
    } catch (error) {
      console.error('Smart suggestions error:', error);
      toast.error('Failed to generate suggestions');
      return [];
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, []);

  const optimizeForJob = useCallback(async (
    resumeData: any,
    jobDescription: string,
    optimizationLevel: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  ) => {
    setIsEnhancing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('job-specific-optimizer', {
        body: {
          resumeData,
          jobDescription,
          optimizationLevel
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Optimization failed');

      toast.success('Resume optimized for target job!');
      return {
        optimizedResume: data.optimizedResume,
        changes: data.changes,
        improvement: data.matchScore
      };
    } catch (error) {
      console.error('Job optimization error:', error);
      toast.error('Failed to optimize resume');
      return null;
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  return {
    enhanceSection,
    getSmartSuggestions,
    optimizeForJob,
    isEnhancing,
    isGeneratingSuggestions
  };
};
