import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserRole = 'admin' | 'job_seeker' | 'employer' | 'candidate';

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('user_role', roleFilter as UserRole);
      }

      if (statusFilter === 'active') {
        query = query.eq('profile_completed', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('profile_completed', false);
      }

      const { data: profilesData, error: profilesError } = await query.limit(50);
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      return profilesData || [];
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: employers },
        { count: jobSeekers },
        { count: candidates }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_completed', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'employer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'job_seeker'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'candidate')
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        employers: employers || 0,
        candidates: (jobSeekers || 0) + (candidates || 0)
      };
    }
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      // For now, we'll update the profile_completed status as a proxy for active/inactive
      const { error } = await supabase
        .from('profiles')
        .update({ profile_completed: isActive })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user status');
    }
  });

  const handleUserAction = (userId: string, action: string) => {
    switch (action) {
      case 'activate':
        updateUserStatus.mutate({ userId, isActive: true });
        break;
      case 'deactivate':
        updateUserStatus.mutate({ userId, isActive: false });
        break;
      default:
        toast.info(`Action ${action} not implemented yet`);
    }
  };

  const filteredUsers = users || [];

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    users,
    isLoading,
    userStats,
    handleUserAction,
    filteredUsers,
    refetch
  };
};
