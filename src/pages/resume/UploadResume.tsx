
import React, { useState } from 'react';
import { ChatGPTStyleInterface } from "@/components/resume/ChatGPTStyleInterface";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const UploadResume = () => {
  const [resumeData, setResumeData] = useState<any>(null);

  const handleEnhancementApplied = (enhancedData: any) => {
    setResumeData(enhancedData);
    console.log('Enhancement applied:', enhancedData);
  };

  return (
    <ErrorBoundary>
      <ChatGPTStyleInterface 
        resumeData={resumeData}
        onEnhancementApplied={handleEnhancementApplied}
      />
    </ErrorBoundary>
  );
};

export default UploadResume;
