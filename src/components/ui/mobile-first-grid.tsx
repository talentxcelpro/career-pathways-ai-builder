import React from 'react';
import { cn } from '@/lib/utils';

interface MobileFirstGridProps {
  children: React.ReactNode;
  className?: string;
  mobileColumns?: 1 | 2;
  tabletColumns?: 1 | 2 | 3 | 4;
  desktopColumns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const MobileFirstGrid: React.FC<MobileFirstGridProps> = ({
  children,
  className,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  gap = 'md'
}) => {
  const getColumnClass = () => {
    const mobile = `grid-cols-${mobileColumns}`;
    const tablet = `sm:grid-cols-${tabletColumns}`;
    const desktop = `lg:grid-cols-${desktopColumns}`;
    return `${mobile} ${tablet} ${desktop}`;
  };

  const getGapClass = () => {
    switch (gap) {
      case 'xs': return 'gap-1 sm:gap-2';
      case 'sm': return 'gap-2 sm:gap-3';
      case 'md': return 'gap-3 sm:gap-4';
      case 'lg': return 'gap-4 sm:gap-6';
      case 'xl': return 'gap-6 sm:gap-8';
      default: return 'gap-3 sm:gap-4';
    }
  };

  return (
    <div 
      className={cn(
        "grid",
        getColumnClass(),
        getGapClass(),
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileFirstFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  mobileDirection?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export const MobileFirstFlex: React.FC<MobileFirstFlexProps> = ({
  children,
  className,
  direction = 'column',
  mobileDirection,
  gap = 'md',
  align = 'start',
  justify = 'start'
}) => {
  const getDirectionClass = () => {
    const mobile = mobileDirection ? `flex-${mobileDirection}` : `flex-${direction}`;
    const desktop = mobileDirection ? `sm:flex-${direction}` : '';
    return `${mobile} ${desktop}`.trim();
  };

  const getGapClass = () => {
    switch (gap) {
      case 'xs': return 'gap-1 sm:gap-2';
      case 'sm': return 'gap-2 sm:gap-3';
      case 'md': return 'gap-3 sm:gap-4';
      case 'lg': return 'gap-4 sm:gap-6';
      case 'xl': return 'gap-6 sm:gap-8';
      default: return 'gap-3 sm:gap-4';
    }
  };

  const getAlignClass = () => {
    switch (align) {
      case 'start': return 'items-start';
      case 'center': return 'items-center';
      case 'end': return 'items-end';
      case 'stretch': return 'items-stretch';
      default: return 'items-start';
    }
  };

  const getJustifyClass = () => {
    switch (justify) {
      case 'start': return 'justify-start';
      case 'center': return 'justify-center';
      case 'end': return 'justify-end';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      case 'evenly': return 'justify-evenly';
      default: return 'justify-start';
    }
  };

  return (
    <div 
      className={cn(
        "flex",
        getDirectionClass(),
        getGapClass(),
        getAlignClass(),
        getJustifyClass(),
        className
      )}
    >
      {children}
    </div>
  );
};