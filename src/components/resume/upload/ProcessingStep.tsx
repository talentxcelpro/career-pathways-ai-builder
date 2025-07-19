
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, FileText, Brain, Zap, Target, Sparkles, Wand2 } from "lucide-react";

interface ProcessingStepProps {
  onProcessingComplete: (data: any) => void;
  uploadedFile: File | null;
  selectedTemplate: string;
}

const processingSteps = [
  { id: 'upload', label: 'Analyzing uploaded file...', icon: FileText, duration: 2000 },
  { id: 'extraction', label: 'AI-powered content extraction...', icon: Brain, duration: 3000 },
  { id: 'parsing', label: 'Advanced text parsing with NLP...', icon: Zap, duration: 2500 },
  { id: 'optimization', label: 'ATS optimization & scoring...', icon: Target, duration: 3000 },
  { id: 'enhancement', label: 'Generating AI enhancements...', icon: Sparkles, duration: 2000 },
  { id: 'finalize', label: 'Finalizing your enhanced resume...', icon: Wand2, duration: 1500 }
];

export const ProcessingStep: React.FC<ProcessingStepProps> = ({
  onProcessingComplete,
  uploadedFile,
  selectedTemplate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < processingSteps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
        setProgress(((currentStep + 1) / processingSteps.length) * 100);
      }, processingSteps[currentStep].duration);

      return () => clearTimeout(timer);
    } else {
      // Processing complete
      setTimeout(() => {
        const mockResumeData = {
          personalInfo: {
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1 (555) 123-4567',
            title: 'Software Engineer'
          },
          summary: 'Experienced software engineer with expertise in full-stack development...',
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Tech Corp',
              duration: '2020 - Present',
              description: 'Led development of scalable web applications...'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Computer Science',
              school: 'University of Technology',
              year: '2018'
            }
          ],
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          atsScore: 87,
          template: selectedTemplate
        };
        onProcessingComplete(mockResumeData);
      }, 1000);
    }
  }, [currentStep, onProcessingComplete, selectedTemplate]);

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
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-center text-sm text-gray-500">
          Estimated time remaining: {Math.max(0, (processingSteps.length - currentStep) * 2)} seconds
        </p>
      </div>

      {/* Processing Steps */}
      <div className="space-y-4">
        {processingSteps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isActive = index === currentStep;
          const isUpcoming = index > currentStep;
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
