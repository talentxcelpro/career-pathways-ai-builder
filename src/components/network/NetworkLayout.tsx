import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PeopleTab from './PeopleTab';
import RequestsTab from './RequestsTab';
import CVUploadTab from './CVUploadTab';
import CVSearchTab from './CVSearchTab';
import Phase1Dashboard from './Phase1Dashboard';
import Phase3Dashboard from './Phase3Dashboard';

interface NetworkLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function NetworkLayout({ currentTab, onTabChange }: NetworkLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="cv-upload">CV Upload</TabsTrigger>
          <TabsTrigger value="cv-search">CV Search</TabsTrigger>
          <TabsTrigger value="phase1">Phase 1</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3</TabsTrigger>
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

        <TabsContent value="phase3">
          <Phase3Dashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}