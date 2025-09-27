import React, { useEffect, useState } from 'react';
import { hyperPerformanceCore } from '@/utils/hyperPerformanceCore';
import { appleStyleLoader } from '@/utils/appleStyleLoader';

interface UltraFastLoaderProps {
  children: React.ReactNode;
}

export const UltraFastLoader: React.FC<UltraFastLoaderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Listen for loading progress
    const handleProgress = (event: CustomEvent) => {
      setProgress(event.detail.progress);
    };

    const handleComplete = () => {
      setIsLoading(false);
      // Small delay for smooth transition
      setTimeout(() => setShowContent(true), 50);
    };

    window.addEventListener('loadingProgress', handleProgress as EventListener);
    window.addEventListener('loadingComplete', handleComplete);

    // Fallback completion after 1 second
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 1000);

    return () => {
      window.removeEventListener('loadingProgress', handleProgress as EventListener);
      window.removeEventListener('loadingComplete', handleComplete);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Apple-style loading indicator */}
          <div className="relative">
            <div className="w-8 h-8 border-2 border-primary/20 rounded-full"></div>
            <div 
              className="absolute inset-0 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
              style={{
                animationDuration: '0.8s',
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            ></div>
          </div>
          
          {/* Progress bar */}
          <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`transition-opacity duration-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
};