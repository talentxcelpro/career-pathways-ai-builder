import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { EmailAutomationManager } from '@/components/admin/EmailAutomationManager';
import { EmailAutomationDashboard } from '@/components/admin/EmailAutomationDashboard';
import { EmailQueueMonitor } from '@/components/admin/EmailQueueMonitor';
import { EmailConfigurationPanel } from '@/components/admin/EmailConfigurationPanel';
import { EmailSystemTester } from '@/components/admin/EmailSystemTester';
import { EmailTemplateManager } from '@/components/admin/EmailTemplateManager';
import { EmailAutomationQueueTester } from '@/components/admin/EmailAutomationQueueTester';
import EmailTemplateTest from '@/components/admin/EmailTemplateTest';
import { BulkEmailCampaign } from '@/components/admin/BulkEmailCampaign';
import { GrowthCommunicationSystem } from '@/components/admin/GrowthCommunicationSystem';
import { CommunicationDashboard } from '@/components/admin/CommunicationDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings, Monitor, TestTube, Clock, BarChart, Users, TrendingUp } from "lucide-react";

const EmailAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="Email Automation"
      description="Configure automated email templates, settings, and monitoring"
    >
      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="html-templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            HTML Templates
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="bulk-campaign" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Campaign
          </TabsTrigger>
          <TabsTrigger value="growth-system" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Growth System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6">
          <EmailAutomationDashboard />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <EmailAutomationManager />
        </TabsContent>

        <TabsContent value="html-templates" className="space-y-6">
          <EmailTemplateManager />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <EmailConfigurationPanel />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <EmailQueueMonitor />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <EmailSystemTester />
          <EmailTemplateTest />
          <EmailAutomationQueueTester />
        </TabsContent>

        <TabsContent value="bulk-campaign" className="space-y-6">
          <BulkEmailCampaign />
        </TabsContent>

        <TabsContent value="growth-system" className="space-y-6">
          <CommunicationDashboard />
          <GrowthCommunicationSystem />
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default EmailAutomationPage;