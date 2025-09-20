import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useTaskNotifications = () => {
  const { user } = useAuth();

  const sendTaskCompletionNotification = async (taskTitle: string, reward: number) => {
    if (!user?.id) return;

    try {
      // Create notification for task completion
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: 'task_completed',
        p_title: 'Task Completed! 🎉',
        p_message: `You completed "${taskTitle}" and earned ${reward} TXC tokens!`,
        p_module: 'gamification',
        p_related_id: null,
        p_link: '/gamification',
        p_priority: 'medium',
        p_icon: 'check-circle'
      });

      console.log('Task completion notification sent');
    } catch (error) {
      console.error('Error sending task notification:', error);
    }
  };

  const sendAchievementNotification = async (achievementTitle: string, points: number) => {
    if (!user?.id) return;

    try {
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: 'achievement_unlocked',
        p_title: 'Achievement Unlocked! 🏆',
        p_message: `Congratulations! You earned "${achievementTitle}" for ${points} points!`,
        p_module: 'gamification',
        p_related_id: null,
        p_link: '/gamification',
        p_priority: 'high',
        p_icon: 'trophy'
      });

      console.log('Achievement notification sent');
    } catch (error) {
      console.error('Error sending achievement notification:', error);
    }
  };

  const sendStreakNotification = async (streakType: string, count: number) => {
    if (!user?.id) return;

    try {
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: 'streak_milestone',
        p_title: 'Streak Milestone! 🔥',
        p_message: `Amazing! You've maintained a ${count}-day ${streakType} streak!`,
        p_module: 'gamification',
        p_related_id: null,
        p_link: '/gamification',
        p_priority: 'medium',
        p_icon: 'flame'
      });

      console.log('Streak notification sent');
    } catch (error) {
      console.error('Error sending streak notification:', error);
    }
  };

  return {
    sendTaskCompletionNotification,
    sendAchievementNotification,
    sendStreakNotification
  };
};