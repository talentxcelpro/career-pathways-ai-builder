import React, { useEffect, useState } from 'react';
import { performanceBooster } from '@/utils/performanceBooster';

interface FastLoadingWrapperProps {
  children: React.ReactNode;
}

export const FastLoadingWrapper: React.FC<FastLoadingWrapperProps> = ({ children }) => {
  const [isOptimized, setIsOptimized] = useState(false);

  useEffect(() => {
    // Critical performance optimizations
    const optimize = async () => {
      // Preload critical resources
      performanceBooster.addResourceHint('/assets/talentxcel-logo.png', 'preload');
      
      // Optimize images on the page
      const images = document.querySelectorAll('img');
      images.forEach(img => performanceBooster.optimizeImage(img));
      
      // Enable intersection observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      // Observe all elements with lazy loading
      const lazyElements = document.querySelectorAll('[data-lazy]');
      lazyElements.forEach(el => observer.observe(el));

      setIsOptimized(true);
    };

    optimize();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className={`fast-loading-wrapper ${isOptimized ? 'optimized' : ''}`}>
      {children}
    </div>
  );
};