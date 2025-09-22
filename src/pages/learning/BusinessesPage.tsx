import React from 'react';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { AudienceSpecificSections } from '@/components/learning/AudienceSpecificSections';
import { updateMetaTags } from '@/utils/metaTags';

const BusinessesPage: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel for Business | Enterprise Training Solutions',
      description: 'Advance your workforce with world-class online training. Scalable, enterprise-grade learning solutions for teams of any size.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      <AudienceSpecificSections audience="businesses" />
    </div>
  );
};

export default BusinessesPage;