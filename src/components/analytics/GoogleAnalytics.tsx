
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleCareerAnalyticsProps {
  measurementId?: string;
}

export const GoogleCareerAnalytics: React.FC<GoogleCareerAnalyticsProps> = ({ 
  measurementId = 'G-XXXXXXXXXX' // Replace with your actual GA4 Measurement ID
}) => {
  const location = useLocation();

  useEffect(() => {
    // Only load if measurement ID is provided and not placeholder
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      console.log('Google CareerAnalytics: Measurement ID not configured');
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Load Google CareerAnalytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Configure Google CareerAnalytics
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('Google CareerAnalytics initialized with ID:', measurementId);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="${measurementId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [measurementId]);

  // Track page views on route changes
  useEffect(() => {
    if (window.gtag && measurementId && measurementId !== 'G-XXXXXXXXXX') {
      window.gtag('config', measurementId, {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
      
      // Track page view event
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    }
  }, [location, measurementId]);

  return null;
};




