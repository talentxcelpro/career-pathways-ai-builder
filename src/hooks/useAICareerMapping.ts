
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

interface AIRecommendationRequest {
  userId: string;
  userProgress: any;
  currentSkills: Array<{
    name: string;
    proficiency: number;
    category: string;
  }>;
  targetRole: string;
  learningPreferences?: any;
}

interface ProgressTrackingRequest {
  userId: string;
  roadmapId?: string;
  taskId?: string;
  phaseId?: string;
  completionData?: any;
  skillProgress?: any;
  action: 'complete_task' | 'complete_phase' | 'update_skill_progress' | 'log_activity' | 'get_progress_summary';
}

interface CoachingRequest {
  userId: string;
  coachingType?: 'weekly_checkin' | 'monthly_review' | 'milestone_celebration';
}

interface JobBoardRequest {
  jobRole: string;
  location?: string;
  experience: string;
  skills?: string[];
  limit?: number;
}

interface LearningPlatformRequest {
  skills: string[];
  targetRole: string;
  learningLevel?: string;
  preferredFormat?: string;
}

interface SalaryDataRequest {
  role: string;
  location?: string;
  experienceLevel?: string;
  industry?: string;
  companySize?: string;
}

interface SkillsFrameworkRequest {
  targetRole: string;
  industry?: string;
  action?: string;
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

  const getAIRecommendations = useMutation({
    mutationFn: async (request: AIRecommendationRequest) => {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('AI recommendations generated!');
    },
    onError: (error: any) => {
      console.error('AI recommendations error:', error);
      toast.error(error.message || 'Failed to get recommendations');
    }
  });

  const trackProgress = useMutation({
    mutationFn: async (request: ProgressTrackingRequest) => {
      const { data, error } = await supabase.functions.invoke('progress-tracker', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Progress updated successfully!');
    },
    onError: (error: any) => {
      console.error('Progress tracking error:', error);
      toast.error(error.message || 'Failed to update progress');
    }
  });

  const getCoaching = useMutation({
    mutationFn: async (request: CoachingRequest) => {
      const { data, error } = await supabase.functions.invoke('automated-coaching', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Coaching session generated!');
    },
    onError: (error: any) => {
      console.error('Coaching error:', error);
      toast.error(error.message || 'Failed to get coaching');
    }
  });

  const searchJobs = useMutation({
    mutationFn: async (request: JobBoardRequest) => {
      const { data, error } = await supabase.functions.invoke('job-board-integration', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Job search completed!');
    },
    onError: (error: any) => {
      console.error('Job search error:', error);
      toast.error(error.message || 'Failed to search jobs');
    }
  });

  const syncLearningPlatforms = useMutation({
    mutationFn: async (request: LearningPlatformRequest) => {
      const { data, error } = await supabase.functions.invoke('learning-platform-sync', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Learning courses synced!');
    },
    onError: (error: any) => {
      console.error('Learning platform sync error:', error);
      toast.error(error.message || 'Failed to sync learning platforms');
    }
  });

  const getSalaryData = useMutation({
    mutationFn: async (request: SalaryDataRequest) => {
      const { data, error } = await supabase.functions.invoke('industry-salary-data', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Salary data retrieved!');
    },
    onError: (error: any) => {
      console.error('Salary data error:', error);
      toast.error(error.message || 'Failed to get salary data');
    }
  });

  const getSkillsFramework = useMutation({
    mutationFn: async (request: SkillsFrameworkRequest) => {
      const { data, error } = await supabase.functions.invoke('skills-database-sync', {
        body: request
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Skills framework loaded!');
    },
    onError: (error: any) => {
      console.error('Skills framework error:', error);
      toast.error(error.message || 'Failed to load skills framework');
    }
  });

  return {
    parseResume,
    generateRoadmap,
    analyzeSkillsGap,
    analyzeCareerSwitchRisk,
    fetchMarketData,
    getAIRecommendations,
    trackProgress,
    getCoaching,
    searchJobs,
    syncLearningPlatforms,
    getSalaryData,
    getSkillsFramework,
    isParsingResume: parseResume.isPending,
    isGeneratingRoadmap: generateRoadmap.isPending,
    isAnalyzingSkillsGap: analyzeSkillsGap.isPending,
    isAnalyzingRisk: analyzeCareerSwitchRisk.isPending,
    isFetchingMarketData: fetchMarketData.isPending,
    isGettingRecommendations: getAIRecommendations.isPending,
    isTrackingProgress: trackProgress.isPending,
    isGettingCoaching: getCoaching.isPending,
    isSearchingJobs: searchJobs.isPending,
    isSyncingLearning: syncLearningPlatforms.isPending,
    isGettingSalaryData: getSalaryData.isPending,
    isGettingSkillsFramework: getSkillsFramework.isPending
  };
};
