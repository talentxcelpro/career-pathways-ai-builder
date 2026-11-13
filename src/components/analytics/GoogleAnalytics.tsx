import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ 
  measurementId = 'G-XXXXXXXXXX'
}) => {
  const location = useLocation();
  const lastTrackedPathRef = useRef<string>('');

  useEffect(() => {
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };
    }

    // Check if script already exists to avoid duplicate script injection loops
    const scriptId = `ga-script-${measurementId}`;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.gtag('js', new Date());
      // Prevent automatic page_view firing on config so SPA page_views are not duplicated
      window.gtag('config', measurementId, {
        send_page_view: false
      });
    }
  }, [measurementId]);

  // Track page views on route changes with strict deduplication to prevent event storms / loops
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag || !measurementId || measurementId === 'G-XXXXXXXXXX') {
      return;
    }

    const currentPath = location.pathname + location.search;
    // Suppress loop / duplicate tracking for identical paths
    if (lastTrackedPathRef.current === currentPath) {
      return;
    }
    lastTrackedPathRef.current = currentPath;

    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: currentPath,
    });
  }, [location.pathname, location.search, measurementId]);

  return null;
};
