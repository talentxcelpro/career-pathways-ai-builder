import React from 'react';
import { useParams } from 'react-router-dom';
import { EnhancedResumeBuilder } from '@/components/resume/enhanced/EnhancedResumeBuilder';

const TalentXcelResumeBuilder: React.FC = () => {
  const { id } = useParams();
  const mode = id === 'new' ? 'create' : 'edit';

  return <EnhancedResumeBuilder mode={mode} />;
};

export default TalentXcelResumeBuilder;