import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: 'post' | 'comment' | 'user' | 'group';
  content_id: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake_news' | 'violence' | 'hate_speech' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface ModerationAction {
  id: string;
  content_type: string;
  content_id: string;
  action_type: 'warning' | 'hide' | 'delete' | 'ban_user' | 'suspend_user';
  reason: string;
  moderator_id: string;
  automated: boolean;
  created_at: string;
}

export const useContentModeration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Report content
  const reportContentMutation = useMutation({
    mutationFn: async (reportData: Omit<ContentReport, 'id' | 'status' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('content_reports')
        .insert({
          ...reportData,
          reporter_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Report submitted successfully. Our team will review it.');
      queryClient.invalidateQueries({ queryKey: ['content-reports'] });
    },
    onError: (error) => {
      console.error('Failed to report content:', error);
      toast.error('Failed to submit report. Please try again.');
    }
  });

  // Get user's reports
  const { data: userReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['content-reports', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('content_reports')
        .select('*')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Check if content is already reported by user
  const checkIfReported = useCallback(async (contentType: string, contentId: string) => {
    if (!user) return false;

    const { data } = await supabase
      .from('content_reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .maybeSingle();

    return !!data;
  }, [user]);

  // Block user (client-side filtering)
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  
  const blockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => [...prev, userId]);
    toast.success('User blocked. You will no longer see their content.');
  }, []);

  const unblockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => prev.filter(id => id !== userId));
    toast.success('User unblocked.');
  }, []);

  const isUserBlocked = useCallback((userId: string) => {
    return blockedUsers.includes(userId);
  }, [blockedUsers]);

  return {
    reportContent: reportContentMutation.mutate,
    userReports,
    reportsLoading,
    checkIfReported,
    blockUser,
    unblockUser,
    isUserBlocked,
    blockedUsers,
    isReporting: reportContentMutation.isPending
  };
};