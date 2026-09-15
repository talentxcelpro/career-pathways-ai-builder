
import React, { createContext, useContext, ReactNode } from 'react';

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (pageName: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Safe environment variable check for browser
  const isDevelopment = import.meta.env?.DEV || false;
  
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (isDevelopment) {
      console.log('Analytics Event:', eventName, properties);
    }
    // In production, this would integrate with actual analytics service
  };

  const trackPageView = (pageName: string, properties?: Record<string, any>) => {
    if (isDevelopment) {
      console.log('Analytics Page View:', pageName, properties);
    }
    // In production, this would integrate with actual analytics service
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackPageView }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
