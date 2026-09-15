import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ComprehensiveNotificationSettings } from '@/components/notifications/ComprehensiveNotificationSettings';
import { AdvancedNotificationDashboard } from '@/components/notifications/AdvancedNotificationDashboard';
import { SEOHead } from '@/components/seo/SEOHead';
import { PageShell, Section } from '@/components/layout/PageShell';
import { PageHeader } from '@/components/layout/PageHeader';

const NotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Notifications | TalentXcel"
        description="Stay updated with real-time notifications about job matches, messages, and career opportunities."
        keywords={['notifications', 'alerts', 'job updates', 'messages', 'career notifications']}
      />

      <PageShell width="md" pad="md">
        <PageHeader
          eyebrow="Inbox"
          title="Notifications"
          description="Stay connected with real-time updates about your career journey."
        />

        <Section>
          <NotificationCenter />
        </Section>

        <Section>
          <ComprehensiveNotificationSettings />
        </Section>

        <Section>
          <AdvancedNotificationDashboard />
        </Section>
      </PageShell>
    </div>
  );
};

export default NotificationsPage;
