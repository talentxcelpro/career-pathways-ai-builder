import { useEffect, useRef } from 'react';
import { applePerformance } from '@/utils/applePerformance';

/**
 * Hook for Apple-inspired design enhancements
 * Provides non-destructive visual and performance improvements
 */
export const useAppleDesign = () => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      applePerformance.addAppleEnhancements(elementRef.current);
    }
  }, []);

  return {
    elementRef,
    // Apple-inspired utility classes
    classes: {
      // Performance optimizations
      optimized: 'apple-optimized',
      hover: 'apple-hover',
      focus: 'apple-focus',
      text: 'apple-text',
      contain: 'apple-contain',
      scroll: 'apple-scroll',
      
      // Dark text enhancements
      textPrimary: 'text-apple-primary',
      textSecondary: 'text-apple-secondary',
      textMuted: 'text-apple-muted',
      textHighContrast: 'text-apple-high-contrast',
      
      // Typography
      headingEnhanced: 'heading-apple-enhanced',
      headingDisplay: 'heading-apple-display',
      bodyEnhanced: 'body-apple-enhanced',
      
      // Component text
      buttonText: 'button-text-apple',
      navText: 'nav-text-apple',
      inputText: 'input-text-apple',
      cardText: 'card-text-apple',
      cardTitle: 'card-title-apple',
      labelText: 'label-apple',
      captionText: 'caption-apple',
      
      // Utility
      contrastShadow: 'text-contrast-shadow'
    }
  };
};

/**
 * Hook for Apple-style animations
 */
export const useAppleAnimations = () => {
  return {
    // Timing functions
    timings: {
      fastEase: 'cubic-bezier(0.77, 0, 0.175, 1)',
      smoothEase: 'cubic-bezier(0.16, 1, 0.3, 1)',
      springEase: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    
    // Duration presets
    durations: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s',
    },
    
    // Common animation styles
    getHoverStyle: () => ({
      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer',
    }),
    
    getFocusStyle: () => ({
      outline: '2px solid hsl(var(--primary))',
      outlineOffset: '2px',
      borderRadius: '6px',
      transition: 'outline 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
    
    getButtonHoverStyle: () => ({
      transform: 'translateY(-1px) scale(1.02)',
      filter: 'brightness(1.05)',
      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
  };
};

/**
 * Hook for Apple-style text improvements
 */
export const useAppleText = (variant: 'primary' | 'secondary' | 'muted' | 'high-contrast' = 'primary') => {
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (textRef.current) {
      // Add Apple text enhancements
      textRef.current.classList.add('apple-text');
      
      // Add variant-specific classes
      switch (variant) {
        case 'primary':
          textRef.current.classList.add('text-apple-primary');
          break;
        case 'secondary':
          textRef.current.classList.add('text-apple-secondary');
          break;
        case 'muted':
          textRef.current.classList.add('text-apple-muted');
          break;
        case 'high-contrast':
          textRef.current.classList.add('text-apple-high-contrast');
          break;
      }
    }
  }, [variant]);

  return textRef;
};

/**
 * Hook for Apple-style performance monitoring
 */
export const useApplePerformance = () => {
  useEffect(() => {
    // Enable Apple performance enhancements
    applePerformance.enable();
    
    // Optional: Monitor performance in development
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        console.log(`🍎 Apple enhancements loaded in ${(endTime - startTime).toFixed(2)}ms`);
      };
    }
  }, []);

  return {
    isOptimized: true,
    enhanceElement: (element: HTMLElement) => {
      applePerformance.addAppleEnhancements(element);
    }
  };
};