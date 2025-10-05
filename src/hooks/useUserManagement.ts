
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
      // First, get all auth users with their email addresses
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Merge auth users with profiles
      const allUsers = (authUsers?.users || []).map(authUser => {
        const profile = profilesData?.find(p => p.id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email || 'No email',
          full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
          created_at: profile?.created_at || authUser.created_at,
          profile_completed: profile?.profile_completed || false,
          verification_status: profile?.verification_status || 'unverified',
          user_role: profile?.user_role || null,
          phone: profile?.phone || authUser.phone || null,
          location: profile?.location || null,
          title: profile?.title || null,
          about: profile?.about || null,
          profile_picture_url: profile?.profile_picture_url || null,
          email_confirmed_at: authUser.email_confirmed_at,
          last_sign_in_at: authUser.last_sign_in_at,
          ...profile
        };
      });

      // Apply filters
      let filteredUsers = allUsers;

      // Search filter
      if (searchTerm.trim()) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.email?.toLowerCase().includes(lowerSearchTerm) ||
          user.full_name?.toLowerCase().includes(lowerSearchTerm)
        );
      }

      // Role filter (will be applied after getting admin roles)
      if (roleFilter !== 'all' && roleFilter !== 'admin') {
        filteredUsers = filteredUsers.filter(user => user.user_role === roleFilter);
      }

      // Status filter
      if (statusFilter === 'active') {
        filteredUsers = filteredUsers.filter(user => user.profile_completed === true);
      } else if (statusFilter === 'inactive') {
        filteredUsers = filteredUsers.filter(user => user.profile_completed === false);
      }

      // Verification filter
      if (verificationFilter === 'verified') {
        filteredUsers = filteredUsers.filter(user => user.verification_status === 'verified');
      } else if (verificationFilter === 'unverified') {
        filteredUsers = filteredUsers.filter(user => user.verification_status !== 'verified');
      }

      // Apply pagination
      if (pageSize !== -1) {
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize;
        filteredUsers = filteredUsers.slice(from, to);
      }

      // Get all user roles for admin detection
      const { data: allUserRoles } = await supabase
        .from('user_roles')
        .select('user_id, role, is_active')
        .eq('is_active', true)
        .in('role', ['super_admin', 'admin', 'moderator']);

      // Add admin roles to users
      const usersWithAdminRoles = filteredUsers.map((user) => {
        const adminRoles = (allUserRoles || []).filter(role => role.user_id === user.id);
        
        return {
          ...user,
          admin_roles: adminRoles
        };
      });

      // Filter by admin role if needed
      let finalUsers = usersWithAdminRoles;
      if (roleFilter === 'admin') {
        finalUsers = usersWithAdminRoles.filter(user => 
          user.admin_roles && user.admin_roles.length > 0
        );
      }

      return finalUsers;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get total count for pagination - just return the filtered users length
  const { data: totalCount } = useQuery({
    queryKey: ['admin-users-count', searchTerm, roleFilter, statusFilter, verificationFilter, completionFilter],
    queryFn: async () => {
      // We'll calculate this from the actual filtered users
      // since we're now using auth.admin.listUsers()
      return users?.length || 0;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled: !!users, // Only run when users are loaded
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
        // Using actual verification_status field
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('verification_status', 'verified'),
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
