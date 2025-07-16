import { AppleInspiredResumeBuilder } from "@/components/resume/AppleInspiredResumeBuilder";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const UploadResume = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <ErrorBoundary>
        <AppleInspiredResumeBuilder />
      </ErrorBoundary>
    </div>
  );
};

export default UploadResume;