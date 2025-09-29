import React from 'react';
import { useMobileContentStandardization } from '@/hooks/useMobileContentStandardization';
import { cn } from '@/lib/utils';

interface MobileContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableStandardization?: boolean;
}

/**
 * Wrapper component that applies mobile content standardization
 * Automatically applies consistent sizing on mobile without affecting desktop
 */
export const MobileContentWrapper: React.FC<MobileContentWrapperProps> = ({
  children,
  className,
  enableStandardization = true
}) => {
  const { isEnabled } = useMobileContentStandardization();

  // Auto-enable standardization if not explicitly disabled
  React.useEffect(() => {
    if (enableStandardization && isEnabled) {
      document.body.classList.add('mobile-content-standardized');
    }
  }, [enableStandardization, isEnabled]);

  return (
    <div className={cn(
      'mobile-content-wrapper',
      isEnabled && enableStandardization && 'mobile-standardized-content',
      className
    )}>
      {children}
    </div>
  );
};

/**
 * HOC to wrap any page component with mobile standardization
 */
export const withMobileContentStandardization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isEnabled } = useMobileContentStandardization();

    return (
      <MobileContentWrapper enableStandardization={isEnabled}>
        <Component {...props} />
      </MobileContentWrapper>
    );
  };

  WrappedComponent.displayName = `withMobileContentStandardization(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Component for standardized mobile text
 */
interface StandardizedTextProps {
  variant: 'hero' | 'pageTitle' | 'sectionTitle' | 'cardTitle' | 'body' | 'caption';
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const StandardizedText: React.FC<StandardizedTextProps> = ({
  variant,
  children,
  className,
  as: Component = 'div'
}) => {
  const { getStandardClasses, combineClasses } = useMobileContentStandardization();
  
  const standardClasses = getStandardClasses('text', variant);
  const finalClasses = combineClasses(className || '', standardClasses);

  return (
    <Component className={cn(finalClasses)}>
      {children}
    </Component>
  );
};