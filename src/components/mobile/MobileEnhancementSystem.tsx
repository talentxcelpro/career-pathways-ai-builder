import React from 'react';
import { MobileViabilityWrapper, MobileModuleHeader, MobileSection, MobileGrid } from '@/components/mobile/MobileViabilityWrapper';
import { MobileButton, MobileInput, MobileCard, MobileTypography } from '@/components/mobile/MobileOptimizedComponents';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

/**
 * HOC to automatically enhance any module with mobile viability
 */
export function withMobileViability<T extends {}> (
  WrappedComponent: React.ComponentType<T>,
  options: {
    moduleName: string;
    enableBottomPadding?: boolean;
    customHeader?: {
      title: string;
      subtitle?: string;
      actions?: React.ReactNode;
    };
  }
) {
  const MobileEnhancedComponent = (props: T) => {
    const { isMobile } = useMobileOptimizations();

    if (!isMobile) {
      // On desktop, render the original component unchanged
      return <WrappedComponent {...props} />;
    }

    // On mobile, wrap with mobile optimizations
    return (
      <MobileViabilityWrapper 
        moduleName={options.moduleName}
        enableBottomPadding={options.enableBottomPadding}
      >
        {options.customHeader && (
          <MobileModuleHeader
            title={options.customHeader.title}
            subtitle={options.customHeader.subtitle}
            actions={options.customHeader.actions}
          />
        )}
        <WrappedComponent {...props} />
      </MobileViabilityWrapper>
    );
  };

  MobileEnhancedComponent.displayName = `withMobileViability(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return MobileEnhancedComponent;
}

/**
 * Hook to replace standard components with mobile-optimized versions
 */
export const useMobileComponents = () => {
  const { isMobile } = useMobileOptimizations();

  return {
    Button: MobileButton,
    Input: MobileInput,
    Card: MobileCard,
    Typography: MobileTypography,
    Section: MobileSection,
    Grid: MobileGrid,
    isMobile
  };
};

/**
 * Mobile Enhancement Provider - Apply mobile optimizations to any module
 */
interface MobileEnhancementProviderProps {
  children: React.ReactNode;
  moduleName: string;
  autoWrap?: boolean;
}

export const MobileEnhancementProvider: React.FC<MobileEnhancementProviderProps> = ({
  children,
  moduleName,
  autoWrap = true
}) => {
  const { isMobile } = useMobileOptimizations();

  if (!isMobile || !autoWrap) {
    return <>{children}</>;
  }

  return (
    <MobileViabilityWrapper moduleName={moduleName}>
      {children}
    </MobileViabilityWrapper>
  );
};

/**
 * Mobile Module Template - Standardized structure for all modules
 */
interface MobileModuleTemplateProps {
  moduleName: string;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  searchComponent?: React.ReactNode;
  filterComponents?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MobileModuleTemplate: React.FC<MobileModuleTemplateProps> = ({
  moduleName,
  title,
  subtitle,
  headerActions,
  searchComponent,
  filterComponents,
  children,
  className
}) => {
  return (
    <MobileViabilityWrapper moduleName={moduleName} className={className}>
      <MobileModuleHeader
        title={title}
        subtitle={subtitle}
        actions={headerActions}
      />

      {searchComponent && (
        <MobileSection title="Search">
          {searchComponent}
        </MobileSection>
      )}

      {filterComponents && (
        <MobileSection title="Filters">
          {filterComponents}
        </MobileSection>
      )}

      {children}
    </MobileViabilityWrapper>
  );
};

/**
 * Quick Mobile Enhancement - Apply mobile CSS classes automatically
 */
export const quickMobileEnhancement = {
  // Layout classes
  layout: 'mobile-optimized safe-area-padding',
  section: 'mobile-section',
  content: 'mobile-content',
  
  // Grid classes
  grid1: 'mobile-grid-1',
  grid2: 'mobile-grid-2', 
  grid3: 'mobile-grid-3',
  grid4: 'mobile-grid-4',
  
  // Component classes
  card: 'mobile-card-interactive',
  button: 'mobile-button touch-target',
  input: 'mobile-input',
  
  // Typography classes
  heading: 'mobile-heading',
  subheading: 'mobile-subheading',
  body: 'mobile-body',
  caption: 'mobile-caption',
  
  // Touch classes
  touchTarget: 'touch-target touch-feedback',
  
  // Animation classes
  slideUp: 'slide-up',
  fadeIn: 'fade-in-mobile',
  bounceIn: 'bounce-in'
};

/**
 * Mobile Audit Helper - Check if a component is mobile-ready
 */
export const checkMobileReadiness = (element: HTMLElement) => {
  const issues: string[] = [];
  
  // Check touch targets
  const clickableElements = element.querySelectorAll('button, a, [onclick], [role="button"]');
  clickableElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      issues.push(`Element with text "${el.textContent?.slice(0, 20)}..." has insufficient touch target size`);
    }
  });
  
  // Check input sizes
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const rect = input.getBoundingClientRect();
    if (rect.height < 44) {
      issues.push(`Input element has insufficient height for mobile`);
    }
  });
  
  // Check horizontal scrolling
  if (element.scrollWidth > element.clientWidth) {
    issues.push('Element causes horizontal scrolling on mobile');
  }
  
  // Check text size
  const textElements = element.querySelectorAll('p, span, div');
  textElements.forEach((el) => {
    const fontSize = window.getComputedStyle(el).fontSize;
    if (parseInt(fontSize) < 14) {
      issues.push(`Text element has font size smaller than 14px: ${fontSize}`);
    }
  });
  
  return {
    isMobileReady: issues.length === 0,
    issues,
    score: Math.max(0, 100 - (issues.length * 10))
  };
};
