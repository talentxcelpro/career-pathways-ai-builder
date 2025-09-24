import React from 'react';
import { updateMetaTags } from "@/utils/metaTags";
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { RealDataLearningDashboard } from '@/components/learning/RealDataLearningDashboard';
import { RealLearningSearchHub } from '@/components/learning/RealLearningSearchHub';
import { RealCourseGrid } from '@/components/learning/RealCourseGrid';
import { SmartLearningNav } from '@/components/learning/SmartLearningNav';
import { CoreLearningNav } from '@/components/learning/CoreLearningNav';
import { useAdvancedLearningData } from '@/hooks/useAdvancedLearningData';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from "@/components/ui/separator";

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
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />

      {/* Hero Section - Simplified */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Learn. Grow. Succeed.
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master new skills with our interactive learning platform designed for working professionals
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* User Dashboard */}
        <section className="mb-16">
          <RealDataLearningDashboard userId={user?.id} />
        </section>

        <Separator className="mb-16" />

        {/* Search and Discovery */}
        <section className="mb-16">
          <RealLearningSearchHub />
        </section>

        <Separator className="mb-16" />

        {/* Featured Courses */}
        <section className="mb-16">
          <RealCourseGrid 
            title="Featured Courses" 
            limit={6}
            showFilters={false}
          />
        </section>

        <Separator className="mb-16" />

        {/* Core Learning Navigation */}
        <section className="mb-16">
          <CoreLearningNav />
        </section>

        <Separator className="mb-16" />

        {/* Navigation Options */}
        <section>
          <SmartLearningNav />
        </section>
      </div>
    </div>
  );
}