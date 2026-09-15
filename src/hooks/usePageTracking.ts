import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTXCIntegration } from './useTXCIntegration';

/**
 * Hook to track user engagement across all pages and modules
 * Automatically triggers TXC rewards for various activities
 */
export const usePageTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    triggerProfileCompleted,
    triggerPostCreated,
    triggerSkillAdded,
    triggerJobApplied,
    triggerConnectionMade,
    triggerCourseCompleted,
    triggerResumeCreated,
    triggerArticlePosted,
    triggerSocialActivity,
    earnTXC
  } = useTXCIntegration();

  useEffect(() => {
    if (!user) return;

    const currentPath = location.pathname;
    
    // Track page visits and award exploration bonuses
    const trackPageEngagement = async () => {
      // Different TXC rewards based on module engagement
      const moduleRewards: Record<string, { action: string; description: string }> = {
        '/jobs': { action: 'job_browsing', description: 'Exploring job opportunities' },
        '/resume': { action: 'resume_building', description: 'Building resume' },
        '/network': { action: 'networking_activity', description: 'Building professional network' },
        '/learning': { action: 'learning_engagement', description: 'Engaging with learning content' },
        '/companies': { action: 'company_research', description: 'Researching companies' },
        '/profile': { action: 'profile_optimization', description: 'Optimizing profile' },
        '/passport': { action: 'passport_engagement', description: 'Career passport activity' },
        '/tools': { action: 'tools_usage', description: 'Using career tools' },
        '/marketplace': { action: 'marketplace_browse', description: 'Exploring marketplace' },
        '/ai': { action: 'ai_interaction', description: 'AI-powered career guidance' },
        '/analytics': { action: 'analytics_insight', description: 'Analyzing career data' },
        '/social': { action: 'social_engagement', description: 'Social platform engagement' }
      };

      // Award TXC for specific module engagement
      for (const [path, reward] of Object.entries(moduleRewards)) {
        if (currentPath.startsWith(path)) {
          await earnTXC(reward.action, { 
            action: 'page_engagement', 
            page: currentPath,
            module: path.replace('/', ''),
            timestamp: Date.now()
          });
          break;
        }
      }

      // Special rewards for deep engagement
      if (currentPath.includes('/edit') || currentPath.includes('/create')) {
        await earnTXC('content_creation', { 
          action: 'content_creation', 
          page: currentPath 
        });
      }

      if (currentPath.includes('/apply') || currentPath.includes('/application')) {
        await triggerJobApplied();
      }

      if (currentPath.includes('/connect') || currentPath.includes('/follow')) {
        await triggerConnectionMade();
      }

      // Track time spent on educational content
      if (currentPath.includes('/course') || currentPath.includes('/learning')) {
        setTimeout(async () => {
          await triggerCourseCompleted();
        }, 5 * 60 * 1000); // 5 minutes of engagement
      }
    };

    // Debounce page tracking to avoid spam
    const timer = setTimeout(trackPageEngagement, 3000);
    return () => clearTimeout(timer);
  }, [location.pathname, user]);

  return {
    currentModule: location.pathname.split('/')[1] || 'home',
    isGamificationPage: location.pathname === '/gamification'
  };
};