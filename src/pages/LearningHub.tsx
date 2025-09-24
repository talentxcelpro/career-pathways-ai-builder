import React from 'react';
import { updateMetaTags } from "@/utils/metaTags";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LearningAppSidebar } from '@/components/learning/LearningAppSidebar';
import { MobileLearningDashboard } from '@/components/learning/MobileLearningDashboard';
import { RealCourseGrid } from '@/components/learning/RealCourseGrid';
import { useAdvancedLearningData } from '@/hooks/useAdvancedLearningData';
import { supabase } from '@/integrations/supabase/client';

export default function LearningHub() {
  const [user, setUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const { seoData } = useAdvancedLearningData({ 
    pageType: 'hub',
    userContext: { isAuthenticated: !!user, completedCourses: 0 }
  });

  React.useEffect(() => {
    updateMetaTags({
      title: "TalentXcel Learning Hub | Professional Skills Development",
      description: "Master industry-relevant skills with interactive courses, learning paths, and real-world projects. Track your progress and advance your career."
    });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <LearningAppSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile Header with Trigger */}
          <div className="md:hidden bg-background border-b p-4 flex items-center justify-between sticky top-0 z-10">
            <SidebarTrigger />
            <h1 className="font-bold text-lg">TalentXcel Learning</h1>
            <div></div>
          </div>

          {/* Mobile Sidebar Overlay */}
          <div className="md:hidden">
            <LearningAppSidebar />
          </div>

          {/* Content Area */}
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Hero Section - Compact for Mobile */}
            <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg p-6 md:p-8 mb-6 text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">
                Learn. Grow. Succeed.
              </h1>
              <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Master new skills with our interactive learning platform
              </p>
            </section>

            {/* Mobile Dashboard */}
            <div className="mb-6">
              <MobileLearningDashboard userId={user?.id} />
            </div>

            {/* Featured Courses - Responsive Grid */}
            <section className="mb-6">
              <RealCourseGrid 
                title="Featured Courses" 
                limit={6}
                showFilters={false}
                className="space-y-4"
              />
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}