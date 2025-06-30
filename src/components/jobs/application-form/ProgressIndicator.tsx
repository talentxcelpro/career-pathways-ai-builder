
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
            step <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {step}
          </div>
          {step < totalSteps && (
            <div className={`w-6 h-0.5 mx-1 ${
              step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
