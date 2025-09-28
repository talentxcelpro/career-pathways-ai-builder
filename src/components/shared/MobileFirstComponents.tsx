import React from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Mobile-First Button Component
interface MobileButtonProps extends ButtonProps {
  touchOptimized?: boolean;
  mobileText?: string;
  desktopText?: string;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  className,
  touchOptimized = true,
  mobileText,
  desktopText,
  ...props
}) => {
  return (
    <Button
      className={cn(
        touchOptimized && "min-h-[44px] touch-target",
        "px-3 sm:px-4 py-2",
        className
      )}
      {...props}
    >
      {mobileText && desktopText ? (
        <>
          <span className="sm:hidden">{mobileText}</span>
          <span className="hidden sm:inline">{desktopText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
};

// Mobile-First Card Component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  mobileOptimized?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  mobileOptimized = true,
  ...props
}) => {
  return (
    <Card
      className={cn(
        mobileOptimized && "card-mobile",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};

// Mobile-First Text Component
interface MobileTextProps {
  children: React.ReactNode;
  variant?: 'hero' | 'heading' | 'subheading' | 'body' | 'caption';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
}

export const MobileText: React.FC<MobileTextProps> = ({
  children,
  variant = 'body',
  className,
  as: Component = 'p'
}) => {
  const variantClasses = {
    hero: 'text-3xl sm:text-5xl lg:text-6xl font-bold',
    heading: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    subheading: 'text-xl sm:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm'
  };

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
};

// Mobile-First Spacing Component
interface MobileSpacingProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const MobileSpacing: React.FC<MobileSpacingProps> = ({
  children,
  size = 'md',
  className
}) => {
  const spacingClasses = {
    xs: 'space-y-1 sm:space-y-2',
    sm: 'space-y-2 sm:space-y-3',
    md: 'space-y-3 sm:space-y-4',
    lg: 'space-y-4 sm:space-y-6',
    xl: 'space-y-6 sm:space-y-8'
  };

  return (
    <div className={cn(spacingClasses[size], className)}>
      {children}
    </div>
  );
};

// Mobile-First Image Component
interface MobileImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  mobileOptimized?: boolean;
  lazy?: boolean;
}

export const MobileImage: React.FC<MobileImageProps> = ({
  className,
  mobileOptimized = true,
  lazy = true,
  ...props
}) => {
  return (
    <img
      className={cn(
        "w-full h-auto object-cover",
        mobileOptimized && "responsive-image",
        className
      )}
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      {...props}
    />
  );
};