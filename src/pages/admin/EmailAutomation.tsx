import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { EmailAutomationManager } from '@/components/admin/EmailAutomationManager';
import { BulkWelcomeEmailSender } from '@/components/admin/BulkWelcomeEmailSender';
import { EmailQueueMonitor } from '@/components/admin/EmailQueueMonitor';

const EmailAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="Email Automation"
      description="Configure automated email templates and triggers for user actions"
    >
      <div className="space-y-6">
        <EmailQueueMonitor />
        <BulkWelcomeEmailSender />
        <EmailAutomationManager />
      </div>
    </UnifiedAdminLayout>
  );
};

export default EmailAutomationPage;