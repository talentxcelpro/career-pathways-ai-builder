import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Settings, BarChart3, TestTube, Users, Calendar, Send } from 'lucide-react';
import { EventManagement } from '@/components/admin/email/EventManagement';
import { TemplateManagement } from '@/components/admin/email/TemplateManagement';
import { CampaignManagement } from '@/components/admin/email/CampaignManagement';
import { ABTestingDashboard } from '@/components/admin/email/ABTestingDashboard';
import { EmailAnalyticsDashboard } from '@/components/admin/email/EmailAnalyticsDashboard';
import { QueueMonitor } from '@/components/admin/email/QueueMonitor';
import { SendEmailTest } from '@/components/admin/email/SendEmailTest';

const EmailAutomation = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <UnifiedAdminLayout 
      title="Email Automation System"
      description="Comprehensive email automation for all TalentXcel modules"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Campaigns</span>
          </TabsTrigger>
          <TabsTrigger value="abtesting" className="gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">A/B Tests</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Queue</span>
          </TabsTrigger>
          <TabsTrigger value="send" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Send Test</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EmailAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <EventManagement />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateManagement />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignManagement />
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <ABTestingDashboard />
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <QueueMonitor />
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <SendEmailTest />
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default EmailAutomation;