
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, FileText, CheckCircle } from "lucide-react";
import { EnhancedFileUpload } from "@/components/resume/EnhancedFileUpload";

interface FileUploadStepProps {
  onNext: () => void;
  onBack: () => void;
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  canGoBack: boolean;
  canGoNext: boolean;
}

export const FileUploadStep: React.FC<FileUploadStepProps> = ({
  onNext,
  onBack,
  onFileUpload,
  uploadedFile,
  canGoBack,
  canGoNext
}) => {
  const handleFileSelect = (files: FileList) => {
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Resume
        </h2>
        <p className="text-gray-600">
          Select your current resume file to begin the AI enhancement process
        </p>
      </div>

      {uploadedFile ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <div className="font-medium text-green-900">{uploadedFile.name}</div>
              <div className="text-sm text-green-600">
                {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Ready for processing
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              onClick={() => onFileUpload(uploadedFile)}
              variant="outline"
              className="mr-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              Choose Different File
            </Button>
          </div>
        </div>
      ) : (
        <EnhancedFileUpload
          onFileSelect={handleFileSelect}
          isProcessing={false}
          processingProgress={0}
          processingStatus=""
        />
      )}

      <div className="flex justify-between">
        <Button
          onClick={onBack}
          disabled={!canGoBack}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canGoNext}
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
