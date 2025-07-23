import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  module: 'network' | 'jobs' | 'resume' | 'tools' | 'companies' | 'learning' | 'career_map' | 'employer';
  type: string;
  title: string;
  message: string;
  link: string;
  icon?: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  sound: boolean;
  created_at: string;
  expires_at?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  soundEnabled: boolean;
  lastUpdate: number;
}

interface NotificationActions {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAsReadOptimistic: (notificationId: string) => void;
  markAllAsRead: (module?: string) => void;
  deleteNotification: (notificationId: string) => void;
  updateUnreadCount: () => void;
  toggleSound: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  playNotificationSound: (priority: string) => void;
  showToastNotification: (notification: Notification) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    soundEnabled: typeof window !== 'undefined' ? localStorage.getItem('notifications-sound') !== 'false' : true,
    lastUpdate: Date.now(),

    // Actions
    setNotifications: (notifications) => {
      set({
        notifications,
        unreadCount: notifications.filter(n => !n.is_read).length,
        lastUpdate: Date.now()
      });
    },

    addNotification: (notification) => {
      const { notifications, soundEnabled, playNotificationSound, showToastNotification } = get();
      
      // Add to store with optimistic update
      const newNotifications = [notification, ...notifications];
      set({
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.is_read).length,
        lastUpdate: Date.now()
      });

      // Play sound if enabled
      if (soundEnabled && notification.sound) {
        playNotificationSound(notification.priority);
      }

      // Show toast
      showToastNotification(notification);
    },

    markAsReadOptimistic: (notificationId) => {
      const { notifications } = get();
      const updatedNotifications = notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      
      set({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.is_read).length,
        lastUpdate: Date.now()
      });
    },

    markAsRead: async (notificationId) => {
      // Optimistic update first
      get().markAsReadOptimistic(notificationId);

      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) throw error;
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Revert optimistic update on error
        const { notifications } = get();
        const revertedNotifications = notifications.map(n =>
          n.id === notificationId ? { ...n, is_read: false } : n
        );
        set({
          notifications: revertedNotifications,
          unreadCount: revertedNotifications.filter(n => !n.is_read).length
        });
        toast.error('Failed to mark notification as read');
      }
    },

    markAllAsRead: async (module) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        let query = supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (module) {
          query = query.eq('module', module);
        }

        const { error } = await query;
        if (error) throw error;

        // Update store
        const { notifications } = get();
        const updatedNotifications = notifications.map(n =>
          (!module || n.module === module) ? { ...n, is_read: true } : n
        );
        
        set({
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.is_read).length,
          lastUpdate: Date.now()
        });

        toast.success('Notifications marked as read');
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        toast.error('Failed to mark notifications as read');
      }
    },

    deleteNotification: async (notificationId) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);

        if (error) throw error;

        // Update store
        const { notifications } = get();
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        set({
          notifications: updatedNotifications,
          unreadCount: updatedNotifications.filter(n => !n.is_read).length,
          lastUpdate: Date.now()
        });

        toast.success('Notification deleted');
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification');
      }
    },

    updateUnreadCount: () => {
      const { notifications } = get();
      set({
        unreadCount: notifications.filter(n => !n.is_read).length
      });
    },

    toggleSound: (enabled) => {
      set({ soundEnabled: enabled });
      if (typeof window !== 'undefined') {
        localStorage.setItem('notifications-sound', enabled.toString());
      }
    },

    setLoading: (loading) => {
      set({ isLoading: loading });
    },

    playNotificationSound: (priority) => {
      const { soundEnabled } = get();
      if (!soundEnabled) return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for different priorities
        switch (priority) {
          case 'high':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            break;
          case 'medium':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            break;
          case 'low':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            break;
          default:
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        }
        
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
        
        // Cleanup
        setTimeout(() => {
          oscillator.disconnect();
          gainNode.disconnect();
        }, 300);
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    },

    showToastNotification: (notification) => {
      const priority = notification.priority;
      const toastOptions = {
        duration: priority === 'high' ? 8000 : priority === 'medium' ? 5000 : 3000,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = notification.link;
          }
        }
      };

      if (priority === 'high') {
        toast.error(notification.title, {
          description: notification.message,
          ...toastOptions
        });
      } else if (priority === 'medium') {
        toast.info(notification.title, {
          description: notification.message,
          ...toastOptions
        });
      } else {
        toast(notification.title, {
          description: notification.message,
          ...toastOptions
        });
      }
    }
  }))
);