import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ScheduledNotification {
  id?: string;
  title: string;
  message: string;
  scheduled_for: string;
  type: string;
  priority: 'low' | 'normal' | 'high';
  recurring?: 'daily' | 'weekly' | 'monthly';
  timezone?: string;
  data?: any;
}

export const useNotificationScheduler = () => {
  const { user } = useAuth();
  const [isScheduling, setIsScheduling] = useState(false);

  const scheduleNotification = useCallback(async (notification: ScheduledNotification) => {
    if (!user) return false;
    
    setIsScheduling(true);
    try {
      const { data, error } = await supabase.functions.invoke('schedule-notification', {
        body: {
          ...notification,
          user_id: user.id
        }
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return false;
    } finally {
      setIsScheduling(false);
    }
  }, [user]);

  const getScheduledNotifications = useCallback(async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('scheduled_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch scheduled notifications:', error);
      return [];
    }
  }, [user]);

  const cancelScheduledNotification = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to cancel scheduled notification:', error);
      return false;
    }
  }, []);

  return {
    scheduleNotification,
    getScheduledNotifications,
    cancelScheduledNotification,
    isScheduling
  };
};