import { useEffect } from 'react';
import { useTXCMining } from './useTXCMining';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to automatically integrate TXC mining with user actions
 * This provides utility functions to trigger mining across the app
 */
export const useTXCIntegration = () => {
  const { earnTXC } = useTXCMining();
  const { user } = useAuth();

  // Auto-trigger daily login bonus when user loads the app
  useEffect(() => {
    if (user) {
      // Silent attempt to earn daily login bonus
      earnTXC('daily_login');
    }
  }, [user, earnTXC]);

  // Specific action triggers for different activities
  const triggerJobApplied = async (): Promise<boolean> => {
    return await earnTXC('job_applied', { action: 'manual_task_completion' });
  };

  const triggerProfileCompleted = async (): Promise<boolean> => {
    return await earnTXC('profile_completed', { action: 'manual_task_completion' });
  };

  const triggerConnectionMade = async (): Promise<boolean> => {
    return await earnTXC('connection_made', { action: 'manual_task_completion' });
  };

  const triggerPostCreated = async (): Promise<boolean> => {
    return await earnTXC('post_created', { action: 'manual_task_completion' });
  };

  const triggerSkillAdded = async (): Promise<boolean> => {
    return await earnTXC('skill_added', { action: 'manual_task_completion' });
  };

  const triggerCourseCompleted = async (): Promise<boolean> => {
    return await earnTXC('course_completed', { action: 'manual_task_completion' });
  };

  const triggerRecommendationGiven = async (): Promise<boolean> => {
    return await earnTXC('recommendation_given', { action: 'manual_task_completion' });
  };

  const triggerArticlePosted = async (): Promise<boolean> => {
    return await earnTXC('article_posted', { action: 'manual_task_completion' });
  };

  const triggerReferralMade = async (): Promise<boolean> => {
    return await earnTXC('referral_made', { action: 'referral_system' });
  };

  const triggerSocialActivity = async (): Promise<boolean> => {
    return await earnTXC('social_activity_bonus', { action: 'social_engagement' });
  };

  const triggerJoiningBonus = async (): Promise<boolean> => {
    return await earnTXC('joining_bonus', { action: 'new_user_onboarding' });
  };

  // Additional triggers for existing code compatibility
  const triggerPostLiked = async (): Promise<boolean> => {
    return await earnTXC('post_liked', { action: 'social_engagement' });
  };

  const triggerCommentMade = async (): Promise<boolean> => {
    return await earnTXC('comment_made', { action: 'social_engagement' });
  };

  const triggerResumeCreated = async (): Promise<boolean> => {
    return await earnTXC('resume_created', { action: 'career_building' });
  };

  const triggerSocialActivityBonus = async (): Promise<boolean> => {
    return await earnTXC('social_activity_bonus', { action: 'social_engagement' });
  };

  return {
    triggerJobApplied,
    triggerProfileCompleted,
    triggerConnectionMade,
    triggerPostCreated,
    triggerSkillAdded,
    triggerCourseCompleted,
    triggerRecommendationGiven,
    triggerArticlePosted,
    triggerReferralMade,
    triggerSocialActivity,
    triggerJoiningBonus,
    triggerPostLiked,
    triggerCommentMade,
    triggerResumeCreated,
    triggerSocialActivityBonus,
    // Direct access to earnTXC for custom actions
    earnTXC
  };
};