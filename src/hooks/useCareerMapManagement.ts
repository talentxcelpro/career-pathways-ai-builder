
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    queryFn: async () => {
      let query = supabase
        .from('career_goals')
        .select(`
          *,
          profiles!career_goals_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`target_role.ilike.%${searchTerm}%,current_position.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: careerSwitches } = useQuery({
    queryKey: ['career-switches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_switches')
        .select(`
          *,
          profiles!career_switches_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
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
