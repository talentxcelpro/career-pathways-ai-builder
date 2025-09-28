import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

/**
 * Mobile-Optimized Button
 * Ensures touch-friendly sizing and interactions
 */
export const MobileButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    touchOptimized?: boolean;
    mobileText?: string;
    desktopText?: string;
  }
>(({ className, touchOptimized = true, mobileText, desktopText, children, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <Button
      ref={ref}
      className={cn(
        // Mobile touch optimizations
        touchOptimized && isMobile && [
          "min-h-[44px] min-w-[44px]",
          "px-4 py-3",
          "text-sm font-medium",
          "touch-target"
        ],
        // Desktop optimizations
        !isMobile && "px-6 py-2",
        className
      )}
      {...props}
    >
      {mobileText && desktopText ? (
        <>
          {isMobile ? mobileText : desktopText}
        </>
      ) : (
        children
      )}
    </Button>
  );
});
MobileButton.displayName = "MobileButton";

/**
 * Mobile-Optimized Input
 * Better sizing and keyboard handling on mobile
 */
export const MobileInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input> & {
    mobileKeyboard?: 'default' | 'email' | 'numeric' | 'tel' | 'search' | 'url';
  }
>(({ className, mobileKeyboard = 'default', ...props }, ref) => {
  const isMobile = useIsMobile();

  const keyboardTypes = {
    default: 'text',
    email: 'email',
    numeric: 'number',
    tel: 'tel',
    search: 'search',
    url: 'url'
  };

  return (
    <Input
      ref={ref}
      type={isMobile ? keyboardTypes[mobileKeyboard] : 'text'}
      className={cn(
        // Mobile optimizations
        isMobile && [
          "h-12 px-4",
          "text-base", // Prevents zoom on iOS
          "rounded-lg"
        ],
        // Desktop styling
        !isMobile && "h-10 px-3",
        className
      )}
      {...props}
    />
  );
});
MobileInput.displayName = "MobileInput";

/**
 * Mobile-Optimized Card
 * Better spacing and touch interactions
 */
export const MobileCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Card> & {
    touchOptimized?: boolean;
  }
>(({ className, touchOptimized = true, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <Card
      ref={ref}
      className={cn(
        // Mobile optimizations
        isMobile && [
          "rounded-lg shadow-sm",
          "p-4",
          touchOptimized && "cursor-pointer active:scale-[0.98] transition-transform"
        ],
        // Desktop styling
        !isMobile && "p-6",
        className
      )}
      {...props}
    />
  );
});
MobileCard.displayName = "MobileCard";

interface MobileTypographyProps {
  children: React.ReactNode;
  variant?: 'hero' | 'heading' | 'subheading' | 'body' | 'caption';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Mobile-Responsive Typography
 * Automatically scales text for mobile screens
 */
export const MobileTypography: React.FC<MobileTypographyProps> = ({
  children,
  variant = 'body',
  className,
  as: Component = 'p'
}) => {
  const isMobile = useIsMobile();

  const variantClasses = {
    hero: isMobile 
      ? 'text-2xl sm:text-3xl font-bold' 
      : 'text-4xl lg:text-5xl xl:text-6xl font-bold',
    heading: isMobile 
      ? 'text-xl sm:text-2xl font-semibold' 
      : 'text-2xl lg:text-3xl xl:text-4xl font-semibold',
    subheading: isMobile 
      ? 'text-lg font-medium' 
      : 'text-xl lg:text-2xl font-medium',
    body: isMobile 
      ? 'text-sm leading-relaxed' 
      : 'text-base leading-relaxed',
    caption: isMobile 
      ? 'text-xs' 
      : 'text-sm'
  };

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
};

interface MobileSpacingProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * Mobile-Responsive Spacing
 * Consistent spacing that adapts to screen size
 */
export const MobileSpacing: React.FC<MobileSpacingProps> = ({
  children,
  size = 'md',
  direction = 'vertical',
  className
}) => {
  const isMobile = useIsMobile();

  const spacingClasses = {
    xs: direction === 'vertical' 
      ? (isMobile ? 'space-y-1' : 'space-y-2')
      : (isMobile ? 'space-x-1' : 'space-x-2'),
    sm: direction === 'vertical' 
      ? (isMobile ? 'space-y-2' : 'space-y-3')
      : (isMobile ? 'space-x-2' : 'space-x-3'),
    md: direction === 'vertical' 
      ? (isMobile ? 'space-y-3' : 'space-y-4')
      : (isMobile ? 'space-x-3' : 'space-x-4'),
    lg: direction === 'vertical' 
      ? (isMobile ? 'space-y-4' : 'space-y-6')
      : (isMobile ? 'space-x-4' : 'space-x-6'),
    xl: direction === 'vertical' 
      ? (isMobile ? 'space-y-6' : 'space-y-8')
      : (isMobile ? 'space-x-6' : 'space-x-8')
  };

  return (
    <div className={cn(
      spacingClasses[size],
      direction === 'horizontal' && 'flex items-center',
      className
    )}>
      {children}
    </div>
  );
};