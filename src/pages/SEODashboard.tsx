import React from 'react';
import { AutomatedSEODashboard } from '@/components/seo/AutomatedSEODashboard';
import { SEOScalabilityEngine } from '@/components/seo/SEOScalabilityEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SEODashboard = () => {
  console.log('SEODashboard rendering...'); // Debug log

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">SEO Automation Suite</h1>
          <p className="text-xl text-muted-foreground">Generate millions of SEO pages and scale your online presence</p>
        </div>

        <div className="bg-card p-6 rounded-lg border mb-6">
          <h2 className="text-2xl font-semibold mb-4">Dashboard Status</h2>
          <p className="text-muted-foreground">Dashboard is loading successfully!</p>
        </div>

        <Tabs defaultValue="automation" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="automation">SEO Automation</TabsTrigger>
            <TabsTrigger value="scalability">Scalability Engine</TabsTrigger>
          </TabsList>

          <TabsContent value="automation" className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">SEO Automation Dashboard</h3>
              <p className="text-muted-foreground mb-4">Loading automation tools...</p>
              <AutomatedSEODashboard />
            </div>
          </TabsContent>

          <TabsContent value="scalability" className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Scalability Engine</h3>
              <p className="text-muted-foreground mb-4">Loading scalability metrics...</p>
              <SEOScalabilityEngine />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SEODashboard;