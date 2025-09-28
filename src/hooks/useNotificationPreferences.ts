import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  likes_notifications: boolean;
  comments_notifications: boolean;
  follows_notifications: boolean;
  stories_notifications: boolean;
  reactions_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      // Return default preferences if none exist
      return data || {
        user_id: user.id,
        email_notifications: true,
        push_notifications: true,
        likes_notifications: true,
        comments_notifications: true,
        follows_notifications: true,
        stories_notifications: true,
        reactions_notifications: true
      };
    },
    enabled: !!user
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
      toast.success('Notification preferences updated');
    },
    onError: (error) => {
      console.error('Failed to update notification preferences:', error);
      toast.error('Failed to update preferences. Please try again.');
    }
  });

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    updatePreferencesMutation.mutate(newPreferences);
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    if (!preferences || typeof preferences[key] !== 'boolean') return;
    
    updatePreferences({
      [key]: !preferences[key]
    });
  };

  // Check if a specific notification type is enabled
  const isNotificationEnabled = (type: keyof NotificationPreferences): boolean => {
    if (!preferences) return true; // Default to enabled
    return Boolean(preferences[type]);
  };

  return {
    preferences,
    isLoading,
    updatePreferences,
    togglePreference,
    isNotificationEnabled,
    isUpdating: updatePreferencesMutation.isPending
  };
};