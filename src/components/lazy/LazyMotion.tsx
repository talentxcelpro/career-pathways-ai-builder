import React, { Suspense, lazy } from 'react';

// Lazy load framer-motion components
export const LazyMotionDiv = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.div 
  }))
);

export const LazyMotionButton = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.button 
  }))
);

export const LazyMotionSpan = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.span 
  }))
);

export const LazyAnimatePresence = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.AnimatePresence 
  }))
);

// Wrapper for motion components with suspense
interface LazyMotionWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyMotionWrapper: React.FC<LazyMotionWrapperProps> = ({ 
  children, 
  fallback = null 
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

// Simple CSS-based alternatives for basic animations
export const CSSMotionDiv: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  animate?: 'fadeIn' | 'slideUp' | 'scaleIn';
}> = ({ className = '', animate, ...props }) => (
  <div 
    className={`
      ${animate === 'fadeIn' ? 'animate-fade-in' : ''}
      ${animate === 'slideUp' ? 'animate-slide-up' : ''}
      ${animate === 'scaleIn' ? 'animate-scale-in' : ''}
      ${className}
    `}
    {...props}
  />
);