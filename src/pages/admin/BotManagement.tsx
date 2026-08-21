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
import { ContentAutomationTester } from '@/components/admin/ContentAutomationTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { NetworkAutoPostControl } from '@/components/admin/NetworkAutoPostControl';

const BotManagement: React.FC = () => {
  return (
    <UnifiedAdminLayout
      title="AI Bot & Autonomous Network Engine"
      description="Manage autonomous network posting engine, bots, and content analytics"
    >
      <Tabs defaultValue="engine" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="engine">Network Auto-Post</TabsTrigger>
          <TabsTrigger value="dashboard">Bot Dashboard</TabsTrigger>
          <TabsTrigger value="wall">Wall Management</TabsTrigger>
          <TabsTrigger value="automation">Content Automation</TabsTrigger>
          <TabsTrigger value="generator">Manual Generation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sources">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="engine" className="space-y-6">
          <NetworkAutoPostControl />
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentAutomationDashboard />
            <div className="space-y-6">
              <AIHealthMonitor />
              <ContentAutomationTester />
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