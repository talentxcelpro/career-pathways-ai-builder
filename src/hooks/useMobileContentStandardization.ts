import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Hook for standardizing mobile content sizing across all pages
 * Provides consistent mobile typography, spacing, and layout without affecting desktop
 */
export const useMobileContentStandardization = () => {
  const isMobile = useIsMobile();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setIsEnabled(true);
      
      // Apply mobile standardization classes to body
      document.body.classList.add('mobile-content-standardized');
      
      // Ensure mobile-optimized class is present
      if (!document.body.classList.contains('mobile-optimized')) {
        document.body.classList.add('mobile-optimized');
      }
    } else {
      setIsEnabled(false);
      document.body.classList.remove('mobile-content-standardized');
    }

    return () => {
      document.body.classList.remove('mobile-content-standardized');
    };
  }, [isMobile]);

  // Standard mobile content sizing utilities
  const standardSizes = {
    // Typography - standardized for mobile readability
    text: {
      hero: 'text-2xl sm:text-5xl lg:text-6xl font-bold leading-tight',
      pageTitle: 'text-xl sm:text-3xl lg:text-4xl font-bold',
      sectionTitle: 'text-lg sm:text-2xl font-semibold',
      cardTitle: 'text-base sm:text-lg font-medium',
      body: 'text-sm sm:text-base leading-relaxed',
      caption: 'text-xs sm:text-sm text-muted-foreground',
      label: 'text-xs sm:text-sm font-medium'
    },

    // Spacing - consistent mobile spacing
    spacing: {
      pageVertical: 'py-3 sm:py-6 lg:py-8',
      sectionVertical: 'py-4 sm:py-6',
      componentVertical: 'py-2 sm:py-4',
      stackVertical: 'space-y-3 sm:space-y-4 lg:space-y-6',
      gridGap: 'gap-3 sm:gap-4 lg:gap-6'
    },

    // Layout - mobile-first responsive containers
    layout: {
      pageContainer: 'max-w-7xl mx-auto px-3 sm:px-6 lg:px-8',
      contentContainer: 'max-w-4xl mx-auto px-3 sm:px-6',
      sectionContainer: 'w-full max-w-none px-3 sm:px-0',
      cardPadding: 'p-3 sm:p-4 lg:p-6',
      cardSpacing: 'space-y-2 sm:space-y-3'
    },

    // Interactive elements - touch-friendly sizing
    interactive: {
      buttonPrimary: 'min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
      buttonSecondary: 'min-h-[44px] px-3 sm:px-4 py-2 text-sm',
      inputField: 'min-h-[44px] px-3 sm:px-4 text-base sm:text-sm',
      tabButton: 'min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm'
    }
  };

  return {
    isEnabled,
    isMobile,
    standardSizes,
    
    // Helper function to get standardized classes
    getStandardClasses: (type: keyof typeof standardSizes, variant: string) => {
      return standardSizes[type]?.[variant as keyof typeof standardSizes[typeof type]] || '';
    },

    // Helper to combine with existing classes safely
    combineClasses: (existingClasses: string, standardClasses: string) => {
      // Only apply standard classes on mobile
      return isMobile ? `${existingClasses} ${standardClasses}` : existingClasses;
    }
  };
};

/**
 * Hook specifically for standardizing page layouts
 */
export const useMobilePageLayout = () => {
  const { isEnabled, standardSizes } = useMobileContentStandardization();

  return {
    pageWrapper: isEnabled ? standardSizes.layout.pageContainer : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    contentWrapper: isEnabled ? standardSizes.layout.contentContainer : 'max-w-4xl mx-auto px-4 sm:px-6',
    sectionSpacing: isEnabled ? standardSizes.spacing.sectionVertical : 'py-8',
    stackSpacing: isEnabled ? standardSizes.spacing.stackVertical : 'space-y-6'
  };
};

/**
 * Hook for standardizing typography across pages
 */
export const useMobileTypography = () => {
  const { isEnabled, standardSizes } = useMobileContentStandardization();

  return {
    hero: isEnabled ? standardSizes.text.hero : 'text-4xl sm:text-5xl lg:text-6xl font-bold',
    pageTitle: isEnabled ? standardSizes.text.pageTitle : 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    sectionTitle: isEnabled ? standardSizes.text.sectionTitle : 'text-xl sm:text-2xl font-semibold',
    cardTitle: isEnabled ? standardSizes.text.cardTitle : 'text-lg font-medium',
    body: isEnabled ? standardSizes.text.body : 'text-base',
    caption: isEnabled ? standardSizes.text.caption : 'text-sm text-muted-foreground'
  };
};