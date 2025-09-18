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
import { EmailSecurityValidator } from '@/components/admin/EmailSecurityValidator';
import { EmailAutomationFixer } from '@/components/admin/EmailAutomationFixer';
import { AIEmailAutomationDashboard } from '@/components/admin/AIEmailAutomationDashboard';
import { AdvancedABTestingEngine } from '@/components/admin/AdvancedABTestingEngine';
import { SmartUserSegmentation } from '@/components/admin/SmartUserSegmentation';
import { EmailDeliveryEngine } from '@/components/admin/EmailDeliveryEngine';
import { AutomationTriggerEngine } from '@/components/admin/AutomationTriggerEngine';
import { RealTimeEmailAnalytics } from '@/components/admin/RealTimeEmailAnalytics';
import { AIEmailOptimizer } from '@/components/admin/AIEmailOptimizer';
import { AdvancedIntegrations } from '@/components/admin/AdvancedIntegrations';
import { EnterpriseSecurityCenter } from '@/components/admin/EnterpriseSecurityCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Settings, Monitor, TestTube, Clock, BarChart, Users, TrendingUp, Shield, Wrench, Target, Zap, Activity, Send, Brain, Link2 } from "lucide-react";

const EmailAutomationPage = () => {
  return (
    <UnifiedAdminLayout 
      title="Email Automation"
      description="Configure automated email templates, settings, and monitoring"
    >
      <Tabs defaultValue="automation" className="w-full">
        <TabsList className="grid w-full grid-cols-15">
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="fixer" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Fixer
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
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="ab-testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="segmentation" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Segmentation
          </TabsTrigger>
          <TabsTrigger value="delivery-engine" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Delivery Engine
          </TabsTrigger>
          <TabsTrigger value="automation-triggers" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Triggers
          </TabsTrigger>
          <TabsTrigger value="real-time-analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Analytics
          </TabsTrigger>
          <TabsTrigger value="ai-optimizer" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Optimizer
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="enterprise-security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Enterprise Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-dashboard" className="space-y-6">
          <AIEmailAutomationDashboard />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <EmailAutomationDashboard />
        </TabsContent>

        <TabsContent value="fixer" className="space-y-6">
          <EmailAutomationFixer />
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

        <TabsContent value="security" className="space-y-6">
          <EmailSecurityValidator />
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-6">
          <AdvancedABTestingEngine />
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-6">
          <SmartUserSegmentation />
        </TabsContent>

        <TabsContent value="delivery-engine" className="space-y-6">
          <EmailDeliveryEngine />
        </TabsContent>

        <TabsContent value="automation-triggers" className="space-y-6">
          <AutomationTriggerEngine />
        </TabsContent>

        <TabsContent value="real-time-analytics" className="space-y-6">
          <RealTimeEmailAnalytics />
        </TabsContent>

        <TabsContent value="ai-optimizer" className="space-y-6">
          <AIEmailOptimizer />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <AdvancedIntegrations />
        </TabsContent>

        <TabsContent value="enterprise-security" className="space-y-6">
          <EnterpriseSecurityCenter />
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default EmailAutomationPage;