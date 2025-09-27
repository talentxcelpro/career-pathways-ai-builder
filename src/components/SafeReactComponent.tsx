import React from 'react';

interface SafeReactComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SafeReactComponent: React.FC<SafeReactComponentProps> = ({ 
  children, 
  fallback = <div>Loading...</div> 
}) => {
  // Check if React dispatcher is available
  try {
    // Try to access React's internal dispatcher
    const ReactInternals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (!ReactInternals?.ReactCurrentDispatcher?.current) {
      console.warn('React dispatcher not available, showing fallback');
      return <>{fallback}</>;
    }
    
    return <>{children}</>;
  } catch (error) {
    console.warn('React dispatcher check failed:', error);
    return <>{fallback}</>;
  }
};