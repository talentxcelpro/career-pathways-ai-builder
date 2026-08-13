import React, { useEffect } from 'react';

export const LaunchAnalytics: React.FC = () => {
  useEffect(() => {
    // Initialize Google Analytics 4
    if (!import.meta.env.DEV) {
      // Load GA4 script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // Replace with actual GA4 ID
      document.head.appendChild(script);

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', { // Replace with actual GA4 ID
        page_title: document.title,
        page_location: window.location.href,
        custom_parameter: 'launch_ready'
      });

      // Track launch readiness events
      gtag('event', 'app_launch_ready', {
        event_category: 'deployment',
        event_label: 'production_ready',
        value: 1
      });

      // Track user engagement
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }

    // Development analytics
    if (import.meta.env.DEV) {
      console.log('🎯 Analytics initialized for development');
      
      // Mock analytics for development
      window.gtag = (command: string, targetId: string, config?: any) => {
        console.log('📊 Analytics Event:', { command, targetId, config });
      };
    }
  }, []);

  return null; // This component doesn't render anything
};