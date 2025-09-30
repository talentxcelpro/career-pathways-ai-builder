import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PeopleTab from './PeopleTab';
import RequestsTab from './RequestsTab';
import CVUploadTab from './CVUploadTab';
import CVSearchTab from './CVSearchTab';
import Phase1Dashboard from './Phase1Dashboard';
import Phase2Dashboard from './Phase2Dashboard';
import Phase3Dashboard from './Phase3Dashboard';
import Phase4Dashboard from './Phase4Dashboard';
import { CostOptimizationDashboard } from '@/components/admin/CostOptimizationDashboard';
import { UltraCostOptimizer } from '@/components/admin/UltraCostOptimizer';
import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';
import { PerformanceOptimizer } from '@/components/admin/PerformanceOptimizer';
import { SecurityHardening } from '@/components/admin/SecurityHardening';

interface NetworkLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function NetworkLayout({ currentTab, onTabChange }: NetworkLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-13">
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="cv-upload">CV Upload</TabsTrigger>
          <TabsTrigger value="cv-search">CV Search</TabsTrigger>
          <TabsTrigger value="phase1">Phase 1</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3</TabsTrigger>
          <TabsTrigger value="phase4">Phase 4</TabsTrigger>
          <TabsTrigger value="optimize">💰 Optimize</TabsTrigger>
          <TabsTrigger value="ultra">🚨 Ultra</TabsTrigger>
          <TabsTrigger value="health">🏥 Health</TabsTrigger>
          <TabsTrigger value="performance">⚡ Performance</TabsTrigger>
          <TabsTrigger value="security">🔒 Security</TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          <PeopleTab />
        </TabsContent>

        <TabsContent value="requests">
          <RequestsTab />
        </TabsContent>

        <TabsContent value="cv-upload">
          <CVUploadTab />
        </TabsContent>

        <TabsContent value="cv-search">
          <CVSearchTab />
        </TabsContent>

        <TabsContent value="phase1">
          <Phase1Dashboard />
        </TabsContent>

        <TabsContent value="phase2">
          <Phase2Dashboard />
        </TabsContent>

        <TabsContent value="phase3">
          <Phase3Dashboard />
        </TabsContent>

        <TabsContent value="phase4">
          <Phase4Dashboard />
        </TabsContent>

        <TabsContent value="optimize">
          <CostOptimizationDashboard />
        </TabsContent>

        <TabsContent value="ultra">
          <UltraCostOptimizer />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealthDashboard />
        </TabsContent>
        <TabsContent value="performance">
          <PerformanceOptimizer />
        </TabsContent>
        <TabsContent value="security">
          <SecurityHardening />
        </TabsContent>
      </Tabs>
    </div>
  );
}