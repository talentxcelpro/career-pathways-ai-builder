import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealtimeDemo } from '@/components/realtime/RealtimeDemo';
import { ProductionRealtimeDemo } from '@/components/realtime/ProductionRealtimeDemo';
import { Badge } from '@/components/ui/badge';

export default function RealtimeDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">TalentXcel Real-time System</h1>
          <p className="text-lg text-muted-foreground">
            Production-ready real-time updates with automatic state reconciliation
          </p>
        </div>
        
        <Tabs defaultValue="production" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="production" className="flex items-center gap-2">
              Production Demo
              <Badge variant="default" className="text-xs">NEW</Badge>
            </TabsTrigger>
            <TabsTrigger value="events">Events Monitor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="production" className="mt-6">
            <ProductionRealtimeDemo />
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <div className="flex justify-center">
              <RealtimeDemo />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}