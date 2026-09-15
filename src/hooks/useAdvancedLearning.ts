import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced Learning Platform Hooks

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty_level: string;
  market_demand_score: number;
  average_salary: number;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: number;
  last_practiced_at: string;
  total_practice_hours: number;
  achievement_badges: string[];
  skills: Skill;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  target_role: string;
  difficulty_level: string;
  estimated_duration_weeks: number;
  course_ids: string[];
  skills_gained: string[];
  prerequisites: string[];
  industry_alignment: string;
  job_market_score: number;
  salary_potential: number;
  is_ai_curated: boolean;
}

export interface AITutorSession {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  conversation_context: any;
  learning_objectives: string[];
  difficulty_adaptation: string;
  teaching_style: string;
}

export interface InteractiveExercise {
  id: string;
  lesson_id: string;
  exercise_type: 'coding' | 'quiz' | 'simulation' | 'project';
  title: string;
  instructions: string;
  starter_code?: string;
  solution_code?: string;
  test_cases: any[];
  hints: string[];
  difficulty_level: number;
  estimated_time_minutes: number;
  technologies: string[];
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  icon_url?: string;
  points_earned: number;
  rarity_level: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at: string;
}

// Skills Management
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('market_demand_score', { ascending: false });
      
      if (error) throw error;
      return data as Skill[];
    }
  });
};

export const useUserSkills = (userId?: string) => {
  return useQuery({
    queryKey: ['user-skills', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_skills')
        .select(`
          *,
          skills(*)
        `)
        .eq('user_id', userId)
        .order('proficiency_level', { ascending: false });
      
      if (error) throw error;
      return data as UserSkill[];
    },
    enabled: !!userId
  });
};

// Learning Paths
export const useLearningPaths = (filters?: {
  difficulty?: string;
  target_role?: string;
  industry?: string;
}) => {
  return useQuery({
    queryKey: ['learning-paths', filters],
    queryFn: async () => {
      let query = supabase
        .from('learning_paths')
        .select('*')
        .order('job_market_score', { ascending: false });

      if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }
      
      if (filters?.target_role) {
        query = query.ilike('target_role', `%${filters.target_role}%`);
      }
      
      if (filters?.industry) {
        query = query.eq('industry_alignment', filters.industry);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LearningPath[];
    }
  });
};

// AI Tutor Integration
export const useAITutor = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startTutorSession = async (params: {
    userId: string;
    courseId: string;
    lessonId?: string;
    userMessage: string;
    sessionId?: string;
    learningObjectives?: string[];
    difficulty?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('AI Tutor Error:', error);
      toast.error('AI Tutor is temporarily unavailable');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startTutorSession,
    isLoading
  };
};

// Skills Assessment
export const useSkillsAssessment = () => {
  const [isLoading, setIsLoading] = useState(false);

  const runAssessment = async (params: {
    userId: string;
    skillArea?: string;
    assessmentType?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('skills-assessment', {
        body: params
      });

      if (error) throw error;
      
      toast.success('Skills assessment completed!');
      return data;
    } catch (error) {
      console.error('Skills Assessment Error:', error);
      toast.error('Skills assessment failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    runAssessment,
    isLoading
  };
};

// Interactive Exercises
export const useInteractiveExercises = (lessonId?: string) => {
  return useQuery({
    queryKey: ['interactive-exercises', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      
      const { data, error } = await supabase
        .from('interactive_exercises')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('difficulty_level');
      
      if (error) throw error;
      return data as InteractiveExercise[];
    },
    enabled: !!lessonId
  });
};

export const useSubmitExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      exerciseId: string;
      submissionCode?: string;
      testResults?: any[];
      score?: number;
      completionTimeMinutes?: number;
      hintsUsed?: number;
    }) => {
      const { data, error } = await supabase
        .from('exercise_submissions')
        .insert({
          user_id: params.userId,
          exercise_id: params.exerciseId,
          submission_code: params.submissionCode,
          test_results: params.testResults || [],
          score: params.score || 0,
          completion_time_minutes: params.completionTimeMinutes,
          hints_used: params.hintsUsed || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Exercise submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['exercise-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
    onError: () => {
      toast.error('Failed to submit exercise');
    }
  });
};

// User Achievements
export const useUserAchievements = (userId?: string) => {
  return useQuery({
    queryKey: ['user-achievements', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!userId
  });
};

// Course Enhancement
export const useCourseEnhancement = () => {
  const queryClient = useQueryClient();

  const enhanceCourse = useMutation({
    mutationFn: async (params: {
      action: 'generate_comprehensive_course' | 'enhance_existing_course' | 'create_interactive_exercises';
      topic?: string;
      difficulty_level?: string;
      duration_hours?: number;
      course_id?: string;
      include_youtube_videos?: boolean;
      include_exercises?: boolean;
      include_projects?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('course-enhancement', {
        body: params
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course-modules'] });
      queryClient.invalidateQueries({ queryKey: ['course-lessons'] });
      toast.success('Course enhancement completed successfully!');
    },
    onError: (error) => {
      console.error('Course enhancement failed:', error);
      toast.error('Course enhancement failed');
    }
  });

  return {
    enhanceCourse: enhanceCourse.mutate,
    isLoading: enhanceCourse.isPending,
    data: enhanceCourse.data,
    error: enhanceCourse.error
  };
};

// Mass Course Generation
export const useCourseMassGeneration = () => {
  const queryClient = useQueryClient();

  const generateCourses = useMutation({
    mutationFn: async (options: {
      action: string;
      count: number;
      categories: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke('mass-course-population', {
        body: options
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      toast.success(`Successfully generated ${data.courses_created} courses!`);
    },
    onError: (error) => {
      console.error('Mass course generation failed:', error);
      toast.error('Failed to generate courses');
    }
  });

  return {
    generateCourses: generateCourses.mutate,
    isLoading: generateCourses.isPending,
    data: generateCourses.data,
    error: generateCourses.error
  };
};

// Text-to-Speech
export const useTextToSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateSpeech = async (params: {
    text: string;
    voice?: string;
    speed?: number;
    lessonId?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Text-to-Speech Error:', error);
      toast.error('Speech generation failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateSpeech,
    isLoading
  };
};

// Learning Analytics
export const useLearningAnalytics = (userId?: string) => {
  return useQuery({
    queryKey: ['learning-analytics', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_learning_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });
};