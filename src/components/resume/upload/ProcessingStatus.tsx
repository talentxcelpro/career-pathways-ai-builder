import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, FileText, Brain, Zap, Target, Sparkles } from "lucide-react";

interface ProcessingStatusProps {
  isProcessing: boolean;
  uploadSuccess: boolean;
  processingStep: number;
  processingSteps: string[];
  uploadedFile: File | null;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  uploadSuccess,
  processingStep,
  processingSteps,
  uploadedFile
}) => {
  if (!isProcessing && !uploadSuccess) {
    return null;
  }

  const getStepIcon = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return <FileText className="h-4 w-4" />;
      case 1:
        return <Brain className="h-4 w-4" />;
      case 2:
        return <Zap className="h-4 w-4" />;
      case 3:
        return <Target className="h-4 w-4" />;
      case 4:
        return <Sparkles className="h-4 w-4" />;
      case 5:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Loader2 className="h-4 w-4" />;
    }
  };

  const progress = ((processingStep + 1) / processingSteps.length) * 100;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {uploadSuccess ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Resume Processed Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Your resume has been analyzed and all content has been extracted.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Content Extracted:</span>
                </div>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>✓ Personal Information</li>
                  <li>✓ Work Experience</li>
                  <li>✓ Education & Qualifications</li>
                  <li>✓ Skills & Technologies</li>
                  <li>✓ Projects & Certifications</li>
                  <li>✓ ATS Optimization Score</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to resume editor...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing Your Resume
              </h3>
              <p className="text-gray-600">
                Our AI is extracting all sections from your resume
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              {processingSteps.map((step, index) => {
                const isActive = index === processingStep;
                const isCompleted = index < processingStep;
                const isUpcoming = index > processingStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      isActive
                        ? 'bg-blue-50 border-blue-200'
                        : isCompleted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : isCompleted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        getStepIcon(index)
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          isActive
                            ? 'text-blue-900'
                            : isCompleted
                              ? 'text-green-900'
                              : 'text-gray-500'
                        }`}
                      >
                        {step}
                      </div>
                      {isActive && (
                        <div className="text-sm text-blue-600 mt-1">
                          {index === 1 && 'Analyzing document structure...'}
                          {index === 2 && 'Extracting work experience and education...'}
                          {index === 3 && 'Identifying skills and technologies...'}
                          {index === 4 && 'Calculating ATS compatibility score...'}
                          {index === 5 && 'Preparing optimized resume...'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* File Info */}
            {uploadedFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {uploadedFile.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • {uploadedFile.type}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};