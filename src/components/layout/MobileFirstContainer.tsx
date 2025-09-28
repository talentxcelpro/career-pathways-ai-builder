import React from 'react';
import { cn } from '@/lib/utils';

interface MobileFirstContainerProps {
  children: React.ReactNode;
  className?: string;
  enableOptimizations?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
}

export const MobileFirstContainer: React.FC<MobileFirstContainerProps> = ({
  children,
  className,
  enableOptimizations = true,
  maxWidth = '7xl'
}) => {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl'
  }[maxWidth];

  return (
    <div 
      className={cn(
        // Mobile-first container
        maxWidthClass,
        "mx-auto",
        // Mobile-first padding
        "px-3 sm:px-6 lg:px-8",
        // Mobile optimizations
        enableOptimizations && "mobile-optimized",
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileFirstPageProps {
  children: React.ReactNode;
  className?: string;
  includeHeader?: boolean;
}

export const MobileFirstPage: React.FC<MobileFirstPageProps> = ({
  children,
  className,
  includeHeader = false
}) => {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5",
      "mobile-optimized",
      className
    )}>
      {includeHeader && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
          <MobileFirstContainer>
            <div className="py-2 sm:py-3">
              {/* Header content will be passed as children when needed */}
            </div>
          </MobileFirstContainer>
        </div>
      )}
      {children}
    </div>
  );
};