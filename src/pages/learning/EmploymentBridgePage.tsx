import React from 'react';
import { LearningLayout } from '@/components/learning/LearningLayout';
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
    <LearningLayout>
      <LearningEmploymentBridge />
    </LearningLayout>
  );
};

export default EmploymentBridgePage;