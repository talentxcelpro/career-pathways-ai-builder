import React from 'react';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

interface EmptyCareerStateProps {
  onCreateGoal: () => void;
}

export const EmptyCareerState: React.FC<EmptyCareerStateProps> = ({ onCreateGoal }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 p-8">
      {/* Target Icon */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto">
          {/* Concentric circles like bullseye target */}
          <div className="absolute inset-0 rounded-full border-8 border-gray-200 opacity-40"></div>
          <div className="absolute inset-3 rounded-full border-6 border-gray-300 opacity-60"></div>
          <div className="absolute inset-6 rounded-full border-4 border-gray-400 opacity-80"></div>
          <div className="absolute inset-9 rounded-full border-4 border-gray-500"></div>
          <div className="absolute inset-14 rounded-full bg-gray-500 w-4 h-4"></div>
        </div>
      </div>
      
      {/* Main Message */}
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-light text-muted-foreground tracking-wide">
          No career goals set yet
        </h2>
      </div>
      
      {/* CTA Button */}
      <Button 
        onClick={onCreateGoal}
        className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 hover:from-purple-600 hover:via-purple-700 hover:to-pink-600 text-white border-0 px-12 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        Create Your First Goal
      </Button>
    </div>
  );
};