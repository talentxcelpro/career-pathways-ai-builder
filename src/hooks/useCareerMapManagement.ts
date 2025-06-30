
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CareerGoalWithProfile = {
  id: string;
  user_id: string;
  target_role: string;
  current_position: string;
  timeline_months: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  skills_needed: string[];
  target_company: string;
  milestones: any;
  progress_notes: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
};

type CareerSwitchWithProfile = {
  id: string;
  user_id: string;
  from_role: string;
  to_role: string;
  from_industry: string;
  to_industry: string;
  difficulty_score: number;
  created_at: string;
  updated_at: string;
  time_estimate_months: number;
  salary_change_percentage: number;
  risk_factors: any;
  opportunities: any;
  required_skills: any;
  recommended_steps: any;
  market_demand_score: number;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
};

export const useCareerMapManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: careerMapStats } = useQuery({
    queryKey: ['career-map-stats'],
    queryFn: async () => {
      const [
        { count: totalRoadmaps },
        { count: totalGoals },
        { count: careerSwitches },
        { count: activeUsers }
      ] = await Promise.all([
        supabase.from('career_goals').select('*', { count: 'exact', head: true }),
        supabase.from('career_goals').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('career_switches').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('last_login_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalRoadmaps: totalRoadmaps || 0,
        activeGoals: totalGoals || 0,
        careerSwitches: careerSwitches || 0,
        activeUsers: activeUsers || 0
      };
    }
  });

  const { data: careerGoals, isLoading } = useQuery({
    queryKey: ['career-goals', searchTerm],
    queryFn: async (): Promise<CareerGoalWithProfile[]> => {
      let query = supabase
        .from('career_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`target_role.ilike.%${searchTerm}%,current_position.ilike.%${searchTerm}%`);
      }

      const { data: goals, error } = await query;
      if (error) throw error;

      if (goals && goals.length > 0) {
        const userIds = goals.map(goal => goal.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        return goals.map(goal => ({
          ...goal,
          profiles: profiles?.find(profile => profile.id === goal.user_id)
        }));
      }

      return goals || [];
    }
  });

  const { data: careerSwitches } = useQuery({
    queryKey: ['career-switches'],
    queryFn: async (): Promise<CareerSwitchWithProfile[]> => {
      const { data: switches, error } = await supabase
        .from('career_switches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      if (switches && switches.length > 0) {
        const userIds = switches.map(switchData => switchData.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        return switches.map(switchData => ({
          ...switchData,
          profiles: profiles?.find(profile => profile.id === switchData.user_id)
        }));
      }

      return switches || [];
    }
  });

  const deleteCareerGoal = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('career_goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Career goal deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['career-goals'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete career goal');
    }
  });

  return {
    searchTerm,
    setSearchTerm,
    careerMapStats,
    careerGoals,
    careerSwitches,
    isLoading,
    deleteCareerGoal: (goalId: string) => deleteCareerGoal.mutate(goalId)
  };
};
