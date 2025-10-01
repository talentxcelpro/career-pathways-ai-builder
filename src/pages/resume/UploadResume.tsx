
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadWizard } from "@/components/resume/upload/UploadWizard";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const UploadResume = () => {
  const navigate = useNavigate();

  const handleUploadComplete = (resumeData: any) => {
    console.log('Upload completed with data:', resumeData);
    // Navigate to resume builder with the processed data
    navigate('/resume/build', { 
      state: { resumeData } 
    });
  };

  return (
    <ErrorBoundary>
      <UploadWizard onComplete={handleUploadComplete} />
    </ErrorBoundary>
  );
};

export default UploadResume;
