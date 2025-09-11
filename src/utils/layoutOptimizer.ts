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
    // Removed problematic contain and contentVisibility properties
  };

  return React.createElement(
    'div',
    { className: `lazy-container ${className}`, style },
    children
  );
};