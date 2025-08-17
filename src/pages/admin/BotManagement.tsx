import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { BotManagerDashboard } from '@/components/admin/BotManagerDashboard';
import { BotContentGenerator } from '@/components/admin/BotContentGenerator';
import { BotAnalytics } from '@/components/admin/BotAnalytics';
import { BotAuthFixer } from '@/components/admin/BotAuthFixer';
import { BotTemplateManager } from '@/components/admin/BotTemplateManager';
import { ContentAutomationDashboard } from '@/components/admin/ContentAutomationDashboard';
import { BotWallManagement } from '@/components/admin/BotWallManagement';
import { BotAutomationDashboard } from '@/components/admin/BotAutomationDashboard';
import { AIHealthMonitor } from '@/components/admin/AIHealthMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BotManagement: React.FC = () => {
  return (
    <UnifiedAdminLayout
      title="AI Bot Management"
      description="Manage AI bots, content generation, and analytics"
    >
      <Tabs defaultValue="engine" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="engine">Automation Engine</TabsTrigger>
          <TabsTrigger value="dashboard">Bot Dashboard</TabsTrigger>
          <TabsTrigger value="wall">Wall Management</TabsTrigger>
          <TabsTrigger value="automation">Content Automation</TabsTrigger>
          <TabsTrigger value="generator">Manual Generation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sources">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="engine" className="space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Automation Engine</h3>
            <p className="text-muted-foreground mb-4">AI Bot Content Generation System</p>
            <div className="bg-muted/10 p-4 rounded">
              <p className="text-sm">✅ Database schema created</p>
              <p className="text-sm">✅ Prompt library seeded</p>
              <p className="text-sm">✅ Edge functions deployed</p>
              <p className="text-sm">⚡ Ready for content generation</p>
            </div>
          </div>
          {/* Temporarily comment out dashboard to isolate issue */}
          {/* <BotAutomationDashboard /> */}
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6">
            <BotAuthFixer />
            <BotManagerDashboard />
          </div>
        </TabsContent>

        <TabsContent value="wall" className="space-y-6">
          <BotWallManagement />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ContentAutomationDashboard />
            </div>
            <div className="lg:col-span-1">
              <AIHealthMonitor />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <BotContentGenerator />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BotAnalytics />
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <BotTemplateManager />
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default BotManagement;