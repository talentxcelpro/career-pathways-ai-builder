import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { EmailAutomationManager } from '@/components/admin/EmailAutomationManager';
import { BulkWelcomeEmailSender } from '@/components/admin/BulkWelcomeEmailSender';
import { EmailQueueMonitor } from '@/components/admin/EmailQueueMonitor';
import { EmailConfigurationPanel } from '@/components/admin/EmailConfigurationPanel';
import { EmailSystemTester } from '@/components/admin/EmailSystemTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings, Monitor, Send, TestTube } from "lucide-react";

const EmailAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="Email Automation"
      description="Configure automated email templates, settings, and monitoring"
    >
      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
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

        <TabsContent value="testing" className="space-y-6">
          <EmailSystemTester />
        </TabsContent>

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