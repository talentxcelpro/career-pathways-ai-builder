import { ChatGPTStyleInterface } from "@/components/resume/ChatGPTStyleInterface";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const UploadResume = () => {
  return (
    <ErrorBoundary>
      <ChatGPTStyleInterface />
    </ErrorBoundary>
  );
};

export default UploadResume;