import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UploadWizard } from '@/components/resume/upload/UploadWizard';
import { ThreePaneResumeBuilder } from '@/components/resume/enhanced/ThreePaneResumeBuilder';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const TalentXcelResumeBuilder: React.FC = () => {
  const { id } = useParams();
  const [resumeData, setResumeData] = useState<any>(null);
  
  const handleUploadComplete = (data: any) => {
    console.log('Upload completed with data:', data);
    setResumeData(data);
  };

  // If no resume data, show upload wizard
  if (!resumeData) {
    return (
      <ErrorBoundary>
        <UploadWizard onComplete={handleUploadComplete} />
      </ErrorBoundary>
    );
  }

  // After upload, show the three-pane builder with proper props
  return (
    <ThreePaneResumeBuilder 
      data={resumeData} 
      onChange={setResumeData}
    />
  );
};

export default TalentXcelResumeBuilder;