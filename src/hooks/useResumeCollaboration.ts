import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type CollaborationPermission = 'view' | 'comment' | 'edit';

export type Collaboration = {
  id: string;
  resume_id: string;
  owner_id: string;
  collaborator_id: string;
  permission_level: CollaborationPermission;
  is_active: boolean;
  invited_at: string;
  accepted_at?: string;
  collaborator_profile?: {
    full_name: string;
    email: string;
  };
};

export type Comment = {
  id: string;
  resume_id: string;
  user_id: string;
  section_type?: string;
  section_id?: string;
  content: string;
  is_resolved: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
  replies?: Comment[];
};

export const useResumeCollaboration = (resumeId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch collaborators
  const { data: collaborations, isLoading: collaborationsLoading } = useQuery({
    queryKey: ['resume-collaborations', resumeId],
    queryFn: async (): Promise<Collaboration[]> => {
      if (!resumeId || !user) return [];
      
      const { data, error } = await supabase
        .from('resume_collaborations')
        .select(`
          *,
          collaborator_profile:profiles!collaborator_id(full_name, email)
        `)
        .eq('resume_id', resumeId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        permission_level: item.permission_level as CollaborationPermission,
        collaborator_profile: Array.isArray(item.collaborator_profile) 
          ? item.collaborator_profile[0] || { full_name: 'Unknown', email: '' }
          : { full_name: 'Unknown', email: '' }
      })) as Collaboration[];
    },
    enabled: !!resumeId && !!user
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['resume-comments', resumeId],
    queryFn: async (): Promise<Comment[]> => {
      if (!resumeId || !user) return [];
      
      const { data, error } = await supabase
        .from('resume_comments')
        .select(`
          *,
          user_profile:profiles!user_id(full_name, email)
        `)
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Organize comments with replies
      const topLevelComments = (data || []).filter(c => !c.parent_id);
      const repliesMap = (data || []).reduce((acc, comment) => {
        if (comment.parent_id) {
          if (!acc[comment.parent_id]) acc[comment.parent_id] = [];
          acc[comment.parent_id].push(comment);
        }
        return acc;
      }, {} as Record<string, Comment[]>);

      return topLevelComments.map(comment => ({
        ...comment,
        user_profile: Array.isArray(comment.user_profile) 
          ? comment.user_profile[0] || { full_name: 'Unknown', email: '' }
          : { full_name: 'Unknown', email: '' },
        replies: (repliesMap[comment.id] || []).map(reply => ({
          ...reply,
          user_profile: Array.isArray(reply.user_profile) 
            ? reply.user_profile[0] || { full_name: 'Unknown', email: '' }
            : { full_name: 'Unknown', email: '' }
        }))
      })) as Comment[];
    },
    enabled: !!resumeId && !!user
  });

  // Invite collaborator mutation
  const inviteCollaborator = useMutation({
    mutationFn: async ({ 
      email, 
      permission 
    }: { 
      email: string; 
      permission: CollaborationPermission;
    }) => {
      if (!resumeId || !user) throw new Error('Missing required data');

      // First, find the user by email
      const { data: userProfiles, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userProfiles) {
        throw new Error('User not found with that email address');
      }

      const { error } = await supabase
        .from('resume_collaborations')
        .insert({
          resume_id: resumeId,
          owner_id: user.id,
          collaborator_id: userProfiles.id,
          permission_level: permission
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Collaborator invited successfully');
      queryClient.invalidateQueries({ queryKey: ['resume-collaborations', resumeId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to invite collaborator');
    }
  });

  // Update permission mutation
  const updatePermission = useMutation({
    mutationFn: async ({ 
      collaborationId, 
      permission 
    }: { 
      collaborationId: string; 
      permission: CollaborationPermission;
    }) => {
      const { error } = await supabase
        .from('resume_collaborations')
        .update({ permission_level: permission })
        .eq('id', collaborationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Permission updated');
      queryClient.invalidateQueries({ queryKey: ['resume-collaborations', resumeId] });
    }
  });

  // Remove collaborator mutation
  const removeCollaborator = useMutation({
    mutationFn: async (collaborationId: string) => {
      const { error } = await supabase
        .from('resume_collaborations')
        .update({ is_active: false })
        .eq('id', collaborationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Collaborator removed');
      queryClient.invalidateQueries({ queryKey: ['resume-collaborations', resumeId] });
    }
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async ({ 
      content, 
      sectionType, 
      sectionId, 
      parentId 
    }: {
      content: string;
      sectionType?: string;
      sectionId?: string;
      parentId?: string;
    }) => {
      if (!resumeId || !user) throw new Error('Missing required data');

      const { error } = await supabase
        .from('resume_comments')
        .insert({
          resume_id: resumeId,
          user_id: user.id,
          content,
          section_type: sectionType,
          section_id: sectionId,
          parent_id: parentId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Comment added');
      queryClient.invalidateQueries({ queryKey: ['resume-comments', resumeId] });
    }
  });

  // Resolve comment mutation
  const resolveComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('resume_comments')
        .update({ is_resolved: true })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Comment resolved');
      queryClient.invalidateQueries({ queryKey: ['resume-comments', resumeId] });
    }
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('resume_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['resume-comments', resumeId] });
    }
  });

  return {
    collaborations,
    comments,
    isLoading: collaborationsLoading || commentsLoading,
    inviteCollaborator: inviteCollaborator.mutate,
    updatePermission: updatePermission.mutate,
    removeCollaborator: removeCollaborator.mutate,
    addComment: addComment.mutate,
    resolveComment: resolveComment.mutate,
    deleteComment: deleteComment.mutate,
    isInviting: inviteCollaborator.isPending
  };
};