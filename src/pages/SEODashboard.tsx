import React from 'react';
import { AutomatedSEODashboard } from '@/components/seo/AutomatedSEODashboard';
import { SEOScalabilityEngine } from '@/components/seo/SEOScalabilityEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SEODashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">SEO Automation Suite</h1>
          <p className="text-xl text-muted-foreground">Generate millions of SEO pages and scale your online presence</p>
        </div>

        <Tabs defaultValue="automation" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automation">SEO Automation</TabsTrigger>
            <TabsTrigger value="scalability">Scalability Engine</TabsTrigger>
          </TabsList>

          <TabsContent value="automation">
            <AutomatedSEODashboard />
          </TabsContent>

          <TabsContent value="scalability">
            <SEOScalabilityEngine />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SEODashboardPage;