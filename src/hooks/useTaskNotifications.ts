import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';
import { formatTXC } from '@/types/txc-pricing';

export const useTaskNotifications = () => {
  const { user } = useAuth();
  const { isSubscribed, permission } = usePushNotifications();

  const sendTaskReminderNotification = async (taskTitle: string, reward: number) => {
    if (!user || permission !== 'granted') return;

    try {
      // Send local notification
      if ('serviceWorker' in navigator && 'Notification' in window) {
        new Notification('Complete Your Daily Task! 🎯', {
          body: `Don't forget to ${taskTitle} and earn ${formatTXC(reward)} TXC tokens!`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'task-reminder',
          requireInteraction: true
        });
      }

      // Send push notification via backend
      if (isSubscribed) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: user.id,
            title: 'Complete Your Daily Task! 🎯',
            body: `Don't forget to ${taskTitle} and earn ${formatTXC(reward)} TXC tokens!`,
            action_url: '/gamification'
          }
        });
      }
    } catch (error) {
      console.error('Error sending task reminder notification:', error);
    }
  };

  const sendTaskCompletionNotification = async (taskTitle: string, reward: number) => {
    if (!user || permission !== 'granted') return;

    try {
      // Send local notification
      if ('serviceWorker' in navigator && 'Notification' in window) {
        new Notification('Task Completed! 🎉', {
          body: `Great job! You earned ${formatTXC(reward)} TXC for ${taskTitle}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'task-completed'
        });
      }

      // Send push notification via backend
      if (isSubscribed) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: user.id,
            title: 'Task Completed! 🎉',
            body: `Great job! You earned ${formatTXC(reward)} TXC for ${taskTitle}`,
            action_url: '/gamification'
          }
        });
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

  // Set up daily reminders
  useEffect(() => {
    if (!user || permission !== 'granted') return;

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
  }, [user, permission, isSubscribed]);

  return {
    sendTaskReminderNotification,
    sendTaskCompletionNotification,
    sendDailyTaskReminders
  };
};