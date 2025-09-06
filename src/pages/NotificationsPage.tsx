import React from 'react';
import { LinkedInStyleNotificationCenter } from '@/components/notifications/LinkedInStyleNotificationCenter';
import { SEOHead } from '@/components/seo/SEOHead';

const NotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Notifications | TalentXcel"
        description="Stay updated with real-time notifications about job matches, messages, and career opportunities."
        keywords={['notifications', 'alerts', 'job updates', 'messages', 'career notifications']}
      />
      
      <LinkedInStyleNotificationCenter />
    </div>
  );
};

export default NotificationsPage;