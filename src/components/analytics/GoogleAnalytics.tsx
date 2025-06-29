
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ 
  measurementId = 'G-XXXXXXXXXX' // Replace with your actual GA4 Measurement ID
}) => {
  const location = useLocation();

  useEffect(() => {
    // Only load if measurement ID is provided and not placeholder
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      console.log('Google Analytics: Measurement ID not configured');
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Configure Google Analytics
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    console.log('Google Analytics initialized with ID:', measurementId);

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
