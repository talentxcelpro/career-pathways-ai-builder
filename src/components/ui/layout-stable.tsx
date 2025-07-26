import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LayoutStableProps {
  children: ReactNode;
  className?: string;
  minHeight?: string | number;
  aspectRatio?: string;
  reserveSpace?: boolean;
}

// 🔴 Fix #2: Prevent Cumulative Layout Shift (CLS)
export const LayoutStable = ({
  children,
  className,
  minHeight = '200px',
  aspectRatio,
  reserveSpace = true
}: LayoutStableProps) => {
  const style = {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    ...(aspectRatio && { aspectRatio })
  };

  return (
    <div 
      className={cn(
        "relative",
        reserveSpace && "min-h-[200px]", // Reserve space to prevent shifts
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
};

// Specific stable components for common use cases
export const StableCard = ({ children, className, ...props }: LayoutStableProps) => (
  <LayoutStable 
    className={cn("rounded-lg border bg-card p-6", className)} 
    minHeight="300px"
    {...props}
  >
    {children}
  </LayoutStable>
);

export const StableHero = ({ children, className, ...props }: LayoutStableProps) => (
  <LayoutStable 
    className={cn("relative overflow-hidden", className)} 
    minHeight="400px"
    aspectRatio="16/9"
    {...props}
  >
    {children}
  </LayoutStable>
);

export const StableChartContainer = ({ children, className, ...props }: LayoutStableProps) => (
  <LayoutStable 
    className={cn("relative", className)} 
    minHeight="350px"
    {...props}
  >
    {children}
  </LayoutStable>
);