import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type TestNotificationType = 'profile_completion_reminder' | 'welcome' | 'job_match';

const TEST_NOTIFICATIONS: Record<TestNotificationType, {
  title: string;
  body: string;
  richContent: (name: string) => string;
  actions: Array<{ action: string; label: string; url?: string }>;
}> = {
  profile_completion_reminder: {
    title: 'Complete Your TalentXcel Profile',
    body: 'Unlock stronger career signals by completing your profile',
    richContent: (name) => `Hello ${name}.

Complete your profile to access:
- Precision Match roles
- Priority applications
- Talent Network opportunities
- Intelligence Metrics`,
    actions: [
      { action: 'complete', label: 'Complete Now', url: '/profile' },
      { action: 'dismiss', label: 'Later' },
    ],
  },
  welcome: {
    title: 'Welcome to TalentXcel',
    body: 'Your career momentum starts here',
    richContent: (name) => `Welcome to TalentXcel, ${name}.

TalentXcel helps you:
- Find your next role
- Build your Talent Network
- Advance your career
- Unlock opportunities`,
    actions: [
      { action: 'explore', label: 'Explore Jobs', url: '/jobs' },
      { action: 'profile', label: 'Set Up Profile', url: '/profile' },
    ],
  },
  job_match: {
    title: 'New Precision Match Found',
    body: 'We found roles that match your strongest skills',
    richContent: () => `Great news. We found roles that match your profile:

- Frontend Developer at TechCorp
- $80k - $120k per year
- Remote / San Francisco
- 95% skill match

Ready to apply?`,
    actions: [
      { action: 'view_job', label: 'View Jobs', url: '/jobs' },
      { action: 'dismiss', label: 'Not Now' },
    ],
  },
};

export const TestNotificationSender: React.FC = () => {
  const { user } = useAuth();

  const sendTestNotification = async (type: TestNotificationType) => {
    if (!user) {
      toast.error('Please sign in to test notifications');
      return;
    }

    const notificationData = TEST_NOTIFICATIONS[type];
    const name = user.email?.split('@')[0] || 'there';

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_ids: [user.id],
          title: notificationData.title,
          body: notificationData.body,
          trigger_type: type,
          rich_content: notificationData.richContent(name),
          actions: notificationData.actions,
          priority: 'normal',
          data: {
            url: '/',
            test: true,
          },
        },
      });

      if (error) throw error;

      toast.success('Test notification sent');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Could not send test notification');
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
          Profile Completion
        </Button>

        <Button
          onClick={() => sendTestNotification('welcome')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Welcome Message
        </Button>

        <Button
          onClick={() => sendTestNotification('job_match')}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Precision Match
        </Button>
      </CardContent>
    </Card>
  );
};
