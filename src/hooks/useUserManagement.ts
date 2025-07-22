
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserRole = 'admin' | 'job_seeker' | 'employer' | 'candidate';

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, statusFilter, verificationFilter, completionFilter, currentPage, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.ilike('full_name', `%${searchTerm}%`);
      }

      // Handle role filtering - for admin roles we'll filter in post-processing
      if (roleFilter !== 'all' && roleFilter !== 'admin') {
        query = query.eq('user_role', roleFilter as UserRole);
      }

      if (statusFilter === 'active') {
        query = query.eq('profile_completed', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('profile_completed', false);
      }

      // Note: email_verified field filtering will be implemented when database schema includes this field
      if (verificationFilter === 'verified') {
        // For now, use profile_completed as a proxy for verification
        query = query.eq('profile_completed', true);
      } else if (verificationFilter === 'unverified') {
        query = query.eq('profile_completed', false);
      }

      if (completionFilter !== 'all') {
      // Note: completion_percentage field filtering implementation
      if (completionFilter === 'low') {
        // Users with low completion (0-25%) - will be calculated client-side for now
      } else if (completionFilter === 'medium') {
        // Users with medium completion (26-75%)
      } else if (completionFilter === 'high') {
        // Users with high completion (76-100%)
      }
        // This will be enhanced when we add completion_percentage field
      }

      // Apply pagination only if pageSize is not 'all'
      if (pageSize !== -1) {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      const { data: profilesData, error: profilesError } = await query;
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Get all user roles for admin detection
      const { data: allUserRoles } = await supabase
        .from('user_roles')
        .select('user_id, role, is_active')
        .eq('is_active', true)
        .in('role', ['super_admin', 'admin', 'moderator']);

      // Get emails from auth.users for each profile
      const profilesWithEmails = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
          const adminRoles = (allUserRoles || []).filter(role => role.user_id === profile.id);
          
          return {
            ...profile,
            email: userData.user?.email || 'No email',
            admin_roles: adminRoles
          };
        })
      );

      // Filter by admin role if needed
      let filteredProfiles = profilesWithEmails;
      if (roleFilter === 'admin') {
        filteredProfiles = profilesWithEmails.filter(profile => 
          profile.admin_roles && profile.admin_roles.length > 0
        );
      }

      // Apply search term filter on emails after fetching (if needed for email search)
      if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredProfiles = filteredProfiles.filter(profile => 
          profile.email?.toLowerCase().includes(lowerSearchTerm) ||
          profile.full_name?.toLowerCase().includes(lowerSearchTerm)
        );
      }

      return filteredProfiles;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get total count for pagination
  const { data: totalCount } = useQuery({
    queryKey: ['admin-users-count', searchTerm, roleFilter, statusFilter, verificationFilter, completionFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Note: Search filtering will be handled in post-processing since emails come from auth.users

      if (roleFilter === 'admin') {
        // For admin filter, we need to count profiles that have admin roles
        const { data: adminUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['super_admin', 'admin', 'moderator'])
          .eq('is_active', true);
        
        if (adminUsers && adminUsers.length > 0) {
          const adminUserIds = adminUsers.map(u => u.user_id);
          query = query.in('id', adminUserIds);
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // No results
        }
      } else if (roleFilter !== 'all') {
        query = query.eq('user_role', roleFilter as UserRole);
      }

      if (statusFilter === 'active') {
        query = query.eq('profile_completed', true);
      } else if (statusFilter === 'inactive') {
        query = query.eq('profile_completed', false);
      }

      // Note: email_verified field filtering will be implemented when database schema includes this field
      if (verificationFilter === 'verified') {
        // For now, use profile_completed as a proxy for verification
        query = query.eq('profile_completed', true);
      } else if (verificationFilter === 'unverified') {
        query = query.eq('profile_completed', false);
      }

      if (completionFilter !== 'all') {
      // Note: completion_percentage field filtering implementation
      if (completionFilter === 'low') {
        // Users with low completion (0-25%) - will be calculated client-side for now
      } else if (completionFilter === 'medium') {
        // Users with medium completion (26-75%)
      } else if (completionFilter === 'high') {
        // Users with high completion (76-100%)
      }
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      // Get admin count from user_roles table
      const { count: admins } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['super_admin', 'admin', 'moderator'])
        .eq('is_active', true);

      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: inactiveUsers },
        { count: verifiedUsers },
        { count: unverifiedUsers },
        { count: employers },
        { count: jobSeekers },
        { count: candidates }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_completed', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_completed', false),
        // For now, using profile_completed as proxy for email verification
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_completed', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('profile_completed', false),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'employer'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'job_seeker'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'candidate')
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        inactiveUsers: inactiveUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        unverifiedUsers: unverifiedUsers || 0,
        employers: employers || 0,
        jobSeekers: jobSeekers || 0,
        candidates: candidates || 0,
        admins: admins || 0
      };
    }
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
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

  const totalPages = pageSize === -1 ? 1 : Math.ceil((totalCount || 0) / pageSize);

  return {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    verificationFilter,
    setVerificationFilter,
    completionFilter,
    setCompletionFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    users,
    isLoading,
    userStats,
    totalCount,
    totalPages,
    handleUserAction,
    filteredUsers: users || [],
    refetch
  };
};
