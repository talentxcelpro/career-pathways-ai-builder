import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { EmailAutomationManager } from '@/components/admin/EmailAutomationManager';
import { BulkWelcomeEmailSender } from '@/components/admin/BulkWelcomeEmailSender';
import { EmailQueueMonitor } from '@/components/admin/EmailQueueMonitor';
import { EmailConfigurationPanel } from '@/components/admin/EmailConfigurationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings, Monitor, Send } from "lucide-react";

const EmailAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="Email Automation"
      description="Configure automated email templates, settings, and monitoring"
    >
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="bulk-send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Bulk Send
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <EmailAutomationManager />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <EmailConfigurationPanel />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <EmailQueueMonitor />
        </TabsContent>

        <TabsContent value="bulk-send" className="space-y-6">
          <BulkWelcomeEmailSender />
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default EmailAutomationPage;