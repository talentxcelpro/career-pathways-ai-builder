import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWebVitals } from '@/hooks/useWebVitals';

interface PerformanceMonitorProps {
  children: React.ReactNode;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ children }) => {
  const { metrics } = useWebVitals();
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const sendMetrics = async () => {
      if (!metrics.lcp && !metrics.fid && !metrics.cls) return;

      try {
        // Get connection info
        let connectionType = 'unknown';
        let deviceMemory: number | undefined;
        
        if ('connection' in navigator) {
          connectionType = (navigator as any).connection?.effectiveType || 'unknown';
        }
        
        if ('deviceMemory' in navigator) {
          deviceMemory = (navigator as any).deviceMemory;
        }

        // Send to Supabase
        await supabase
          .from('performance_metrics')
          .insert({
            session_id: sessionId,
            page_url: window.location.pathname,
            lcp: metrics.lcp,
            fid: metrics.fid,
            cls: metrics.cls,
            fcp: metrics.fcp,
            ttfb: metrics.ttfb,
            inp: metrics.inp,
            connection_type: connectionType,
            device_memory: deviceMemory
          });

        // Send to Google Analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'web_vitals', {
            custom_parameter_1: 'performance',
            lcp: metrics.lcp ? Math.round(metrics.lcp) : null,
            fid: metrics.fid ? Math.round(metrics.fid) : null,
            cls: metrics.cls ? Math.round(metrics.cls * 1000) / 1000 : null,
            ttfb: metrics.ttfb ? Math.round(metrics.ttfb) : null
          });
        }
      } catch (error) {
        console.warn('Failed to send performance metrics:', error);
      }
    };

    // Send metrics after 3 seconds to allow for measurement
    const timer = setTimeout(sendMetrics, 3000);
    return () => clearTimeout(timer);
  }, [metrics, sessionId]);

  return <>{children}</>;
};