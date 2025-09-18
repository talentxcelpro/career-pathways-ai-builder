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
        <div className="space-y-4">
          {/* Primary Navigation */}
          <div className="border-b">
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Delivery
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Secondary Navigation for each main section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <TabsList className="flex-col h-auto w-full space-y-2 bg-transparent p-0">
                <div className="space-y-4 w-full">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Access</h3>
                    <div className="space-y-1">
                      <TabsTrigger value="automation" className="w-full justify-start text-left">
                        <BarChart className="h-4 w-4 mr-2" />
                        Automation Dashboard
                      </TabsTrigger>
                      <TabsTrigger value="delivery-engine" className="w-full justify-start text-left">
                        <Send className="h-4 w-4 mr-2" />
                        Delivery Engine
                      </TabsTrigger>
                      <TabsTrigger value="real-time-analytics" className="w-full justify-start text-left">
                        <Activity className="h-4 w-4 mr-2" />
                        Live Analytics
                      </TabsTrigger>
                      <TabsTrigger value="ai-optimizer" className="w-full justify-start text-left">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Optimizer
                      </TabsTrigger>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Templates</h3>
                    <div className="space-y-1">
                      <TabsTrigger value="templates" className="w-full justify-start text-left">
                        <Mail className="h-4 w-4 mr-2" />
                        Simple Templates
                      </TabsTrigger>
                      <TabsTrigger value="html-templates" className="w-full justify-start text-left">
                        <Mail className="h-4 w-4 mr-2" />
                        HTML Templates
                      </TabsTrigger>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Automation</h3>
                    <div className="space-y-1">
                      <TabsTrigger value="automation-triggers" className="w-full justify-start text-left">
                        <Zap className="h-4 w-4 mr-2" />
                        Triggers
                      </TabsTrigger>
                      <TabsTrigger value="segmentation" className="w-full justify-start text-left">
                        <Target className="h-4 w-4 mr-2" />
                        User Segmentation
                      </TabsTrigger>
                      <TabsTrigger value="ab-testing" className="w-full justify-start text-left">
                        <TestTube className="h-4 w-4 mr-2" />
                        A/B Testing
                      </TabsTrigger>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Campaigns</h3>
                    <div className="space-y-1">
                      <TabsTrigger value="bulk-campaign" className="w-full justify-start text-left">
                        <Users className="h-4 w-4 mr-2" />
                        Bulk Campaigns
                      </TabsTrigger>
                      <TabsTrigger value="growth-system" className="w-full justify-start text-left">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Growth System
                      </TabsTrigger>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">System</h3>
                    <div className="space-y-1">
                      <TabsTrigger value="monitoring" className="w-full justify-start text-left">
                        <Monitor className="h-4 w-4 mr-2" />
                        Monitoring
                      </TabsTrigger>
                      <TabsTrigger value="testing" className="w-full justify-start text-left">
                        <TestTube className="h-4 w-4 mr-2" />
                        Testing Tools
                      </TabsTrigger>
                      <TabsTrigger value="configuration" className="w-full justify-start text-left">
                        <Settings className="h-4 w-4 mr-2" />
                        Configuration
                      </TabsTrigger>
                      <TabsTrigger value="integrations" className="w-full justify-start text-left">
                        <Link2 className="h-4 w-4 mr-2" />
                        Integrations
                      </TabsTrigger>
                      <TabsTrigger value="security" className="w-full justify-start text-left">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                      </TabsTrigger>
                      <TabsTrigger value="enterprise-security" className="w-full justify-start text-left">
                        <Shield className="h-4 w-4 mr-2" />
                        Enterprise Security
                      </TabsTrigger>
                      <TabsTrigger value="fixer" className="w-full justify-start text-left">
                        <Wrench className="h-4 w-4 mr-2" />
                        System Fixer
                      </TabsTrigger>
                    </div>
                  </div>
                </div>
              </TabsList>
            </div>

            <div className="lg:col-span-3">
              <div className="border rounded-lg p-6 min-h-[600px]">
                <TabsContent value="automation" className="space-y-6 mt-0">
                  <EmailAutomationDashboard />
                </TabsContent>

                <TabsContent value="fixer" className="space-y-6 mt-0">
                  <EmailAutomationFixer />
                </TabsContent>

                <TabsContent value="templates" className="space-y-6 mt-0">
                  <EmailAutomationManager />
                </TabsContent>

                <TabsContent value="html-templates" className="space-y-6 mt-0">
                  <EmailTemplateManager />
                </TabsContent>

                <TabsContent value="configuration" className="space-y-6 mt-0">
                  <EmailConfigurationPanel />
                </TabsContent>

                <TabsContent value="monitoring" className="space-y-6 mt-0">
                  <EmailQueueMonitor />
                </TabsContent>

                <TabsContent value="testing" className="space-y-6 mt-0">
                  <EmailSystemTester />
                  <EmailTemplateTest />
                  <EmailAutomationQueueTester />
                </TabsContent>

                <TabsContent value="bulk-campaign" className="space-y-6 mt-0">
                  <BulkEmailCampaign />
                </TabsContent>

                <TabsContent value="growth-system" className="space-y-6 mt-0">
                  <CommunicationDashboard />
                  <GrowthCommunicationSystem />
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-0">
                  <EmailSecurityValidator />
                </TabsContent>

                <TabsContent value="ab-testing" className="space-y-6 mt-0">
                  <AdvancedABTestingEngine />
                </TabsContent>

                <TabsContent value="segmentation" className="space-y-6 mt-0">
                  <SmartUserSegmentation />
                </TabsContent>

                <TabsContent value="delivery-engine" className="space-y-6 mt-0">
                  <EmailDeliveryEngine />
                </TabsContent>

                <TabsContent value="automation-triggers" className="space-y-6 mt-0">
                  <AutomationTriggerEngine />
                </TabsContent>

                <TabsContent value="real-time-analytics" className="space-y-6 mt-0">
                  <RealTimeEmailAnalytics />
                </TabsContent>

                <TabsContent value="ai-optimizer" className="space-y-6 mt-0">
                  <AIEmailOptimizer />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-6 mt-0">
                  <AdvancedIntegrations />
                </TabsContent>

                <TabsContent value="enterprise-security" className="space-y-6 mt-0">
                  <EnterpriseSecurityCenter />
                </TabsContent>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default EmailAutomationPage;