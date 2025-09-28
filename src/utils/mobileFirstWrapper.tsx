import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileFirstOptimization } from '@/hooks/useMobileFirstOptimization';

// Higher Order Component to wrap any page with mobile-first optimizations
export const withMobileFirst = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const MobileFirstWrapper: React.FC<P> = (props) => {
    const { containerClass, spacingClass, buttonClass } = useMobileFirstOptimization({
      enableTouchOptimizations: true,
      optimizeImages: true
    });

    // Inject mobile-first classes into child components
    React.useEffect(() => {
      // Add mobile-optimized class to body
      document.body.classList.add('mobile-optimized');
      
      // Add touch-friendly classes to all buttons
      const buttons = document.querySelectorAll('button:not([data-mobile-optimized])');
      buttons.forEach(button => {
        button.classList.add('min-h-[44px]', 'touch-target');
        button.setAttribute('data-mobile-optimized', 'true');
      });

      // Add responsive classes to containers
      const containers = document.querySelectorAll('.container:not([data-mobile-optimized])');
      containers.forEach(container => {
        container.classList.add('px-3', 'sm:px-6', 'lg:px-8');
        container.setAttribute('data-mobile-optimized', 'true');
      });

      return () => {
        document.body.classList.remove('mobile-optimized');
      };
    }, []);

    return <WrappedComponent {...props} />;
  };

  MobileFirstWrapper.displayName = `withMobileFirst(${WrappedComponent.displayName || WrappedComponent.name})`;
  return MobileFirstWrapper;
};

// Hook to apply mobile-first styles to any component
export const useMobileFirstStyles = () => {
  return {
    // Container utilities
    container: "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8",
    page: "min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 mobile-optimized",
    
    // Spacing utilities
    sectionSpacing: "py-4 sm:py-8",
    componentSpacing: "space-y-3 sm:space-y-6",
    itemSpacing: "space-y-2 sm:space-y-4",
    
    // Typography utilities
    heroText: "text-3xl sm:text-4xl lg:text-5xl font-bold",
    headingText: "text-2xl sm:text-3xl font-bold",
    subheadingText: "text-lg sm:text-xl font-semibold",
    bodyText: "text-sm sm:text-base",
    
    // Layout utilities
    flexCol: "flex flex-col space-y-3 sm:space-y-4",
    flexRow: "flex flex-col sm:flex-row gap-3 sm:gap-4",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4",
    
    // Interactive utilities
    button: "min-h-[44px] px-3 sm:px-4 py-2 touch-target",
    card: "p-3 sm:p-6 rounded-lg shadow-sm",
    
    // Navigation utilities
    nav: "sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b",
    navContainer: "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3"
  };
};

// Utility function to add mobile-first classes to existing elements
export const applyMobileFirstClasses = (element: HTMLElement, type: 'button' | 'container' | 'text' | 'card') => {
  const styles = useMobileFirstStyles();
  
  switch (type) {
    case 'button':
      element.className = cn(element.className, styles.button);
      break;
    case 'container':
      element.className = cn(element.className, styles.container);
      break;
    case 'card':
      element.className = cn(element.className, styles.card);
      break;
    default:
      break;
  }
};

// React hook to automatically apply mobile-first optimizations
export const useAutoMobileOptimization = (enabled = true) => {
  React.useEffect(() => {
    if (!enabled) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // Auto-optimize buttons
            if (element.tagName === 'BUTTON' && !element.hasAttribute('data-mobile-optimized')) {
              applyMobileFirstClasses(element, 'button');
              element.setAttribute('data-mobile-optimized', 'true');
            }
            
            // Auto-optimize containers
            if (element.classList.contains('container') && !element.hasAttribute('data-mobile-optimized')) {
              applyMobileFirstClasses(element, 'container');
              element.setAttribute('data-mobile-optimized', 'true');
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [enabled]);
};