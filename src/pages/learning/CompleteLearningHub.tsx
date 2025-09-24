import React from 'react';
import { updateMetaTags } from "@/utils/metaTags";
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { CoreLearningNav } from '@/components/learning/CoreLearningNav';
import { LearningSearchHub } from '@/components/learning/LearningSearchHub';
import { PersonalizedDashboard } from '@/components/learning/PersonalizedDashboard';
import { SmartLearningNav } from '@/components/learning/SmartLearningNav';
import { useAdvancedLearningData } from '@/hooks/useAdvancedLearningData';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from "@/components/ui/separator";

export default function CompleteLearningHub() {
  const [user, setUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Get current user
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
      title: "Complete Learning Hub | TalentXcel - Master Any Skill",
      description: "Access 7,000+ courses, AI-powered learning paths, skill assessments, and career tools. Your complete learning ecosystem for professional growth."
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CoreLearningNav />
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Personalized Dashboard for users */}
        {user ? (
          <section className="mb-16">
            <PersonalizedDashboard />
          </section>
        ) : (
          <section className="mb-16">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to TalentXcel Learning</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sign in to access your personalized learning dashboard, track progress, and get AI-powered recommendations.
              </p>
            </div>
          </section>
        )}

        <Separator className="mb-16" />

        {/* Search and Discovery Hub */}
        <section className="mb-16">
          <LearningSearchHub />
        </section>

        <Separator className="mb-16" />

        {/* Advanced Navigation Options */}
        <section className="mb-16">
          <SmartLearningNav />
        </section>
      </div>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Transform Your Career Today
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join millions of learners who have advanced their careers with our comprehensive learning platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/learning/courses"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold bg-white text-primary rounded-lg hover:bg-white/90 transition-colors"
            >
              Start Learning Now
            </a>
            <a
              href="/learning/skill-assessment"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Take Skill Assessment
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}