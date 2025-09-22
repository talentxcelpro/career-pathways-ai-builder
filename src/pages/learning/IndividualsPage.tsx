import React from 'react';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { AudienceSpecificSections } from '@/components/learning/AudienceSpecificSections';
import { CourseGrid } from '@/components/learning/CourseGrid';
import { updateMetaTags } from '@/utils/metaTags';

const IndividualsPage: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel for Individuals | Build Job-Relevant Skills',
      description: 'Transform your career with world-class online courses, certificates, and hands-on projects from leading universities and companies.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      <AudienceSpecificSections audience="individuals" />
      
      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Popular Courses for Individuals
          </h2>
          <p className="text-lg text-muted-foreground">
            Start learning with these top-rated courses
          </p>
        </div>
        <CourseGrid limit={6} />
      </section>
    </div>
  );
};

export default IndividualsPage;