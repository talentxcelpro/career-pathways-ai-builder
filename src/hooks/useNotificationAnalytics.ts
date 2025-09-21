import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationMetrics {
  totalSent: number;
  totalRead: number;
  readRate: number;
  avgTimeToRead: number; // in minutes
  byCategory: Record<string, {
    sent: number;
    read: number;
    readRate: number;
  }>;
  byPriority: Record<string, {
    sent: number;
    read: number;
    readRate: number;
  }>;
  byDay: Record<string, number>;
  engagementScore: number;
  optimalTiming: {
    hourOfDay: number;
    dayOfWeek: number;
  };
}

export const useNotificationAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateMetrics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get all notifications for the user from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      if (!notifications || notifications.length === 0) {
        setMetrics({
          totalSent: 0,
          totalRead: 0,
          readRate: 0,
          avgTimeToRead: 0,
          byCategory: {},
          byPriority: {},
          byDay: {},
          engagementScore: 0,
          optimalTiming: { hourOfDay: 9, dayOfWeek: 1 }
        });
        return;
      }

      const totalSent = notifications.length;
      const totalRead = notifications.filter(n => n.is_read).length;
      const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;

      // Calculate average time to read
      const readNotifications = notifications.filter(n => n.is_read && n.read_at);
      const avgTimeToRead = readNotifications.length > 0
        ? readNotifications.reduce((sum, n) => {
            const created = new Date(n.created_at);
            const read = new Date(n.read_at);
            return sum + (read.getTime() - created.getTime()) / (1000 * 60); // minutes
          }, 0) / readNotifications.length
        : 0;

      // Group by category
      const byCategory = notifications.reduce((acc, n) => {
        const category = n.module || 'general';
        if (!acc[category]) {
          acc[category] = { sent: 0, read: 0, readRate: 0 };
        }
        acc[category].sent++;
        if (n.is_read) acc[category].read++;
        acc[category].readRate = (acc[category].read / acc[category].sent) * 100;
        return acc;
      }, {} as Record<string, { sent: number; read: number; readRate: number }>);

      // Group by priority
      const byPriority = notifications.reduce((acc, n) => {
        const priority = n.priority || 'normal';
        if (!acc[priority]) {
          acc[priority] = { sent: 0, read: 0, readRate: 0 };
        }
        acc[priority].sent++;
        if (n.is_read) acc[priority].read++;
        acc[priority].readRate = (acc[priority].read / acc[priority].sent) * 100;
        return acc;
      }, {} as Record<string, { sent: number; read: number; readRate: number }>);

      // Group by day
      const byDay = notifications.reduce((acc, n) => {
        const day = new Date(n.created_at).toLocaleDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate engagement score (0-100)
      const engagementScore = Math.min(100, Math.round(
        (readRate * 0.6) + 
        (Math.min(avgTimeToRead / 60, 1) * 40) // Faster reading = higher engagement
      ));

      // Find optimal timing based on read patterns
      const readByHour = readNotifications.reduce((acc, n) => {
        const hour = new Date(n.read_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const readByDayOfWeek = readNotifications.reduce((acc, n) => {
        const dayOfWeek = new Date(n.read_at).getDay();
        acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const optimalHour = Object.entries(readByHour).reduce((max, [hour, count]) => 
        count > (readByHour[max] || 0) ? parseInt(hour) : max, 9);
      
      const optimalDay = Object.entries(readByDayOfWeek).reduce((max, [day, count]) => 
        count > (readByDayOfWeek[max] || 0) ? parseInt(day) : max, 1);

      setMetrics({
        totalSent,
        totalRead,
        readRate,
        avgTimeToRead,
        byCategory,
        byPriority,
        byDay,
        engagementScore,
        optimalTiming: {
          hourOfDay: optimalHour,
          dayOfWeek: optimalDay
        }
      });
    } catch (error) {
      console.error('Failed to calculate notification metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const trackNotificationEvent = useCallback(async (
    notificationId: string, 
    event: 'received' | 'read' | 'clicked' | 'dismissed'
  ) => {
    if (!user) return;

    try {
      await supabase.from('notification_events').insert({
        user_id: user.id,
        notification_id: notificationId,
        event_type: event,
        timestamp: new Date().toISOString()
      });

      // Update notification read status if applicable
      if (event === 'read') {
        await supabase
          .from('notifications')
          .update({ 
            is_read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('id', notificationId);
      }
    } catch (error) {
      console.error('Failed to track notification event:', error);
    }
  }, [user]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  return {
    metrics,
    isLoading,
    trackNotificationEvent,
    refreshMetrics: calculateMetrics
  };
};