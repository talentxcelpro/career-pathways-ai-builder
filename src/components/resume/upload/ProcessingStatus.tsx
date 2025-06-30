
import { CheckCircle, Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  isProcessing: boolean;
  uploadSuccess: boolean;
  processingStep: number;
  processingSteps: string[];
  uploadedFile: File | null;
}

export const ProcessingStatus = ({
  isProcessing,
  uploadSuccess,
  processingStep,
  processingSteps,
  uploadedFile
}: ProcessingStatusProps) => {
  if (uploadSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Upload Successful!</h3>
          <p className="text-gray-600 mb-4">Your resume has been processed and optimized.</p>
          <p className="text-sm text-gray-500">Redirecting to editor...</p>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-16 w-16 mx-auto text-blue-600 animate-spin mb-4" />
        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {processingSteps[processingStep] || 'Processing...'}
          </h3>
          <p className="text-gray-600 mb-4">AI is analyzing and optimizing your resume content</p>
          {uploadedFile && (
            <p className="text-sm text-gray-500 mb-4">Processing: {uploadedFile.name}</p>
          )}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Step {processingStep + 1} of {processingSteps.length}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
