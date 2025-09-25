import React from 'react';
import { Brain } from 'lucide-react';

interface BuildingPathStateProps {
  className?: string;
}

export const BuildingPathState: React.FC<BuildingPathStateProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[500px] text-center ${className}`}>
      {/* Header text */}
      <p className="text-gray-500 text-sm mb-8 max-w-lg">
        Click on any node to explore detailed information and AI insights
      </p>

      {/* Visual elements showing path building */}
      <div className="relative mb-12">
        {/* Background blur elements */}
        <div className="absolute top-10 left-10 w-24 h-24 bg-green-200 rounded-full opacity-30 blur-xl"></div>
        <div className="absolute top-32 right-16 w-32 h-32 bg-blue-200 rounded-full opacity-40 blur-2xl"></div>
        <div className="absolute bottom-10 left-20 w-20 h-20 bg-purple-200 rounded-full opacity-35 blur-lg"></div>

        {/* Central brain icon */}
        <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
          <Brain className="h-10 w-10 text-white" />
        </div>
      </div>

      {/* Building message */}
      <h2 className="text-2xl font-medium text-gray-800 mb-4">
        Building your path...
      </h2>

      {/* Animated dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};