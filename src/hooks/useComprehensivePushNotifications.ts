import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

export interface NotificationTemplate {
  type: string;
  category: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('push' | 'email' | 'in_app' | 'sms')[];
  schedule?: {
    immediate?: boolean;
    delay?: number; // minutes
    optimal_time?: boolean;
    recurring?: 'daily' | 'weekly' | 'monthly';
  };
  personalization?: {
    use_name?: boolean;
    use_skills?: boolean;
    use_location?: boolean;
    use_preferences?: boolean;
  };
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
}

export interface NotificationPreferences {
  categories: {
    career_growth: boolean;
    job_opportunities: boolean;
    social_interactions: boolean;
    tool_engagement: boolean;
    skill_development: boolean;
    achievement_milestones: boolean;
    urgent_alerts: boolean;
    system_updates: boolean;
  };
  channels: {
    push_notifications: boolean;
    email_notifications: boolean;
    in_app_notifications: boolean;
    sms_notifications: boolean;
  };
  timing: {
    quiet_hours_start: string;
    quiet_hours_end: string;
    timezone: string;
    optimal_time_enabled: boolean;
  };
  frequency: {
    max_daily_notifications: number;
    digest_frequency: 'none' | 'daily' | 'weekly';
    instant_notifications: boolean;
  };
  personalization: {
    use_ai_optimization: boolean;
    location_based: boolean;
    skill_based: boolean;
    activity_based: boolean;
  };
}

const DEFAULT_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  // Career Growth
  {
    type: 'profile_completion_reminder',
    category: 'career_growth',
    title: 'Complete Your Profile',
    message: 'Complete your profile to unlock better job matches and increase visibility',
    priority: 'medium',
    channels: ['push', 'in_app'],
    schedule: { delay: 60, optimal_time: true },
    personalization: { use_name: true },
    actions: [{ label: 'Complete Now', action: 'navigate', url: '/profile' }]
  },
  {
    type: 'skill_assessment_available',
    category: 'career_growth',
    title: 'New Skill Assessment Available',
    message: 'Test your {{skill}} skills and boost your profile strength',
    priority: 'medium',
    channels: ['push', 'email', 'in_app'],
    personalization: { use_skills: true, use_name: true }
  },
  {
    type: 'career_milestone_achieved',
    category: 'achievement_milestones',
    title: 'Congratulations! 🎉',
    message: 'You\'ve achieved a new career milestone: {{milestone}}',
    priority: 'high',
    channels: ['push', 'in_app'],
    schedule: { immediate: true }
  },
  
  // Job Opportunities
  {
    type: 'perfect_job_match',
    category: 'job_opportunities',
    title: 'Perfect Job Match Found!',
    message: 'We found a {{job_title}} role that matches your skills perfectly',
    priority: 'high',
    channels: ['push', 'email', 'in_app'],
    schedule: { immediate: true },
    personalization: { use_skills: true, use_location: true },
    actions: [{ label: 'View Job', action: 'navigate', url: '/jobs/{{job_id}}' }]
  },
  {
    type: 'application_status_update',
    category: 'job_opportunities',
    title: 'Application Update',
    message: 'Your application for {{job_title}} has been {{status}}',
    priority: 'high',
    channels: ['push', 'email', 'in_app'],
    schedule: { immediate: true }
  },
  {
    type: 'salary_insights_available',
    category: 'job_opportunities',
    title: 'Salary Insights for Your Role',
    message: 'New salary data available for {{role}} in {{location}}',
    priority: 'medium',
    channels: ['push', 'in_app'],
    personalization: { use_location: true }
  },

  // Social Interactions
  {
    type: 'connection_request',
    category: 'social_interactions',
    title: 'New Connection Request',
    message: '{{sender_name}} wants to connect with you',
    priority: 'medium',
    channels: ['push', 'in_app'],
    schedule: { immediate: true },
    actions: [{ label: 'View Profile', action: 'navigate', url: '/network/people/{{sender_id}}' }]
  },
  {
    type: 'profile_viewed',
    category: 'social_interactions',
    title: 'Profile View',
    message: '{{viewer_name}} viewed your profile',
    priority: 'low',
    channels: ['in_app'],
    schedule: { delay: 30 }
  },
  {
    type: 'network_milestone',
    category: 'achievement_milestones',
    title: 'Network Milestone! 🌟',
    message: 'You now have {{count}} professional connections',
    priority: 'medium',
    channels: ['push', 'in_app']
  },

  // Tool Engagement
  {
    type: 'resume_improvement_tip',
    category: 'tool_engagement',
    title: 'Resume Improvement Tip',
    message: 'Your resume score increased! Here\'s how to improve it further',
    priority: 'medium',
    channels: ['push', 'in_app'],
    schedule: { optimal_time: true },
    actions: [{ label: 'Improve Resume', action: 'navigate', url: '/tools/resume-builder' }]
  },
  {
    type: 'ai_assistant_suggestion',
    category: 'tool_engagement',
    title: 'AI Assistant Suggestion',
    message: 'Based on your profile, try our {{tool_name}} tool',
    priority: 'low',
    channels: ['in_app'],
    schedule: { delay: 120, optimal_time: true }
  },

  // Skill Development
  {
    type: 'learning_path_recommended',
    category: 'skill_development',
    title: 'Personalized Learning Path',
    message: 'We\'ve created a learning path to advance your {{skill}} skills',
    priority: 'medium',
    channels: ['push', 'email', 'in_app'],
    personalization: { use_skills: true }
  },
  {
    type: 'industry_trend_alert',
    category: 'skill_development',
    title: 'Industry Trend Alert',
    message: '{{trend}} is trending in your industry. Stay ahead!',
    priority: 'medium',
    channels: ['push', 'in_app']
  },

  // Urgent Alerts
  {
    type: 'job_deadline_approaching',
    category: 'urgent_alerts',
    title: 'Job Application Deadline',
    message: 'Application for {{job_title}} closes in {{hours}} hours',
    priority: 'urgent',
    channels: ['push', 'email', 'in_app'],
    schedule: { immediate: true },
    actions: [{ label: 'Apply Now', action: 'navigate', url: '/jobs/{{job_id}}' }]
  },
  {
    type: 'interview_reminder',
    category: 'urgent_alerts',
    title: 'Interview Reminder',
    message: 'Your interview with {{company}} is in {{time}}',
    priority: 'urgent',
    channels: ['push', 'sms', 'in_app'],
    schedule: { immediate: true }
  }
];

