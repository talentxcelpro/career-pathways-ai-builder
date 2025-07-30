import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityContextType {
  logSecurityEvent: (eventType: string, description: string, metadata?: any) => Promise<void>;
  isSecureSession: boolean;
  sessionRisk: 'low' | 'medium' | 'high';
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isSecureSession, setIsSecureSession] = useState(true);
  const [sessionRisk, setSessionRisk] = useState<'low' | 'medium' | 'high'>('low');

  const logSecurityEvent = async (eventType: string, description: string, metadata: any = {}) => {
    if (!user) return;
    
    try {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_description: description,
        p_ip_address: null, // Would need to be captured on backend
        p_user_agent: navigator.userAgent,
        p_metadata: metadata
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Check session age
    const sessionAge = Date.now() - (user.created_at ? new Date(user.created_at).getTime() : 0);
    const isOldSession = sessionAge > 24 * 60 * 60 * 1000; // 24 hours

    // Basic risk assessment
    if (isOldSession) {
      setSessionRisk('medium');
      logSecurityEvent('session_age_warning', 'Long-running session detected');
    }

    // Monitor fetch requests with proper cleanup
    const monitorSecurity = () => {
      const startTime = Date.now();
      let requestCount = 0;

      const originalFetch = window.fetch;

      const secureFetch: typeof window.fetch = async (...args) => {
        // Skip monitoring for Supabase Edge Function calls to prevent blocking
        const url = args[0]?.toString() || '';
        if (!url.includes('supabase.co/functions')) {
          requestCount++;
          
          if (requestCount > 50 && Date.now() - startTime < 60000) {
            setSessionRisk('high');
            logSecurityEvent('suspicious_activity', 'High request rate detected', {
              requests: requestCount,
              timeframe: '1 minute'
            });
          }
        }

        try {
          return await originalFetch(...args);
        } catch (error) {
          console.error('🔐 SecurityProvider fetch error:', error);
          throw error;
        }
      };

      // Apply override
      window.fetch = secureFetch;

      // Return cleanup function
      return () => {
        window.fetch = originalFetch;
      };
    };

    const cleanup = monitorSecurity();

    // Cleanup
    return () => {
      if (cleanup) cleanup();
    };
  }, [user]);

  const value: SecurityContextType = {
    logSecurityEvent,
    isSecureSession,
    sessionRisk
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};