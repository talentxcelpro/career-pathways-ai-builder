import React from 'react';
import { CourseraStyleHeader } from '@/components/learning/CourseraStyleHeader';
import { AudienceSpecificSections } from '@/components/learning/AudienceSpecificSections';
import { updateMetaTags } from '@/utils/metaTags';

const GovernmentsPage: React.FC = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel for Governments | Workforce Development at Scale',
      description: 'Transform your workforce with digital skills training at scale. Secure, compliant solutions for government workforce development.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <CourseraStyleHeader />
      <AudienceSpecificSections audience="governments" />
    </div>
  );
};

export default GovernmentsPage;