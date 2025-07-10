import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { EmailAutomationManager } from '@/components/admin/EmailAutomationManager';

const EmailAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="Email Automation"
      description="Configure automated email templates and triggers for user actions"
    >
      <EmailAutomationManager />
    </UnifiedAdminLayout>
  );
};

export default EmailAutomationPage;