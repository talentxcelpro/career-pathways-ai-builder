import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Group {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  group_type: 'public' | 'private' | 'secret';
  category?: string;
  rules?: string;
  member_count: number;
  post_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  user_role?: 'admin' | 'moderator' | 'member';
  is_member?: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  status: 'active' | 'pending' | 'banned';
  user?: {
    full_name: string;
    profile_picture_url?: string;
  };
}

export const useGroups = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async () => {
      // First get all accessible groups
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!user || !groupsData) return [];

      // Check membership status for each group
      const groupsWithMembership = await Promise.all(
        groupsData.map(async (group) => {
          const { data: membership } = await supabase
            .from('group_members')
            .select('role, status')
            .eq('group_id', group.id)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          return {
            ...group,
            user_role: membership?.role,
            is_member: !!membership
          };
        })
      );

      return groupsWithMembership;
    },
    enabled: !!user
  });

  // Create group
  const createGroupMutation = useMutation({
    mutationFn: async (groupData: Omit<Group, 'id' | 'member_count' | 'post_count' | 'created_at' | 'updated_at' | 'is_active'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin',
          status: 'active'
        });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group');
    }
  });

  // Join group
  const joinGroupMutation = useMutation({
    mutationFn: async ({ groupId, role = 'member' }: { groupId: string; role?: 'member' }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role,
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Joined group successfully!');
    },
    onError: (error) => {
      console.error('Failed to join group:', error);
      toast.error('Failed to join group');
    }
  });

  // Leave group
  const leaveGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Left group successfully');
    },
    onError: (error) => {
      console.error('Failed to leave group:', error);
      toast.error('Failed to leave group');
    }
  });

  // Get group members
  const getGroupMembers = useCallback(async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        profiles!group_members_user_id_fkey (
          full_name,
          profile_picture_url
        )
      `)
      .eq('group_id', groupId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(member => ({
      ...member,
      user: member.profiles
    })) || [];
  }, []);

  const getUserGroups = useCallback(() => {
    return groups.filter(group => group.is_member);
  }, [groups]);

  const getPublicGroups = useCallback(() => {
    return groups.filter(group => group.group_type === 'public');
  }, [groups]);

  return {
    groups,
    isLoading,
    createGroup: createGroupMutation.mutate,
    joinGroup: joinGroupMutation.mutate,
    leaveGroup: leaveGroupMutation.mutate,
    getGroupMembers,
    getUserGroups,
    getPublicGroups,
    isCreating: createGroupMutation.isPending,
    isJoining: joinGroupMutation.isPending,
    isLeaving: leaveGroupMutation.isPending
  };
};