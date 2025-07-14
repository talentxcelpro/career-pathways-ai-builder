import { UnifiedResumeBuilder } from "@/components/resume/UnifiedResumeBuilder";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const UploadResume = () => {
  return (
    <ErrorBoundary>
      <UnifiedResumeBuilder />
    </ErrorBoundary>
  );
};

export default UploadResume;