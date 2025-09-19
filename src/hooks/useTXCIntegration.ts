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
      
      // Auto-trigger post, comment, like mining when those actions happen
      const handlePostCreated = () => earnTXC('post_created');
      const handleCommentMade = () => earnTXC('comment_made');
      const handlePostLiked = () => earnTXC('post_liked');
      
      // Listen for custom events that trigger TXC mining
      window.addEventListener('txc:post_created', handlePostCreated);
      window.addEventListener('txc:comment_made', handleCommentMade);
      window.addEventListener('txc:post_liked', handlePostLiked);
      
      return () => {
        window.removeEventListener('txc:post_created', handlePostCreated);
        window.removeEventListener('txc:comment_made', handleCommentMade);
        window.removeEventListener('txc:post_liked', handlePostLiked);
      };
    }
  }, [user, earnTXC]);

  const triggerPostCreated = () => {
    return earnTXC('post_created');
  };

  const triggerConnectionMade = () => {
    return earnTXC('connection_made');
  };

  const triggerProfileCompleted = () => {
    return earnTXC('profile_completed');
  };

  const triggerResumeCreated = () => {
    return earnTXC('resume_created');
  };

  const triggerJobApplied = () => {
    return earnTXC('job_applied');
  };

  const triggerRecommendationGiven = () => {
    return earnTXC('recommendation_given');
  };

  const triggerSkillAdded = () => {
    return earnTXC('skill_added');
  };

  const triggerCourseCompleted = () => {
    return earnTXC('course_completed');
  };

  const triggerFeedbackGiven = () => {
    return earnTXC('feedback_given');
  };

  const triggerPostLiked = () => {
    return earnTXC('post_liked');
  };

  const triggerCommentMade = () => {
    return earnTXC('comment_made');
  };

  const triggerArticlePosted = () => {
    return earnTXC('article_posted');
  };

  const triggerReferralMade = () => {
    return earnTXC('referral_made');
  };

  const triggerSocialActivityBonus = () => {
    return earnTXC('social_activity_bonus');
  };

  return {
    triggerPostCreated,
    triggerConnectionMade,
    triggerProfileCompleted,
    triggerResumeCreated,
    triggerJobApplied,
    triggerRecommendationGiven,
    triggerSkillAdded,
    triggerCourseCompleted,
    triggerFeedbackGiven,
    triggerPostLiked,
    triggerCommentMade,
    triggerArticlePosted,
    triggerReferralMade,
    triggerSocialActivityBonus
  };
};