import React from 'react';
import { cn } from '@/lib/utils';
import { useMobileFirstOptimization } from '@/hooks/useMobileFirstOptimization';

interface MobileFirstLayoutProps {
  children: React.ReactNode;
  className?: string;
  enableOptimizations?: boolean;
  includeHeader?: boolean;
  headerContent?: React.ReactNode;
}

export const MobileFirstLayout: React.FC<MobileFirstLayoutProps> = ({
  children,
  className,
  enableOptimizations = true,
  includeHeader = false,
  headerContent
}) => {
  const { containerClass, spacingClass } = useMobileFirstOptimization({
    enableTouchOptimizations: enableOptimizations,
    optimizeImages: enableOptimizations
  });

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5",
      "mobile-optimized",
      className
    )}>
      {includeHeader && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
          <div className={containerClass}>
            <div className="py-2 sm:py-3">
              {headerContent}
            </div>
          </div>
        </header>
      )}
      
      <main className={cn(containerClass, spacingClass)}>
        {children}
      </main>
    </div>
  );
};

interface MobileFirstSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  centered?: boolean;
}

export const MobileFirstSection: React.FC<MobileFirstSectionProps> = ({
  children,
  className,
  title,
  subtitle,
  centered = false
}) => {
  return (
    <section className={cn(
      "space-y-4 sm:space-y-6",
      className
    )}>
      {(title || subtitle) && (
        <div className={cn(
          centered && "text-center"
        )}>
          {title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};