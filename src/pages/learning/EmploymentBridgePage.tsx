import React from 'react';
import { LearningPageLayout } from '@/components/learning/LearningPageLayout';
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
    <LearningPageLayout 
      heroTitle="Employment Bridge" 
      heroDescription="Bridge the gap between learning and employment with job-focused courses, market trends, and career analytics"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LearningEmploymentBridge />
      </div>
    </LearningPageLayout>
  );
};

export default EmploymentBridgePage;