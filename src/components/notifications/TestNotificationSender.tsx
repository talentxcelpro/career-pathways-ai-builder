import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const TestNotificationSender: React.FC = () => {
  const { user } = useAuth();

  const sendTestNotification = async (type: string) => {
    if (!user) {
      toast.error('Please log in to test notifications');
      return;
    }

    const notifications = {
      profile_completion_reminder: {
        title: 'Complete Your TalentXcel Profile',
        body: 'Unlock all features by completing your profile',
        rich_content: `Hello ${user.email?.split('@')[0] || 'there'}! 🎯 

Complete your profile to access premium features like:
• Advanced job matching
• Priority applications
• Networking opportunities
• Career insights`,
        actions: [
          { action: 'complete', label: 'Complete Now', url: '/profile' },
          { action: 'dismiss', label: 'Later' }
        ]
      },
      welcome: {
        title: 'Welcome to TalentXcel! 🎉',
        body: 'Your career journey starts here',
        rich_content: `Welcome to TalentXcel, ${user.email?.split('@')[0] || 'there'}! 

We're excited to help you:
🚀 Find your dream job
🤝 Connect with professionals
📈 Advance your career
✨ Unlock opportunities`,
        actions: [
          { action: 'explore', label: 'Explore Jobs', url: '/jobs' },
          { action: 'profile', label: 'Setup Profile', url: '/profile' }
        ]
      },
      job_match: {
        title: 'New Job Match Found! 💼',
        body: 'We found 3 jobs that match your skills perfectly',
        rich_content: `Great news! We found jobs that match your profile:

🎯 Frontend Developer at TechCorp
💰 $80k - $120k per year
📍 Remote / San Francisco
⭐ 95% skill match

Ready to apply?`,
        actions: [
          { action: 'view_job', label: 'View Jobs', url: '/jobs' },
          { action: 'dismiss', label: 'Not Now' }
        ]
      }
    };

    try {
      const notificationData = notifications[type];
      
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_ids: [user.id],
          title: notificationData.title,
          body: notificationData.body,
          trigger_type: type,
          rich_content: notificationData.rich_content,
          actions: notificationData.actions,
          priority: 'normal',
          data: {
            url: '/',
            test: true
          }
        }
      });

      if (error) throw error;
      
      toast.success(`${type} notification sent!`);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Test Rich Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => sendTestNotification('profile_completion_reminder')}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          ✨ Profile Completion
        </Button>
        
        <Button 
          onClick={() => sendTestNotification('welcome')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          🎉 Welcome Message
        </Button>
        
        <Button 
          onClick={() => sendTestNotification('job_match')}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          💼 Job Match
        </Button>
      </CardContent>
    </Card>
  );
};