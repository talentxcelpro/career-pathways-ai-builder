import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { EmailAutomationManager } from '@/components/admin/EmailAutomationManager';
import { BulkWelcomeEmailSender } from '@/components/admin/BulkWelcomeEmailSender';
import { EmailQueueMonitor } from '@/components/admin/EmailQueueMonitor';
import { EmailConfigurationPanel } from '@/components/admin/EmailConfigurationPanel';
import { EmailSystemTester } from '@/components/admin/EmailSystemTester';
import { EmailTemplateManager } from '@/components/admin/EmailTemplateManager';
import { EmailAutomationQueueTester } from '@/components/admin/EmailAutomationQueueTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings, Monitor, Send, TestTube, Clock } from "lucide-react";

const EmailAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="Email Automation"
      description="Configure automated email templates, settings, and monitoring"
    >
      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="html-templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            HTML Templates
          </TabsTrigger>
          <TabsTrigger value="queue-test" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Queue Test
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

        <TabsContent value="html-templates" className="space-y-6">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="queue-test" className="space-y-6">
          <EmailAutomationQueueTester />
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