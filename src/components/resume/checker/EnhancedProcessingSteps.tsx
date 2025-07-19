
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, FileText, Brain, Target, Zap, Shield, Star } from 'lucide-react';

interface EnhancedProcessingStepsProps {
  steps: string[];
  currentStep: number;
  fileName: string;
  progress: number;
}

const stepIcons = {
  0: FileText,
  1: Brain,
  2: Target,
  3: Zap,
  4: Shield,
  5: Star,
};

export const EnhancedProcessingSteps: React.FC<EnhancedProcessingStepsProps> = ({
  steps,
  currentStep,
  fileName,
  progress
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analyzing Your Resume
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Processing <span className="font-medium">{fileName}</span>
        </p>
        <p className="text-sm text-gray-500">
          Our AI is checking {steps.length} key areas to optimize your resume
        </p>
      </div>

      <Card className="shadow-lg border-0">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;
                const isUpcoming = index > currentStep;
                const IconComponent = stepIcons[index as keyof typeof stepIcons] || FileText;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                      isCompleted
                        ? 'bg-green-50 border border-green-200'
                        : isActive
                          ? 'bg-blue-50 border border-blue-200 shadow-sm'
                          : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 animate-scale-in" />
                      ) : isActive ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <IconComponent className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div
                        className={`font-semibold transition-colors duration-300 ${
                          isCompleted
                            ? 'text-green-800'
                            : isActive
                              ? 'text-blue-800'
                              : 'text-gray-500'
                        }`}
                      >
                        {step}
                      </div>
                      {isActive && (
                        <div className="text-sm text-blue-600 mt-1 animate-fade-in">
                          {index === 0 && 'Extracting text and analyzing structure...'}
                          {index === 1 && 'Checking ATS compatibility and format...'}
                          {index === 2 && 'Analyzing content quality and impact...'}
                          {index === 3 && 'Identifying missing keywords and skills...'}
                          {index === 4 && 'Calculating overall optimization score...'}
                          {index === 5 && 'Generating personalized recommendations...'}
                        </div>
                      )}
                      {isCompleted && (
                        <div className="text-sm text-green-600 mt-1 font-medium">
                          ✓ Complete
                        </div>
                      )}
                    </div>
                    
                    {isCompleted && (
                      <div className="text-green-500 animate-bounce-in">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estimated Time */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {currentStep < steps.length - 1 
                  ? `Estimated time remaining: ${Math.max(1, 15 - Math.floor(progress / 10))} seconds`
                  : 'Almost done! Finalizing your report...'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
