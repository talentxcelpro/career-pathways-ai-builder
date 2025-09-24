import React, { useState } from 'react';
import { RealCourseGrid } from '@/components/learning/RealCourseGrid';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { updateMetaTags } from '@/utils/metaTags';

const AllCourses = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'All Courses | TalentXcel Learning',
      description: 'Browse our comprehensive catalog of courses across various categories and skill levels.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">All Courses</h1>
          <p className="text-xl text-muted-foreground">Discover and enroll in courses to enhance your skills</p>
        </div>
      </section>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <RealCourseGrid showFilters={true} />
      </div>
    </div>
  );
};

export default AllCourses;