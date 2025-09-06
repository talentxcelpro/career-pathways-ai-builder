import React from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  includeTop?: boolean;
  includeBottom?: boolean;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  className,
  includeTop = true,
  includeBottom = true,
}) => {
  return (
    <div 
      className={cn(className)}
      style={{
        paddingTop: includeTop ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: includeBottom ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      {children}
    </div>
  );
};