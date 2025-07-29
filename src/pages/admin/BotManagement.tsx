import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { BotManagerDashboard } from '@/components/admin/BotManagerDashboard';
import { BotContentGenerator } from '@/components/admin/BotContentGenerator';
import { BotAnalytics } from '@/components/admin/BotAnalytics';
import { BotAuthFixer } from '@/components/admin/BotAuthFixer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BotManagement: React.FC = () => {
  return (
    <UnifiedAdminLayout
      title="AI Bot Management"
      description="Manage AI bots, content generation, and analytics"
    >
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Bot Dashboard</TabsTrigger>
          <TabsTrigger value="generator">Content & Scraping</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sources">Scraping Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6">
            <BotAuthFixer />
            <BotManagerDashboard />
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <BotContentGenerator />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <BotAnalytics />
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Job Scraping Sources</h3>
            <div className="grid gap-4">
              <div className="text-sm text-muted-foreground">
                Manage job scraping sources and bot assignments. Configure where your bots should scrape jobs from.
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default BotManagement;