export const useComprehensivePushNotifications = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize push notification system
  const initialize = useCallback(async () => {
    if (!user || isInitialized) return;

    try {
      setIsLoading(true);
      
      // Load user preferences
      await loadPreferences();
      
      // Setup push notifications
      if (Capacitor.isNativePlatform()) {
        await setupNativePush();
      } else {
        await setupWebPush();
      }
      
      // Setup notification listeners
      await setupNotificationListeners();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isInitialized]);

  // Load user notification preferences
  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences(data.preferences);
      } else {
        // Create default preferences
        const defaultPrefs: NotificationPreferences = {
          categories: {
            career_growth: true,
            job_opportunities: true,
            social_interactions: true,
            tool_engagement: true,
            skill_development: true,
            achievement_milestones: true,
            urgent_alerts: true,
            system_updates: false
          },
          channels: {
            push_notifications: true,
            email_notifications: true,
            in_app_notifications: true,
            sms_notifications: false
          },
          timing: {
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            optimal_time_enabled: true
          },
          frequency: {
            max_daily_notifications: 10,
            digest_frequency: 'daily',
            instant_notifications: true
          },
          personalization: {
            use_ai_optimization: true,
            location_based: true,
            skill_based: true,
            activity_based: true
          }
        };

        await savePreferences(defaultPrefs);
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  // Save user notification preferences
  const savePreferences = async (newPreferences: NotificationPreferences) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences: newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setPreferences(newPreferences);
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  // Setup web push notifications
  const setupWebPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push messaging not supported');
      return;
    }

    try {
      // Register enhanced service worker
      const registration = await navigator.serviceWorker.register('/sw-notifications.js');
      console.log('Enhanced service worker registered');

      // Check permissions
      setPermission(Notification.permission);

      // Get existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        await registerPushToken(JSON.stringify(existingSubscription), 'web');
      }

    } catch (error) {
      console.error('Web push setup failed:', error);
    }
  };

  // Setup native push notifications
  const setupNativePush = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
        setPermission('granted');
      }

      // Setup listeners
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        await registerPushToken(token.value, 'mobile');
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });

    } catch (error) {
      console.error('Native push setup failed:', error);
    }
  };

  // Setup notification listeners for real-time updates
  const setupNotificationListeners = async () => {
    if (!user) return;

    const channel = supabase
      .channel(`comprehensive_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const notification = payload.new;
          await processNotification(notification);
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  };

  // Process incoming notifications based on preferences
  const processNotification = async (notification: any) => {
    if (!preferences) return;

    const template = getTemplateForNotification(notification.type);
    if (!template) return;

    // Check if category is enabled
    const categoryEnabled = preferences.categories[template.category as keyof typeof preferences.categories];
    if (!categoryEnabled) return;

    // Check quiet hours
    if (isInQuietHours()) return;

    // Check daily limit
    if (await hasExceededDailyLimit()) return;

    // Send through enabled channels
    if (preferences.channels.push_notifications && template.channels.includes('push')) {
      await sendPushNotification(notification, template);
    }

    if (preferences.channels.email_notifications && template.channels.includes('email')) {
      await scheduleEmailNotification(notification, template);
    }

    // In-app notifications are always shown
    if (template.channels.includes('in_app')) {
      showInAppNotification(notification, template);
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    setIsLoading(true);
    
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Permission denied for notifications');
        return;
      }

      if (Capacitor.isNativePlatform()) {
        await PushNotifications.register();
      } else {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f40SawaN-F72YOFApNfUpVJ4LxoLHCkFCVRJfySpZ8_Q24eWBJA'
          )
        });

        setSubscription(subscription);
        await registerPushToken(JSON.stringify(subscription), 'web');
      }

      toast.success('Push notifications enabled!');
    } catch (error) {
      console.error('Subscribe failed:', error);
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Send notification through all appropriate channels
  const sendComprehensiveNotification = async (
    type: string,
    data: Record<string, any> = {},
    targetUsers?: string[]
  ) => {
    try {
      const template = getTemplateForNotification(type);
      if (!template) {
        console.error('No template found for notification type:', type);
        return;
      }

      await supabase.functions.invoke('send-comprehensive-notification', {
        body: {
          type,
          template,
          data,
          target_users: targetUsers || (user ? [user.id] : []),
          preferences: preferences
        }
      });

    } catch (error) {
      console.error('Failed to send comprehensive notification:', error);
    }
  };

  // Utility functions
  const getTemplateForNotification = (type: string): NotificationTemplate | undefined => {
    return DEFAULT_NOTIFICATION_TEMPLATES.find(t => t.type === type);
  };

  const isInQuietHours = (): boolean => {
    if (!preferences) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const { quiet_hours_start, quiet_hours_end } = preferences.timing;
    
    if (quiet_hours_start < quiet_hours_end) {
      return currentTime >= quiet_hours_start && currentTime <= quiet_hours_end;
    } else {
      return currentTime >= quiet_hours_start || currentTime <= quiet_hours_end;
    }
  };

  const hasExceededDailyLimit = async (): Promise<boolean> => {
    if (!user || !preferences) return false;

    const today = new Date().toISOString().split('T')[0];
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (error) return false;
    return (count || 0) >= preferences.frequency.max_daily_notifications;
  };

  const sendPushNotification = async (notification: any, template: NotificationTemplate) => {
    // Implementation for sending push notification
  };

  const scheduleEmailNotification = async (notification: any, template: NotificationTemplate) => {
    // Implementation for scheduling email notification
  };

  const showInAppNotification = (notification: any, template: NotificationTemplate) => {
    // Implementation for showing in-app notification
  };

  const registerPushToken = async (token: string, platform: string) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('register-push-token', {
        body: { push_token: token, platform, user_id: user.id }
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initialize();
    }
  }, [user, initialize]);

  return {
    isInitialized,
    subscription,
    permission,
    preferences,
    isLoading,
    subscribeToPush,
    savePreferences,
    sendComprehensiveNotification,
    templates: DEFAULT_NOTIFICATION_TEMPLATES
  };
};