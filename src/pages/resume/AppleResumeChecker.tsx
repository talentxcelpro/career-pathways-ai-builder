
import React from 'react';
import { EnhancedResumeChecker } from '@/components/resume/checker/EnhancedResumeChecker';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const AppleResumeChecker = () => {
  return (
    <ErrorBoundary>
      <EnhancedResumeChecker />
    </ErrorBoundary>
  );
};

export default AppleResumeChecker;
