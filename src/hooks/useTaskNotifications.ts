import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';
import { formatTXC } from '@/types/txc-pricing';

export const useTaskNotifications = () => {
  const { user } = useAuth();
  const { isSubscribed, permission } = usePushNotifications();

  const sendTaskReminderNotification = async (taskTitle: string, reward: number) => {
    if (!user) return;

    try {
      // Always send local notification first
      if ('Notification' in window && permission === 'granted') {
        const notification = new Notification('Complete Your Daily Task! 🎯', {
          body: `Don't forget to ${taskTitle} and earn ${formatTXC(reward)} TXC tokens!`,
          icon: '/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png',
          badge: '/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png',
          tag: 'task-reminder',
          requireInteraction: true
        });

        notification.onclick = () => {
          window.focus();
          window.location.href = '/gamification';
          notification.close();
        };
      }

      // Send push notification via backend
      const response = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_ids: [user.id],
          title: 'Complete Your Daily Task! 🎯',
          body: `Don't forget to ${taskTitle} and earn ${formatTXC(reward)} TXC tokens!`,
          data: { url: '/gamification' },
          trigger_type: 'task_reminder',
          priority: 'normal',
          actions: [
            { action: 'complete', label: 'Complete Task', url: '/gamification' },
            { action: 'later', label: 'Remind Later' }
          ]
        }
      });
      
      if (response.error) {
        console.error('Push notification error:', response.error);
      } else {
        console.log('Task reminder notification sent:', response.data);
      }
    } catch (error) {
      console.error('Error sending task reminder notification:', error);
    }
  };

  const sendTaskCompletionNotification = async (taskTitle: string, reward: number) => {
    if (!user) return;

    try {
      // Always send local notification first
      if ('Notification' in window && permission === 'granted') {
        const notification = new Notification('Task Completed! 🎉', {
          body: `Great job! You earned ${formatTXC(reward)} TXC for ${taskTitle}`,
          icon: '/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png',
          badge: '/lovable-uploads/2f30b9a2-a492-4725-b98c-334796c21e32.png',
          tag: 'task-completed',
          requireInteraction: false
        });

        notification.onclick = () => {
          window.focus();
          window.location.href = '/gamification';
          notification.close();
        };
      }

      // Send push notification via backend
      const response = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_ids: [user.id],
          title: 'Task Completed! 🎉',
          body: `Great job! You earned ${formatTXC(reward)} TXC for ${taskTitle}`,
          data: { url: '/gamification' },
          trigger_type: 'task_completed',
          priority: 'normal'
        }
      });
      
      if (response.error) {
        console.error('Push notification error:', response.error);
      } else {
        console.log('Task completion notification sent:', response.data);
      }
    } catch (error) {
      console.error('Error sending task completion notification:', error);
    }
  };

  const sendDailyTaskReminders = async () => {
    if (!user || permission !== 'granted') return;

    try {
      const dailyTasks = [
        { title: 'Apply to Jobs', reward: 90 },
        { title: 'Update Profile', reward: 300 },
        { title: 'Community Engagement', reward: 150 }
      ];

      for (const task of dailyTasks) {
        setTimeout(() => {
          sendTaskReminderNotification(task.title, task.reward);
        }, Math.random() * 5000); // Random delay to avoid spam
      }
    } catch (error) {
      console.error('Error sending daily task reminders:', error);
    }
  };

  // Set up immediate test notifications and daily reminders
  useEffect(() => {
    if (!user) return;

    // Send immediate test notification to verify functionality
    if (permission === 'granted') {
      const testTimeout = setTimeout(() => {
        sendTaskReminderNotification('Test Your Setup', 50);
      }, 3000);

      return () => clearTimeout(testTimeout);
    }

    // Send reminders at specific times (10 AM, 2 PM, 6 PM)
    const now = new Date();
    const reminderTimes = [10, 14, 18]; // Hours in 24-hour format
    
    reminderTimes.forEach(hour => {
      const reminderTime = new Date();
      reminderTime.setHours(hour, 0, 0, 0);
      
      if (reminderTime > now) {
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          sendDailyTaskReminders();
        }, timeUntilReminder);
      }
    });
  }, [user, permission]);

  return {
    sendTaskReminderNotification,
    sendTaskCompletionNotification,
    sendDailyTaskReminders,
    // Expose for manual testing
    testNotification: () => {
      if (user && permission === 'granted') {
        sendTaskReminderNotification('Manual Test', 100);
        sendTaskCompletionNotification('Manual Test Completed', 100);
      }
    }
  };
};