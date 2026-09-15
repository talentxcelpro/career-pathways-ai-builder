
import React, { createContext, useContext, ReactNode } from 'react';

interface CareerAnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackPageView: (pageName: string, properties?: Record<string, any>) => void;
}

const CareerAnalyticsContext = createContext<CareerAnalyticsContextType | undefined>(undefined);

interface CareerAnalyticsProviderProps {
  children: ReactNode;
}

export const CareerAnalyticsProvider: React.FC<CareerAnalyticsProviderProps> = ({ children }) => {
  // Safe environment variable check for browser
  const isDevelopment = import.meta.env?.DEV || false;
  
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (isDevelopment) {
      console.log('CareerAnalytics Event:', eventName, properties);
    }
    // In production, this would integrate with actual CareerAnalytics service
  };

  const trackPageView = (pageName: string, properties?: Record<string, any>) => {
    if (isDevelopment) {
      console.log('CareerAnalytics Page View:', pageName, properties);
    }
    // In production, this would integrate with actual CareerAnalytics service
  };

  return (
    <CareerAnalyticsContext.Provider value={{ trackEvent, trackPageView }}>
      {children}
    </CareerAnalyticsContext.Provider>
  );
};

export const useCareerAnalytics = () => {
  const context = useContext(CareerAnalyticsContext);
  if (context === undefined) {
    throw new Error('useCareerAnalytics must be used within an CareerAnalyticsProvider');
  }
  return context;
};




