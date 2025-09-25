import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface EmptyCareerStateProps {
  onCreateGoal: () => void;
  className?: string;
}

export const EmptyCareerState: React.FC<EmptyCareerStateProps> = ({ 
  onCreateGoal, 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[500px] text-center ${className}`}>
      {/* Centered circles pattern as shown in the image */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main heading */}
      <h2 className="text-2xl font-medium text-gray-600 mb-8 max-w-md">
        No career goals set yet
      </h2>

      {/* Create button with gradient */}
      <Button
        onClick={onCreateGoal}
        size="lg"
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-12 py-4 rounded-xl text-lg shadow-lg transition-all duration-200 hover:shadow-xl"
      >
        Create Your First Goal
      </Button>
    </div>
  );
};