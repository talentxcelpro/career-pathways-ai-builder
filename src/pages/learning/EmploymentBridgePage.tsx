import React from 'react';
import { LearningHeader } from '@/components/learning/LearningHeader';
import { LearningEmploymentBridge } from '@/components/learning/LearningEmploymentBridge';
import { updateMetaTags } from '@/utils/metaTags';

const EmploymentBridgePage = () => {
  React.useEffect(() => {
    updateMetaTags({
      title: 'Employment Bridge | TalentXcel Learning',
      description: 'Bridge the gap between learning and employment with job-focused courses, market trends, and career analytics.'
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningHeader />
        <LearningEmploymentBridge />
      </div>
    </div>
  );
};

export default EmploymentBridgePage;