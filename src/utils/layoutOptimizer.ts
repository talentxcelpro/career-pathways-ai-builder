import React from 'react';

// Simple component wrapper for stable rendering
interface StableContainerProps {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
}

export const StableContainer: React.FC<StableContainerProps> = ({ 
  children, 
  minHeight = '200px', 
  className = '' 
}) => {
  const style: React.CSSProperties = {
    minHeight,
    contain: 'layout style paint' as any,
    contentVisibility: 'auto' as any,
  };

  return React.createElement(
    'div',
    { className: `lazy-container ${className}`, style },
    children
  );
};