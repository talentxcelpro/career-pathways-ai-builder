import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Bell, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { usePersonalizedAIAgent } from '@/hooks/usePersonalizedAIAgent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationEvent {
  type: 'job_deadline' | 'profile_view_spike' | 'new_connections' | 'learning_reminder' | 'market_opportunity';
  data: any;
}

export const ProactiveNotificationSystem: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markNotificationRead, createNotification } = usePersonalizedAIAgent();
  const [activeNotifications, setActiveNotifications] = useState<typeof notifications>([]);

  // Set up real-time event listeners
  useEffect(() => {
    if (!user?.id) return;

    // Listen for various events that should trigger proactive notifications
    const eventListeners = [
      // Job application deadline approaching
      createJobDeadlineWatcher(),
      // Profile view spike detector
      createProfileViewWatcher(),
      // New connection notifications
      createConnectionWatcher(),
      // Learning progress reminders
      createLearningReminderWatcher(),
      // Market opportunity alerts
      createMarketOpportunityWatcher()
    ];

    return () => {
      eventListeners.forEach(cleanup => cleanup?.());
    };
  }, [user?.id]);

  // Update active notifications when new ones arrive
  useEffect(() => {
    setActiveNotifications(notifications.slice(0, 3)); // Show max 3 active notifications
  }, [notifications]);

  // Auto-dismiss low priority notifications after 30 seconds
  useEffect(() => {
    activeNotifications.forEach(notification => {
      if (notification.priority === 'low') {
        const timer = setTimeout(() => {
          markNotificationRead(notification.id);
        }, 30000);

        return () => clearTimeout(timer);
      }
    });
  }, [activeNotifications, markNotificationRead]);

  const createJobDeadlineWatcher = () => {
    // Watch for jobs user has viewed/saved that are expiring soon
    const checkJobDeadlines = async () => {
      try {
        const { data: userJobs } = await supabase
          .from('job_applications')
          .select(`
            job_id,
            jobs (
              id,
              title,
              company_name,
              expires_at
            )
          `)
          .eq('user_id', user?.id)
          .eq('status', 'draft'); // Saved but not submitted

        userJobs?.forEach(application => {
          const job = application.jobs as any;
          if (job?.expires_at) {
            const hoursUntilExpiry = (new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60);
            
            if (hoursUntilExpiry <= 48 && hoursUntilExpiry > 0) {
              createNotification('job_deadline', {
                title: `Job Deadline Alert: ${job.title}`,
                message: `Your saved job at ${job.company_name} expires in ${Math.round(hoursUntilExpiry)} hours. Complete your application now!`,
                priority: 'high',
                actionRequired: true,
                suggestedActions: ['Complete Application', 'Tailor Resume', 'Write Cover Letter'],
                expiresAt: job.expires_at
              });
            }
          }
        });
      } catch (error) {
        console.error('Error checking job deadlines:', error);
      }
    };

    // Check every hour
    const interval = setInterval(checkJobDeadlines, 60 * 60 * 1000);
    checkJobDeadlines(); // Initial check

    return () => clearInterval(interval);
  };

  const createProfileViewWatcher = () => {
    // Monitor profile view spikes
    const checkProfileViews = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_views_count, last_profile_view_check')
          .eq('id', user?.id)
          .single();

        if (profile) {
          const lastCheck = profile.last_profile_view_check ? new Date(profile.last_profile_view_check) : new Date(Date.now() - 24 * 60 * 60 * 1000);
          const currentViews = profile.profile_views_count || 0;
          
          // If views increased significantly (more than 5 in 24h), create notification
          const viewsIncrease = currentViews - (lastCheck ? 0 : currentViews); // Simplified calculation
          
          if (viewsIncrease >= 5) {
            createNotification('profile_view_spike', {
              title: 'Profile Momentum Building!',
              message: `Your profile views increased by ${viewsIncrease} in the last 24 hours. Capitalize on this visibility!`,
              priority: 'medium',
              actionRequired: false,
              suggestedActions: ['Share a Professional Update', 'Connect with Viewers', 'Update Your Status']
            });

            // Update last check timestamp
            await supabase
              .from('profiles')
              .update({ last_profile_view_check: new Date().toISOString() })
              .eq('id', user?.id);
          }
        }
      } catch (error) {
        console.error('Error checking profile views:', error);
      }
    };

    // Check every 6 hours
    const interval = setInterval(checkProfileViews, 6 * 60 * 60 * 1000);
    checkProfileViews(); // Initial check

    return () => clearInterval(interval);
  };

  const createConnectionWatcher = () => {
    // Real-time connection request notifications
    const subscription = supabase
      .channel('connection_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${user?.id}`
        },
        async (payload) => {
          const connection = payload.new;
          
          // Get requester info
          const { data: requester } = await supabase
            .from('profiles')
            .select('full_name, title, profile_picture_url')
            .eq('id', connection.requester_id)
            .single();

          if (requester) {
            createNotification('new_connections', {
              title: 'New Connection Request',
              message: `${requester.full_name} (${requester.title || 'Professional'}) wants to connect with you.`,
              priority: 'medium',
              actionRequired: true,
              suggestedActions: ['View Profile', 'Accept Request', 'Send Message']
            });

            // Also show toast for immediate attention
            toast.info(`New connection request from ${requester.full_name}`, {
              action: {
                label: 'View',
                onClick: () => window.location.href = '/network/requests'
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const createLearningReminderWatcher = () => {
    // Check for stale learning progress
    const checkLearningProgress = async () => {
      try {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select(`
            id,
            progress,
            last_accessed,
            learning_paths (title)
          `)
          .eq('user_id', user?.id)
          .lt('progress', 100)
          .order('last_accessed', { ascending: true });

        enrollments?.forEach(enrollment => {
          const daysSinceAccess = enrollment.last_accessed ? 
            (Date.now() - new Date(enrollment.last_accessed).getTime()) / (1000 * 60 * 60 * 24) : 7;

          if (daysSinceAccess >= 3 && enrollment.progress > 10) {
            createNotification('learning_reminder', {
              title: 'Continue Your Learning Journey',
              message: `You're ${enrollment.progress}% through "${(enrollment.learning_paths as any)?.title}". Keep the momentum going!`,
              priority: 'low',
              actionRequired: false,
              suggestedActions: ['Resume Learning', 'View Progress', 'Set Reminder']
            });
          }
        });
      } catch (error) {
        console.error('Error checking learning progress:', error);
      }
    };

    // Check every 12 hours
    const interval = setInterval(checkLearningProgress, 12 * 60 * 60 * 1000);
    checkLearningProgress(); // Initial check

    return () => clearInterval(interval);
  };

  const createMarketOpportunityWatcher = () => {
    // Monitor for relevant market opportunities
    const checkMarketOpportunities = async () => {
      try {
        // Get user's skills and target roles
        const { data: profile } = await supabase
          .from('profiles')
          .select('skills, target_roles')
          .eq('id', user?.id)
          .single();

        if (profile?.skills) {
          // Check for trending skills that match user's profile
          const { data: trendingSkills } = await supabase
            .from('market_trends')
            .select('*')
            .in('skill_name', profile.skills)
            .gt('growth_rate', 20) // 20% growth
            .order('growth_rate', { ascending: false })
            .limit(3);

          trendingSkills?.forEach(skill => {
            createNotification('market_opportunity', {
              title: `Your Skill is Trending: ${skill.skill_name}`,
              message: `${skill.skill_name} demand is up ${skill.growth_rate}%. Perfect time to showcase this skill!`,
              priority: 'medium',
              actionRequired: false,
              suggestedActions: ['Update Resume', 'Share Experience Post', 'Look for Opportunities']
            });
          });
        }
      } catch (error) {
        console.error('Error checking market opportunities:', error);
      }
    };

    // Check twice daily
    const interval = setInterval(checkMarketOpportunities, 12 * 60 * 60 * 1000);
    checkMarketOpportunities(); // Initial check

    return () => clearInterval(interval);
  };

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {activeNotifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={() => markNotificationRead(notification.id)}
        />
      ))}
    </div>
  );
};

const NotificationCard: React.FC<{
  notification: any;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (notification.type) {
      case 'job_deadline':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'profile_view_spike':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'new_connections':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'learning_reminder':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'market_opportunity':
        return <ArrowRight className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-destructive bg-destructive/5';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/5';
      case 'low':
        return 'border-blue-500 bg-blue-500/5';
      default:
        return 'border-border bg-background';
    }
  };

  return (
    <Card 
      className={`
        ${getPriorityColor()}
        shadow-lg transition-all duration-300 ease-in-out transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
            
            {notification.suggestedActions && notification.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {notification.suggestedActions.slice(0, 2).map((action: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                    {action}
                  </Badge>
                ))}
              </div>
            )}

            {notification.actionRequired && (
              <Button size="sm" className="w-full mt-3 h-7 text-xs">
                Take Action
              </Button>
            )}
          </div>
        </div>
        
        {notification.priority === 'high' && (
          <div className="mt-3 pt-2 border-t border-destructive/20">
            <Badge variant="destructive" className="text-xs">
              Urgent Action Required
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};