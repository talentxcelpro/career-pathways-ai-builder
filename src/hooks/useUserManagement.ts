
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        const validRoles = ['job_seeker', 'employer', 'admin'] as const;
        if (validRoles.includes(roleFilter as any)) {
          query = query.eq('user_role', roleFilter as 'job_seeker' | 'employer' | 'admin');
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: employers },
        { count: candidates }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).not('last_login_at', 'is', null),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_employer', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'job_seeker')
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        employers: employers || 0,
        candidates: candidates || 0
      };
    }
  });

  const handleUserAction = (userId: string, action: string) => {
    toast.info(`${action} action would be implemented here for user ${userId}`);
  };

  const filteredUsers = users?.filter(user => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.last_login_at) ||
      (statusFilter === 'inactive' && !user.last_login_at);
    
    return matchesStatus;
  }) || [];

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
    filteredUsers
  };
};
