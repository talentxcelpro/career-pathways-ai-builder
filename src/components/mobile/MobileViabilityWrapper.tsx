import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileViabilityWrapperProps {
  children: React.ReactNode;
  className?: string;
  enableBottomPadding?: boolean;
  moduleName?: string;
}

/**
 * Universal Mobile Viability Wrapper
 * Ensures any module/page is mobile-optimized automatically
 */
export const MobileViabilityWrapper: React.FC<MobileViabilityWrapperProps> = ({
  children,
  className,
  enableBottomPadding = true,
  moduleName = "Module"
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "mobile-viability-wrapper",
      // Base mobile optimizations
      "w-full min-h-screen",
      // Mobile-specific styling
      isMobile && [
        "mobile-optimized",
        "safe-area-padding-top",
        enableBottomPadding && "pb-20 safe-area-padding-bottom",
        // Touch-friendly spacing
        "px-3 sm:px-4 md:px-6",
        // Prevent horizontal scroll
        "overflow-x-hidden",
        // Optimize for mobile performance
        "gpu-accelerated"
      ],
      // Desktop styling
      !isMobile && [
        "px-4 sm:px-6 lg:px-8",
        "max-w-7xl mx-auto"
      ],
      className
    )}>
      {/* Mobile-first content wrapper */}
      <div className={cn(
        "mobile-content-wrapper",
        // Mobile typography scaling
        isMobile && [
          "text-sm leading-relaxed",
          // Better touch targets
          "[&_button]:min-h-[44px] [&_button]:min-w-[44px]",
          "[&_a]:min-h-[44px] [&_a]:inline-flex [&_a]:items-center",
          // Mobile-optimized forms
          "[&_input]:h-12 [&_select]:h-12 [&_textarea]:min-h-[120px]",
          // Mobile-friendly cards
          "[&_.card]:rounded-lg [&_.card]:shadow-sm",
          // Better mobile spacing
          "[&>*]:mb-4 [&>*:last-child]:mb-0"
        ],
        // Desktop optimizations
        !isMobile && [
          "text-base",
          // Desktop spacing
          "[&>*]:mb-6 [&>*:last-child]:mb-0"
        ]
      )}>
        {children}
      </div>
    </div>
  );
};

interface MobileModuleHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Standardized Mobile Module Header
 */
export const MobileModuleHeader: React.FC<MobileModuleHeaderProps> = ({
  title,
  subtitle,
  actions,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "mobile-module-header",
      "mb-6",
      isMobile && [
        "px-4 py-3",
        "border-b border-border/20",
        "bg-background/95 backdrop-blur-sm",
        "sticky top-0 z-10"
      ],
      !isMobile && "mb-8",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className={cn(
            "font-bold tracking-tight",
            isMobile ? "text-xl" : "text-2xl lg:text-3xl"
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(
              "text-muted-foreground mt-1",
              isMobile ? "text-sm" : "text-base"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  mobileColumns?: 1 | 2;
  tabletColumns?: 2 | 3 | 4;
  desktopColumns?: 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Responsive Grid for Mobile-First Design
 */
export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'md',
  className
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  };

  const mobileColumnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2'
  };

  const tabletColumnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  };

  const desktopColumnClasses = {
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6'
  };

  return (
    <div className={cn(
      "mobile-grid grid",
      mobileColumnClasses[mobileColumns],
      tabletColumnClasses[tabletColumns],
      desktopColumnClasses[desktopColumns],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

interface MobileSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * Mobile-Optimized Section Component
 */
export const MobileSection: React.FC<MobileSectionProps> = ({
  children,
  title,
  description,
  className,
  headerActions
}) => {
  const isMobile = useIsMobile();

  return (
    <section className={cn(
      "mobile-section",
      isMobile ? "mb-6" : "mb-8",
      className
    )}>
      {(title || description || headerActions) && (
        <div className={cn(
          "section-header flex items-start justify-between",
          isMobile ? "mb-4" : "mb-6"
        )}>
          <div className="flex-1">
            {title && (
              <h2 className={cn(
                "font-semibold",
                isMobile ? "text-lg" : "text-xl lg:text-2xl"
              )}>
                {title}
              </h2>
            )}
            {description && (
              <p className={cn(
                "text-muted-foreground mt-1",
                isMobile ? "text-sm" : "text-base"
              )}>
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="ml-4">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
    </section>
  );
};