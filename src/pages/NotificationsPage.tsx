import React from 'react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { ComprehensiveNotificationSettings } from '@/components/notifications/ComprehensiveNotificationSettings';
import { AdvancedNotificationDashboard } from '@/components/notifications/AdvancedNotificationDashboard';
import { SEOHead } from '@/components/seo/SEOHead';

const NotificationsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Notifications | TalentXcel"
        description="Stay updated with real-time notifications about job matches, messages, and career opportunities."
        keywords={['notifications', 'alerts', 'job updates', 'messages', 'career notifications']}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Notifications
            </h1>
            <p className="text-gray-600">
              Stay connected with real-time updates about your career journey
            </p>
          </div>
          
          <NotificationCenter />
          
          <div className="mt-8">
            <ComprehensiveNotificationSettings />
          </div>
          
          <div className="mt-8">
            <AdvancedNotificationDashboard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;