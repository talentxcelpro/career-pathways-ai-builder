
import React, { createContext, useContext, ReactNode } from 'react';

interface AnalyticsConfig {
  googleAnalyticsId?: string;
  searchConsoleVerification?: string;
  enableTracking: boolean;
}

interface AnalyticsContextType {
  config: AnalyticsConfig;
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackPurchase: (transactionId: string, value: number, currency?: string) => void;
  trackJobApplication: (jobId: string, jobTitle: string, companyName: string) => void;
  trackCourseEnrollment: (courseId: string, courseTitle: string, price?: number) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  config = {}
}) => {
  const analyticsConfig: AnalyticsConfig = {
    googleAnalyticsId: config.googleAnalyticsId || process.env.REACT_APP_GA_MEASUREMENT_ID,
    searchConsoleVerification: config.searchConsoleVerification || process.env.REACT_APP_GSC_VERIFICATION,
    enableTracking: config.enableTracking ?? true,
    ...config
  };

  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (!analyticsConfig.enableTracking || !window.gtag) return;
    
    window.gtag('event', eventName, parameters);
    console.log('Analytics Event:', eventName, parameters);
  };

  const trackPurchase = (transactionId: string, value: number, currency: string = 'INR') => {
    trackEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
    });
  };

  const trackJobApplication = (jobId: string, jobTitle: string, companyName: string) => {
    trackEvent('job_application', {
      job_id: jobId,
      job_title: jobTitle,
      company_name: companyName,
      event_category: 'engagement',
      event_label: `${jobTitle} at ${companyName}`,
    });
  };

  const trackCourseEnrollment = (courseId: string, courseTitle: string, price?: number) => {
    trackEvent('course_enrollment', {
      course_id: courseId,
      course_title: courseTitle,
      value: price || 0,
      currency: 'INR',
      event_category: 'engagement',
      event_label: courseTitle,
    });
  };

  const contextValue: AnalyticsContextType = {
    config: analyticsConfig,
    trackEvent,
    trackPurchase,
    trackJobApplication,
    trackCourseEnrollment,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
