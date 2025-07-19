
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ResumeParseRequest {
  resumeText: string;
  userId?: string;
}

interface RoadmapGenerateRequest {
  currentRole: string;
  targetRole: string;
  experienceLevel: string;
  currentSkills: Array<{
    name: string;
    proficiency: number;
    category: string;
  }>;
  timeframe: number;
  learningPreferences?: string;
  userId?: string;
}

interface SkillsGapRequest {
  currentSkills: Array<{
    name: string;
    proficiency: number;
    category: string;
  }>;
  targetRole: string;
  industryFocus?: string;
  userId?: string;
}

interface CareerSwitchRiskRequest {
  currentRole: string;
  targetRole: string;
  experienceLevel: string;
  currentSkills: Array<{
    name: string;
    proficiency: number;
    category: string;
  }>;
  userId?: string;
}

interface MarketDataRequest {
  targetRole: string;
  location?: string;
  industryFocus?: string;
}

export const useAICareerMapping = () => {
  const parseResume = useMutation({
    mutationFn: async (request: ResumeParseRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Resume parsed successfully!');
    },
    onError: (error: any) => {
      console.error('Resume parsing error:', error);
      toast.error(error.message || 'Failed to parse resume');
    }
  });

  const generateRoadmap = useMutation({
    mutationFn: async (request: RoadmapGenerateRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-career-roadmap-generator', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Career roadmap generated successfully!');
    },
    onError: (error: any) => {
      console.error('Roadmap generation error:', error);
      toast.error(error.message || 'Failed to generate roadmap');
    }
  });

  const analyzeSkillsGap = useMutation({
    mutationFn: async (request: SkillsGapRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-skills-gap-analyzer', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Skills gap analysis completed!');
    },
    onError: (error: any) => {
      console.error('Skills gap analysis error:', error);
      toast.error(error.message || 'Failed to analyze skills gap');
    }
  });

  const analyzeCareerSwitchRisk = useMutation({
    mutationFn: async (request: CareerSwitchRiskRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-career-switch-risk', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Career switch risk analysis completed!');
    },
    onError: (error: any) => {
      console.error('Career switch risk analysis error:', error);
      toast.error(error.message || 'Failed to analyze career switch risk');
    }
  });

  const fetchMarketData = useMutation({
    mutationFn: async (request: MarketDataRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-market-data-sync', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Market data updated successfully!');
    },
    onError: (error: any) => {
      console.error('Market data fetch error:', error);
      toast.error(error.message || 'Failed to fetch market data');
    }
  });

  return {
    parseResume,
    generateRoadmap,
    analyzeSkillsGap,
    analyzeCareerSwitchRisk,
    fetchMarketData,
    isParsingResume: parseResume.isPending,
    isGeneratingRoadmap: generateRoadmap.isPending,
    isAnalyzingSkillsGap: analyzeSkillsGap.isPending,
    isAnalyzingRisk: analyzeCareerSwitchRisk.isPending,
    isFetchingMarketData: fetchMarketData.isPending
  };
};
