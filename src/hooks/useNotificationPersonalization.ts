import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  sound_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  frequency_limit: number; // max notifications per hour
  categories: {
    jobs: boolean;
    network: boolean;
    learning: boolean;
    companies: boolean;
    resume: boolean;
    tools: boolean;
    colleges: boolean;
    career_feed: boolean;
    discover: boolean;
  };
  priority_filter: 'all' | 'high_only' | 'normal_and_high';
  ai_optimization: boolean;
}

export const useNotificationPersonalization = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPrefs: NotificationPreferences = {
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false,
          sound_enabled: true,
          frequency_limit: 10,
          categories: {
            jobs: true,
            network: true,
            learning: true,
            companies: true,
            resume: true,
            tools: true,
            colleges: true,
            career_feed: true,
            discover: true
          },
          priority_filter: 'all',
          ai_optimization: true
        };
        setPreferences(defaultPrefs);
        await savePreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const savePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    if (!user) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      setPreferences(newPreferences);
      return true;
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return false;
    
    const updated = { ...preferences, [key]: value };
    return await savePreferences(updated);
  }, [preferences, savePreferences]);

  const updateCategoryPreference = useCallback(async (category: keyof NotificationPreferences['categories'], enabled: boolean) => {
    if (!preferences) return false;
    
    const updated = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: enabled
      }
    };
    return await savePreferences(updated);
  }, [preferences, savePreferences]);

  const shouldShowNotification = useCallback((notification: any) => {
    if (!preferences) return true;
    
    // Check quiet hours
    if (preferences.quiet_hours_start && preferences.quiet_hours_end) {
      const now = new Date();
      const currentHour = now.getHours();
      const quietStart = parseInt(preferences.quiet_hours_start.split(':')[0]);
      const quietEnd = parseInt(preferences.quiet_hours_end.split(':')[0]);
      
      if (currentHour >= quietStart || currentHour < quietEnd) {
        return notification.priority === 'high'; // Only show high priority during quiet hours
      }
    }
    
    // Check category preferences
    const category = notification.module || notification.type;
    if (preferences.categories[category] === false) {
      return false;
    }
    
    // Check priority filter
    if (preferences.priority_filter === 'high_only' && notification.priority !== 'high') {
      return false;
    }
    if (preferences.priority_filter === 'normal_and_high' && notification.priority === 'low') {
      return false;
    }
    
    return true;
  }, [preferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    isSaving,
    updatePreference,
    updateCategoryPreference,
    shouldShowNotification,
    savePreferences
  };
};