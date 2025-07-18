
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2 } from 'lucide-react';

interface ProcessingStepsProps {
  steps: string[];
  currentStep: number;
  fileName: string;
}

export const ProcessingSteps: React.FC<ProcessingStepsProps> = ({
  steps,
  currentStep,
  fileName
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Analyzing Your Resume
        </h1>
        <p className="text-gray-600">
          Processing {fileName}...
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <Progress value={progress} className="h-3 mb-4" />
              <p className="text-center text-sm text-gray-600">
                {Math.round(progress)}% Complete
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : index === currentStep ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                This usually takes 10-15 seconds...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
