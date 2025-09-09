import React from 'react';
import { Outlet } from 'react-router-dom';
import { LearningNavigation } from './LearningNavigation';

interface LearningLayoutProps {
  children?: React.ReactNode;
}

export const LearningLayout: React.FC<LearningLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LearningNavigation />
        <main className="py-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};