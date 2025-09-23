import React from 'react';
import { VideoLibraryManager } from '@/components/admin/VideoLibraryManager';
import { CourseGraphenerator } from '@/components/admin/CourseBatchCreator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateMetaTags } from "@/utils/metaTags";

export default function AdminVideoManager() {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Video Management System - Fix Course Duplication',
      description: 'Admin panel to manage video library and create quality course batches'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Video Management System</h1>
          <p className="text-muted-foreground mt-2">
            Fix the 98.8% video duplication issue and create quality course batches
          </p>
        </div>

        <Tabs defaultValue="video-library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video-library">Video Library</TabsTrigger>
            <TabsTrigger value="batch-creator">Course Batches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="video-library" className="space-y-6">
            <VideoLibraryManager />
          </TabsContent>
          
          <TabsContent value="batch-creator" className="space-y-6">
            <CourseGraphenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}