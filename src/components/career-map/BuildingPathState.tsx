import React from 'react';
import { Brain } from 'lucide-react';

export const BuildingPathState: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 p-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-purple-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-200 rounded-full opacity-20 animate-bounce"></div>
      </div>
      
      {/* Brain Icon with Animation */}
      <div className="relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
          <Brain className="h-12 w-12 text-white" />
        </div>
      </div>
      
      {/* Loading Message */}
      <div className="space-y-2 relative z-10">
        <p className="text-muted-foreground text-sm uppercase tracking-wide">
          Click on any node to explore detailed information and AI insights
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
          Building your path...
        </h2>
      </div>
      
      {/* Loading Animation */}
      <div className="flex space-x-2 relative z-10">
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};