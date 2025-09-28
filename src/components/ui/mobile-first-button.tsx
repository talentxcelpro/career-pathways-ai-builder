import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileFirstButtonProps extends ButtonProps {
  mobileText?: string;
  desktopText?: string;
  touchTarget?: boolean;
}

export const MobileFirstButton: React.FC<MobileFirstButtonProps> = ({
  children,
  mobileText,
  desktopText,
  touchTarget = true,
  className,
  ...props
}) => {
  return (
    <Button
      className={cn(
        // Mobile-first touch target
        touchTarget && "min-h-[44px] touch-target",
        // Responsive padding
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