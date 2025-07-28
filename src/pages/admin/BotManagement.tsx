import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { BotManagerDashboard } from '@/components/admin/BotManagerDashboard';
import { BotContentGenerator } from '@/components/admin/BotContentGenerator';
import { BotAnalytics } from '@/components/admin/BotAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BotManagement: React.FC = () => {
  return (
    <UnifiedAdminLayout
      title="AI Bot Management"
      description="Manage AI bots, content generation, and analytics"
    >
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Bot Dashboard</TabsTrigger>
          <TabsTrigger value="generator">Content Generator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <BotManagerDashboard />
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <BotContentGenerator />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BotAnalytics />
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default BotManagement;