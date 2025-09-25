import React from 'react';
import { CategorizedCourseDisplay } from '@/components/learning/CategorizedCourseDisplay';
import { LearningPageLayout } from '@/components/learning/LearningPageLayout';
import { updateMetaTags } from '@/utils/metaTags';

const AllCourses = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'All Courses | TalentXcel Learning - 36+ Professional Courses',
      description: 'Browse our comprehensive catalog of 36+ courses across Technology, Business, Design, and Personal Development. Learn from industry experts with hands-on projects.'
    });
  }, []);

  return (
    <LearningPageLayout 
      heroTitle="Master New Skills with Expert-Led Courses"
      heroDescription="Discover courses across Technology, Business, Design, and Personal Development. Each course is designed with hands-on projects and real-world applications."
    >
      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="bg-gradient-card backdrop-blur-apple rounded-lg px-6 py-4 shadow-card border border-glass-border">
            <div className="text-2xl font-bold text-primary">300+</div>
            <div className="text-sm text-muted-foreground">Hours of Content</div>
          </div>
          <div className="bg-gradient-card backdrop-blur-apple rounded-lg px-6 py-4 shadow-card border border-glass-border">
            <div className="text-2xl font-bold text-green-600">50K+</div>
            <div className="text-sm text-muted-foreground">Active Learners</div>
          </div>
          <div className="bg-gradient-card backdrop-blur-apple rounded-lg px-6 py-4 shadow-card border border-glass-border">
            <div className="text-2xl font-bold text-orange-600">94%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="bg-gradient-card backdrop-blur-apple rounded-lg px-6 py-4 shadow-card border border-glass-border">
            <div className="text-2xl font-bold text-purple-600">180+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
        </div>
      </section>

      {/* Course Display */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategorizedCourseDisplay />
      </section>
    </LearningPageLayout>
  );
};

export default AllCourses;