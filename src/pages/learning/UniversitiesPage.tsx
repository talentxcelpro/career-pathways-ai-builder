import React from 'react';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { AudienceSpecificSections } from '@/components/learning/AudienceSpecificSections';
import { updateMetaTags } from '@/utils/metaTags';

const UniversitiesPage: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel for Universities | Academic Partnership Platform',
      description: 'Enhance your curriculum with industry-relevant online content. Partner with leading institutions to offer accredited programs.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      <AudienceSpecificSections audience="universities" />
    </div>
  );
};

export default UniversitiesPage;