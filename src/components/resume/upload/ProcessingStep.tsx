
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, FileText, Brain, Zap, Target, Sparkles, Wand2 } from "lucide-react";
import { useResumeUpload } from "@/hooks/useResumeUpload";

interface ProcessingStepProps {
  onProcessingComplete: (data: any) => void;
  uploadedFile: File | null;
  selectedTemplate: string;
}

const processingSteps = [
  { id: 'upload', label: 'Analyzing uploaded file...', icon: FileText },
  { id: 'extraction', label: 'AI-powered content extraction...', icon: Brain },
  { id: 'parsing', label: 'Advanced text parsing with NLP...', icon: Zap },
  { id: 'optimization', label: 'ATS optimization & scoring...', icon: Target },
  { id: 'enhancement', label: 'Generating AI enhancements...', icon: Sparkles },
  { id: 'finalize', label: 'Finalizing your enhanced resume...', icon: Wand2 }
];

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  onProcessingComplete,
  uploadedFile,
  selectedTemplate
}) => {
  const { uploadResume, progress, isUploading } = useResumeUpload();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (uploadedFile && !hasStarted) {
      setHasStarted(true);
      handleUpload();
    }
  }, [uploadedFile, hasStarted]);

  const handleUpload = async () => {
    if (!uploadedFile) return;

    console.log('ProcessingStep: Starting upload process...');
    
    try {
      const result = await uploadResume(uploadedFile);
      
      if (result.success) {
        console.log('ProcessingStep: Upload successful, calling onProcessingComplete');
        onProcessingComplete({
          ...result.parsedData,
          atsScore: result.atsScore,
          template: selectedTemplate,
          resumeId: result.resumeId
        });
      } else {
        console.error('ProcessingStep: Upload failed:', result.error);
        onProcessingComplete({
          error: result.error || 'Upload failed',
          template: selectedTemplate
        });
      }
    } catch (error) {
      console.error('ProcessingStep: Error during upload:', error);
      onProcessingComplete({
        error: error instanceof Error ? error.message : 'Processing failed',
        template: selectedTemplate
      });
    }
  };

  // Calculate current step based on progress
  const currentStepIndex = Math.floor((progress.percentage / 100) * processingSteps.length);
  const completedSteps = Array.from({ length: currentStepIndex }, (_, i) => i);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Processing Your Resume
        </h2>
        <p className="text-gray-600">
          Our AI is analyzing and enhancing your resume for maximum impact
        </p>
      </div>

      {/* File Info */}
      {uploadedFile && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <div className="font-medium text-gray-900">
                  {uploadedFile.name}
                </div>
                <div className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Processing with {selectedTemplate} template
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Overall Progress</span>
          <span>{Math.round(progress.percentage)}%</span>
        </div>
        <Progress value={progress.percentage} className="h-3" />
        <p className="text-center text-sm text-gray-500">
          {progress.step}
        </p>
      </div>

      {/* Processing Steps */}
      <div className="space-y-4">
        {processingSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = index === currentStepIndex && isUploading;
          const isUpcoming = index > currentStepIndex;
          const IconComponent = step.icon;

          return (
            <Card
              key={step.id}
              className={`transition-all duration-300 ${
                isActive
                  ? 'bg-blue-50 border-blue-200 shadow-md'
                  : isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
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
                      {step.label}
                    </div>
                    {isActive && (
                      <div className="text-sm text-blue-600 mt-1">
                        {index === 0 && 'Reading and analyzing document structure...'}
                        {index === 1 && 'Extracting personal information, experience, and skills...'}
                        {index === 2 && 'Understanding context and optimizing content flow...'}
                        {index === 3 && 'Calculating ATS compatibility and keyword optimization...'}
                        {index === 4 && 'Generating personalized improvement suggestions...'}
                        {index === 5 && 'Applying template and formatting final resume...'}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fun Facts During Processing */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-purple-900 mb-2">Did You Know?</h3>
          <p className="text-purple-700 text-sm">
            Resumes optimized with AI get 40% more interviews than traditional resumes. 
            Our system analyzes over 50 different factors to ensure maximum ATS compatibility.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
