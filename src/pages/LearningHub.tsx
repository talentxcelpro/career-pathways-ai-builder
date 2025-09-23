import React from 'react';
import { Link } from "react-router-dom";
import { updateMetaTags } from "@/utils/metaTags";
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { CourseraHeroSection } from '@/components/learning/CourseraHeroSection';
import { SmartLearningNav } from '@/components/learning/SmartLearningNav';
import { LearningSearchHub } from '@/components/learning/LearningSearchHub';
import { PersonalizedDashboard } from '@/components/learning/PersonalizedDashboard';
import { AdvancedLearningDashboard } from '@/components/learning/AdvancedLearningDashboard';
import { CourseraStyleLearningEngine } from '@/components/learning/CourseraStyleLearningEngine';
import { useAdvancedLearningData } from '@/hooks/useAdvancedLearningData';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Target,
  Award,
  GraduationCap,
  Play
} from 'lucide-react';

export default function LearningHub() {
  const [user, setUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const { seoData, breadcrumbs } = useAdvancedLearningData({ 
    pageType: 'hub',
    userContext: { isAuthenticated: !!user, completedCourses: 0 }
  });

  React.useEffect(() => {
    updateMetaTags({
      title: seoData.title,
      description: seoData.description
    });
  }, [seoData]);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      <CourseraHeroSection />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Advanced Learning Dashboard for authenticated users */}
        {user && (
          <section className="mb-16">
            <AdvancedLearningDashboard userId={user.id} />
          </section>
        )}

        {/* Personalized Dashboard Section */}
        <section className="mb-16">{!user && <PersonalizedDashboard />}</section>

        <Separator className="mb-16" />

        {/* Search and Discovery Hub */}
        <section className="mb-16">
          <LearningSearchHub />
        </section>

        <Separator className="mb-16" />

        {/* Smart Navigation */}
        <section className="mb-16">
          <SmartLearningNav />
        </section>

        {/* Coursera-Style Learning Engine */}
        <section>
          <CourseraStyleLearningEngine view="hub" />
        </section>
      </div>

      {/* Learn with Confidence */}
      <section className="bg-muted/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Learn with confidence</h2>
            <p className="text-xl text-muted-foreground">Interactive courses from top universities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Interactive Learning</h3>
              <p className="text-muted-foreground">Hands-on projects and quizzes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Expert Instructors</h3>
              <p className="text-muted-foreground">Learn from industry professionals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Recognized Certificates</h3>
              <p className="text-muted-foreground">Credentials from top institutions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Start Your Learning Journey
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Explore thousands of courses and build the skills that matter most to your career
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
              <Link to="/learning/courses">
                <BookOpen className="h-5 w-5 mr-2" />
                Explore Courses
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/learning/skill-assessment">
                <Target className="h-5 w-5 mr-2" />
                Take Skill Assessment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}