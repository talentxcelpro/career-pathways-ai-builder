import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserRoleData {
  role: 'super_admin' | 'admin' | 'moderator' | 'employer' | 'user';
  is_active: boolean;
  created_at: string;
}

export interface DashboardConfig {
  user_id: string;
  layout_type: 'student' | 'employer' | 'college_admin' | 'default';
  widget_preferences: Record<string, any>;
  quick_actions: string[];
  notification_settings: Record<string, boolean>;
  last_updated: string;
}

export function useUserRole() {
  const { user } = useAuth();

  const { data: userRole, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // No role found, default to 'user'
        return { role: 'user', is_active: true } as UserRoleData;
      }
      
      return data as UserRoleData;
    },
    enabled: !!user?.id,
  });

  const { data: isEmployer, isLoading: employerLoading } = useQuery({
    queryKey: ['is-employer', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('company_team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      return !error && !!data;
    },
    enabled: !!user?.id,
  });

  const { data: isCollegeAdmin, isLoading: collegeLoading } = useQuery({
    queryKey: ['is-college-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('college_admins')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();

      return !error && !!data;
    },
    enabled: !!user?.id,
  });

  const getDashboardType = (): 'student' | 'employer' | 'college_admin' | 'admin' | 'default' => {
    if (userRole?.role === 'super_admin' || userRole?.role === 'admin') return 'admin';
    if (isCollegeAdmin) return 'college_admin';
    if (isEmployer) return 'employer';
    return 'student';
  };

  const isLoading = roleLoading || employerLoading || collegeLoading;

  return {
    userRole,
    isEmployer,
    isCollegeAdmin,
    dashboardType: getDashboardType(),
    isLoading
  };
}