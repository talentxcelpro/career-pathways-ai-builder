import React from 'react';
import { TalentXcelLogo } from './TalentXcelLogo';

interface SplashScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible, onComplete }) => {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-primary">
      <div className="animate-scale-in">
        <TalentXcelLogo variant="symbol" size="xl" className="mb-6" />
      </div>
      
      <div className="animate-fade-in animation-delay-300">
        <h1 className="text-white text-2xl font-bold mb-2 text-center">
          TalentXcel
        </h1>
        <p className="text-white/90 text-center text-lg">
          Where Talent Meets Opportunity
        </p>
      </div>
      
      {/* Loading indicator */}
      <div className="mt-8 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full animate-pulse w-full"></div>
      </div>
    </div>
  );
};