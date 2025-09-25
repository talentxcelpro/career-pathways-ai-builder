import React from 'react';
import { LearningHeroNav } from './LearningHeroNav';

interface LearningPageLayoutProps {
  children: React.ReactNode;
  showHeroNav?: boolean;
  heroTitle?: string;
  heroDescription?: string;
}

export const LearningPageLayout: React.FC<LearningPageLayoutProps> = ({ 
  children, 
  showHeroNav = true,
  heroTitle,
  heroDescription
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {showHeroNav && (
        <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {heroTitle ? (
              <div className="text-center space-y-6 mb-16">
                <div className="space-y-4">
                  <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 animate-fade-in">
                    {heroTitle}
                  </h1>
                  {heroDescription && (
                    <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                      {heroDescription}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <LearningHeroNav />
            )}
          </div>
        </section>
      )}
      
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};