import { useState, useEffect, useCallback } from 'react';
import { aiAgentService, PersonalizedAIAgent, DailyBriefing, ProactiveNotification } from '@/services/aiAgentService';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

export const usePersonalizedAIAgent = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [agent, setAgent] = useState<PersonalizedAIAgent | null>(null);
  const [dailyBriefing, setDailyBriefing] = useState<DailyBriefing | null>(null);
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastBriefingDate, setLastBriefingDate] = useState<string | null>(
    localStorage.getItem('lastBriefingDate')
  );

  // Initialize personalized agent
  useEffect(() => {
    const initializeAgent = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const personalizedAgent = await aiAgentService.initializePersonalizedAgent(user.id);
        setAgent(personalizedAgent);
      } catch (error) {
        console.error('Failed to initialize AI agent:', error);
        toast.error('Failed to initialize your AI assistant');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAgent();
  }, [user?.id, profile]);

  // Generate daily briefing
  const generateDailyBriefing = useCallback(async (force: boolean = false) => {
    if (!agent || !user?.id) return;

    const today = new Date().toDateString();
    if (!force && lastBriefingDate === today) {
      return; // Already generated today
    }

    try {
      setIsLoading(true);
      const briefing = await aiAgentService.generateDailyBriefing(agent);
      setDailyBriefing(briefing);
      setLastBriefingDate(today);
      localStorage.setItem('lastBriefingDate', today);
      
      // Show welcome toast
      toast.success(`${briefing.greeting}`, {
        duration: 5000,
        action: {
          label: 'View Briefing',
          onClick: () => {
            // Scroll to briefing or open modal
            document.getElementById('daily-briefing')?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    } catch (error) {
      console.error('Failed to generate daily briefing:', error);
      toast.error('Failed to generate your daily briefing');
    } finally {
      setIsLoading(false);
    }
  }, [agent, user?.id, lastBriefingDate]);

  // Load active notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const activeNotifications = await aiAgentService.getActiveNotifications(user.id);
      setNotifications(activeNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [user?.id]);

  // AI Tool Functions
  const runATSCheck = useCallback(async (resumeContent: any) => {
    if (!user?.id) return null;

    try {
      const result = await aiAgentService.runATSCheck(user.id, resumeContent);
      
      // Create proactive notification if score is low
      if (result.score < 75) {
        await aiAgentService.createProactiveNotification(user.id, 'learning_reminder', {
          title: 'Resume Needs Optimization',
          message: `Your ATS score is ${result.score}/100. Let me help you improve it!`,
          priority: 'medium',
          actionRequired: true,
          suggestedActions: ['Fix formatting issues', 'Add relevant keywords', 'Improve impact statements']
        });
        
        loadNotifications(); // Refresh notifications
      }
      
      return result;
    } catch (error) {
      console.error('ATS check failed:', error);
      toast.error('Failed to analyze your resume');
      return null;
    }
  }, [user?.id, loadNotifications]);

  const tailorResumeToJob = useCallback(async (resumeContent: any, jobDescription: string) => {
    if (!user?.id) return null;

    try {
      toast.loading('Tailoring your resume to this job...', { id: 'resume-tailor' });
      
      const result = await aiAgentService.tailorResumeToJob(user.id, resumeContent, jobDescription);
      
      toast.success('Resume tailored successfully!', { id: 'resume-tailor' });
      
      // Create success notification
      await aiAgentService.createProactiveNotification(user.id, 'profile_view_spike', {
        title: 'Resume Optimized',
        message: 'Your resume has been tailored for better job matching. Ready to apply!',
        priority: 'medium',
        actionRequired: false
      });
      
      loadNotifications();
      return result;
    } catch (error) {
      console.error('Resume tailoring failed:', error);
      toast.error('Failed to tailor your resume', { id: 'resume-tailor' });
      return null;
    }
  }, [user?.id, loadNotifications]);

  const generateInterviewKit = useCallback(async (jobDescription: string) => {
    if (!user?.id || !profile) return null;

    try {
      toast.loading('Preparing your interview kit...', { id: 'interview-prep' });
      
      const result = await aiAgentService.generateInterviewKit(user.id, jobDescription, profile);
      
      toast.success('Interview kit ready!', { id: 'interview-prep' });
      
      return result;
    } catch (error) {
      console.error('Interview kit generation failed:', error);
      toast.error('Failed to prepare interview kit', { id: 'interview-prep' });
      return null;
    }
  }, [user?.id, profile]);

  const generateNetworkingContent = useCallback(async (goal: string) => {
    if (!user?.id || !profile) return null;

    try {
      toast.loading('Creating networking content...', { id: 'networking' });
      
      const result = await aiAgentService.generateNetworkingContent(user.id, goal, profile);
      
      toast.success('Networking content ready!', { id: 'networking' });
      
      return result;
    } catch (error) {
      console.error('Networking content generation failed:', error);
      toast.error('Failed to generate networking content', { id: 'networking' });
      return null;
    }
  }, [user?.id, profile]);

  // Auto-generate daily briefing on first load
  useEffect(() => {
    if (agent && !dailyBriefing) {
      generateDailyBriefing();
    }
  }, [agent, dailyBriefing, generateDailyBriefing]);

  // Load notifications on agent initialization
  useEffect(() => {
    if (agent) {
      loadNotifications();
    }
  }, [agent, loadNotifications]);

  // Create proactive notification for various triggers
  const createNotification = useCallback(async (
    type: ProactiveNotification['type'],
    data: Partial<ProactiveNotification>
  ) => {
    if (!user?.id) return;

    await aiAgentService.createProactiveNotification(user.id, type, data);
    loadNotifications();
  }, [user?.id, loadNotifications]);

  // Mark notification as read
  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      // Update notification status in backend
      // For now, just remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  return {
    // Agent state
    agent,
    dailyBriefing,
    notifications,
    isLoading,
    
    // Actions
    generateDailyBriefing,
    loadNotifications,
    createNotification,
    markNotificationRead,
    
    // AI Tools
    runATSCheck,
    tailorResumeToJob,
    generateInterviewKit,
    generateNetworkingContent,
    
    // Computed values
    hasNewBriefing: lastBriefingDate !== new Date().toDateString(),
    highPriorityNotifications: notifications.filter(n => n.priority === 'high'),
    urgentActions: dailyBriefing?.proactiveActions.filter(a => a.urgency === 'high') || []
  };
};