import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PeopleTab from './PeopleTab';
import RequestsTab from './RequestsTab';
import CVUploadTab from './CVUploadTab';
import CVSearchTab from './CVSearchTab';
import Phase2CommandCenter from './Phase2CommandCenter';
import Phase3CommandCenter from './Phase3CommandCenter';
import Phase4CommandCenter from './Phase4CommandCenter';
import { CostOptimizationCommandCenter } from '@/components/admin/CostOptimizationCommandCenter';
import { UltraCostOptimizer } from '@/components/admin/UltraCostOptimizer';
import SystemHealthCommandCenter from '@/components/admin/SystemHealthCommandCenter';
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
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="cv-upload">CV Upload</TabsTrigger>
          <TabsTrigger value="cv-search">CV Search</TabsTrigger>
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

        <TabsContent value="phase2">
          <Phase2CommandCenter />
        </TabsContent>

        <TabsContent value="phase3">
          <Phase3CommandCenter />
        </TabsContent>

        <TabsContent value="phase4">
          <Phase4CommandCenter />
        </TabsContent>

        <TabsContent value="optimize">
          <CostOptimizationCommandCenter />
        </TabsContent>

        <TabsContent value="ultra">
          <UltraCostOptimizer />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealthCommandCenter />
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

