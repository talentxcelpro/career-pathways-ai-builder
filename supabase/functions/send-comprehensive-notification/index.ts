import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComprehensiveNotificationRequest {
  type: string;
  template: {
    type: string;
    category: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    channels: ('push' | 'email' | 'in_app' | 'sms')[];
    schedule?: {
      immediate?: boolean;
      delay?: number;
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
  };
  data: Record<string, any>;
  target_users: string[];
  preferences?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const requestBody: ComprehensiveNotificationRequest = await req.json();
    const { type, template, data, target_users, preferences } = requestBody;

    console.log('Processing comprehensive notification:', { type, target_users: target_users.length });

    let notifications_created = 0;
    let push_notifications_sent = 0;
    let email_notifications_scheduled = 0;
    let errors: string[] = [];

    for (const userId of target_users) {
      try {
        // Get user profile for personalization
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, location, skills')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          errors.push(`Failed to fetch profile for user ${userId}`);
          continue;
        }

        // Get user notification preferences
        const { data: userPrefs, error: prefsError } = await supabase
          .from('notification_preferences')
          .select('preferences')
          .eq('user_id', userId)
          .single();

        const effectivePrefs = userPrefs?.preferences || preferences;

        // Check if user has this category enabled
        if (effectivePrefs?.categories && !effectivePrefs.categories[template.category]) {
          console.log(`User ${userId} has disabled category ${template.category}`);
          continue;
        }

        // Check quiet hours
        if (isInQuietHours(effectivePrefs)) {
          console.log(`User ${userId} is in quiet hours, scheduling for later`);
          // Schedule for later - implement scheduling logic
        }

        // Personalize the notification
        const personalizedTitle = personalizeText(template.title, profile, data);
        const personalizedMessage = personalizeText(template.message, profile, data);

        // Create in-app notification (always created)
        if (template.channels.includes('in_app')) {
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: template.type,
              module: getModuleFromCategory(template.category),
              title: personalizedTitle,
              message: personalizedMessage,
              priority: template.priority,
              icon: getIconForType(template.type),
              link: template.actions?.[0]?.url || '/notifications',
              sound: template.priority === 'high' || template.priority === 'urgent',
              created_at: new Date().toISOString()
            });

          if (notificationError) {
            console.error('Error creating notification:', notificationError);
            errors.push(`Failed to create notification for user ${userId}`);
          } else {
            notifications_created++;
          }
        }

        // Send push notification if enabled
        if (template.channels.includes('push') && 
            effectivePrefs?.channels?.push_notifications !== false) {
          await sendPushNotification(userId, personalizedTitle, personalizedMessage, template, supabase);
          push_notifications_sent++;
        }

        // Schedule email notification if enabled
        if (template.channels.includes('email') && 
            effectivePrefs?.channels?.email_notifications !== false) {
          await scheduleEmailNotification(userId, personalizedTitle, personalizedMessage, template, profile, supabase);
          email_notifications_scheduled++;
        }

        // Send SMS if enabled (future implementation)
        if (template.channels.includes('sms') && 
            effectivePrefs?.channels?.sms_notifications === true) {
          // SMS implementation would go here
        }

      } catch (userError: any) {
        console.error(`Error processing notification for user ${userId}:`, userError);
        errors.push(`Error processing user ${userId}: ${userError?.message || 'Unknown error'}`);
      }
    }

    // Log the notification event for analytics
    await supabase
      .from('notification_analytics')
      .insert({
        notification_type: type,
        category: template.category,
        users_targeted: target_users.length,
        notifications_created,
        push_sent: push_notifications_sent,
        emails_scheduled: email_notifications_scheduled,
        errors_count: errors.length,
        created_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comprehensive notifications processed',
        stats: {
          users_targeted: target_users.length,
          notifications_created,
          push_notifications_sent,
          email_notifications_scheduled,
          errors_count: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in comprehensive notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

// Helper functions
function personalizeText(text: string, profile: any, data: any): string {
  let result = text;
  
  // Replace profile-based placeholders
  if (profile) {
    result = result.replace(/\{\{name\}\}/g, profile.full_name || 'there');
    result = result.replace(/\{\{location\}\}/g, profile.location || 'your area');
    result = result.replace(/\{\{skill\}\}/g, profile.skills?.[0] || 'your skills');
  }
  
  // Replace data-based placeholders
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(placeholder, String(value));
  });
  
  return result;
}

function getModuleFromCategory(category: string): string {
  const categoryToModule: Record<string, string> = {
    'career_growth': 'career_map',
    'job_opportunities': 'jobs',
    'social_interactions': 'network',
    'tool_engagement': 'tools',
    'skill_development': 'learning',
    'achievement_milestones': 'career_map',
    'urgent_alerts': 'jobs',
    'system_updates': 'network'
  };
  
  return categoryToModule[category] || 'network';
}

function getIconForType(type: string): string {
  const typeToIcon: Record<string, string> = {
    'profile_completion_reminder': 'user',
    'skill_assessment_available': 'brain',
    'career_milestone_achieved': 'trophy',
    'perfect_job_match': 'briefcase',
    'application_status_update': 'file-text',
    'salary_insights_available': 'dollar-sign',
    'connection_request': 'user-plus',
    'profile_viewed': 'eye',
    'network_milestone': 'users',
    'resume_improvement_tip': 'file-edit',
    'ai_assistant_suggestion': 'sparkles',
    'learning_path_recommended': 'book-open',
    'industry_trend_alert': 'trending-up',
    'job_deadline_approaching': 'clock',
    'interview_reminder': 'calendar'
  };
  
  return typeToIcon[type] || 'bell';
}

function isInQuietHours(preferences: any): boolean {
  if (!preferences?.timing) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const { quiet_hours_start, quiet_hours_end } = preferences.timing;
  
  if (!quiet_hours_start || !quiet_hours_end) return false;
  
  if (quiet_hours_start < quiet_hours_end) {
    return currentTime >= quiet_hours_start && currentTime <= quiet_hours_end;
  } else {
    return currentTime >= quiet_hours_start || currentTime <= quiet_hours_end;
  }
}

async function sendPushNotification(
  userId: string, 
  title: string, 
  message: string, 
  template: any, 
  supabase: any
) {
  try {
    // Get user's push tokens
    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('push_token, platform')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !tokens?.length) {
      console.log(`No active push tokens for user ${userId}`);
      return;
    }

    for (const token of tokens) {
      if (token.platform === 'web') {
        // Send web push notification
        const webPushPayload = {
          title,
          body: message,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `notification_${Date.now()}`,
          data: {
            url: template.actions?.[0]?.url || '/notifications',
            priority: template.priority
          },
          actions: template.actions?.slice(0, 2).map((action: any, index: number) => ({
            action: `action_${index}`,
            title: action.label,
            icon: '/icon-192.png'
          })) || []
        };

        // In a real implementation, you would use a service like FCM or OneSignal
        console.log('Would send web push:', webPushPayload);
        
      } else if (token.platform === 'mobile') {
        // Send mobile push notification
        const mobilePushPayload = {
          to: token.push_token,
          title,
          body: message,
          priority: template.priority === 'high' ? 'high' : 'normal',
          data: {
            url: template.actions?.[0]?.url || '/notifications',
            type: template.type
          }
        };

        console.log('Would send mobile push:', mobilePushPayload);
      }
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

async function scheduleEmailNotification(
  userId: string,
  title: string,
  message: string,
  template: any,
  profile: any,
  supabase: any
) {
  try {
    // Schedule email through email automation queue
    const emailData = {
      recipient_email: profile.email,
      recipient_name: profile.full_name,
      subject: title,
      template_type: template.type,
      template_data: {
        title,
        message,
        actions: template.actions,
        priority: template.priority
      },
      scheduled_at: template.schedule?.delay ? 
        new Date(Date.now() + (template.schedule.delay * 60 * 1000)).toISOString() :
        new Date().toISOString()
    };

    const { error } = await supabase
      .from('email_automation_queue')
      .insert(emailData);

    if (error) {
      console.error('Error scheduling email:', error);
    } else {
      console.log('Email scheduled for user:', userId);
    }
  } catch (error) {
    console.error('Error in email scheduling:', error);
  }
}

serve(handler);