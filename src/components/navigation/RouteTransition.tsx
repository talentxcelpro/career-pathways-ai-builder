import React from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RouteTransition component that wraps the active route.
 * Re-keys on route change to trigger a hardware-accelerated 60fps
 * fade + subtle slide transition without white flash or layout shift.
 */
export const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="flex-1 w-full max-w-full flex flex-col page-transition">
      {children}
    </div>
  );
};
