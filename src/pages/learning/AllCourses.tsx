import React from 'react';
import { CategorizedCourseDisplay } from '@/components/learning/CategorizedCourseDisplay';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { updateMetaTags } from '@/utils/metaTags';

const AllCourses = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'All Courses | TalentXcel Learning - 36+ Professional Courses',
      description: 'Browse our comprehensive catalog of 36+ courses across Technology, Business, Design, and Personal Development. Learn from industry experts with hands-on projects.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              36+ Courses Available
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Master New Skills with Expert-Led Courses
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover courses across Technology, Business, Design, and Personal Development. 
              Each course is designed with hands-on projects and real-world applications.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-background rounded-lg px-4 py-2 shadow-sm">
                <div className="text-2xl font-bold text-primary">300+</div>
                <div className="text-sm text-muted-foreground">Hours of Content</div>
              </div>
              <div className="bg-background rounded-lg px-4 py-2 shadow-sm">
                <div className="text-2xl font-bold text-green-600">50K+</div>
                <div className="text-sm text-muted-foreground">Active Learners</div>
              </div>
              <div className="bg-background rounded-lg px-4 py-2 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="bg-background rounded-lg px-4 py-2 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">180+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategorizedCourseDisplay />
      </div>
    </div>
  );
};

export default AllCourses;