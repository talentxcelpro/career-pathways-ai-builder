import React from 'react';

interface AIStatusIndicatorProps {
  module: string;
  feature: string;
  children: React.ReactNode;
}

export const AIStatusIndicator: React.FC<AIStatusIndicatorProps> = ({ 
  module, 
  feature, 
  children 
}) => {
  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
        <span className="text-white text-xs">🧠</span>
      </div>
      <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
        AI-Powered by TalentXcel
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black"></div>
      </div>
    </div>
  );
};