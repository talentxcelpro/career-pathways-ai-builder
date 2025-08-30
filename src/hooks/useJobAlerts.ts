import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface JobAlert {
  id: string;
  user_id: string;
  alert_name: string;
  keywords: string[];
  location: string;
  employment_types: string[];
  experience_levels: string[];
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
}

export const useJobAlerts = () => {
  const queryClient = useQueryClient();

  // Fetch job alerts
  const { data: alerts = [], isLoading, error } = useQuery({
    queryKey: ['job-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('job_alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as JobAlert[];
    },
    retry: 1
  });

  // Create job alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: Omit<JobAlert, 'id' | 'user_id' | 'created_at' | 'last_triggered_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('job_alert_preferences')
        .insert({
          ...alertData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert created successfully!');
    },
    onError: (error) => {
      console.error('Error creating job alert:', error);
      toast.error('Failed to create job alert');
    }
  });

  // Update job alert mutation
  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobAlert> & { id: string }) => {
      const { error } = await supabase
        .from('job_alert_preferences')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert updated!');
    },
    onError: (error) => {
      console.error('Error updating job alert:', error);
      toast.error('Failed to update job alert');
    }
  });

  // Delete job alert mutation
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('job_alert_preferences')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert deleted');
    },
    onError: (error) => {
      console.error('Error deleting job alert:', error);
      toast.error('Failed to delete job alert');
    }
  });

  // Toggle alert status
  const toggleAlert = (alertId: string, isActive: boolean) => {
    updateAlertMutation.mutate({ id: alertId, is_active: isActive });
  };

  return {
    alerts,
    isLoading,
    error,
    createAlert: createAlertMutation.mutate,
    updateAlert: updateAlertMutation.mutate,
    deleteAlert: deleteAlertMutation.mutate,
    toggleAlert,
    isCreating: createAlertMutation.isPending,
    isUpdating: updateAlertMutation.isPending,
    isDeleting: deleteAlertMutation.isPending
  };
};