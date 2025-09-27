import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityOrchestrator {
  monitoring: {
    isActive: boolean;
    eventsDetected: number;
    lastEventTime?: string;
  };
  incidents: {
    activeCount: number;
    criticalCount: number;
    resolvedToday: number;
  };
  performance: {
    systemHealth: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    errorRate: number;
  };
  readiness: {
    score: number;
    criticalIssues: number;
    lastCheck?: string;
  };
}

export const useSecurityOrchestrator = () => {
  const { user } = useAuth();
  const [orchestrator, setOrchestrator] = useState<SecurityOrchestrator>({
    monitoring: {
      isActive: false,
      eventsDetected: 0
    },
    incidents: {
      activeCount: 0,
      criticalCount: 0,
      resolvedToday: 0
    },
    performance: {
      systemHealth: 'healthy',
      responseTime: 0,
      errorRate: 0
    },
    readiness: {
      score: 0,
      criticalIssues: 0
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize security orchestrator
  const initializeOrchestrator = useCallback(async () => {
    try {
      // Initialize monitoring
      const { data: securityEvents, error: eventsError } = await supabase
        .from('security_events')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Initialize performance monitoring
      const startTime = performance.now();
      const { data: healthCheck } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      const responseTime = performance.now() - startTime;

      // Calculate initial metrics
      const eventsToday = securityEvents?.filter(event => 
        new Date(event.created_at).toDateString() === new Date().toDateString()
      ).length || 0;

      setOrchestrator(prev => ({
        ...prev,
        monitoring: {
          isActive: true,
          eventsDetected: eventsToday,
          lastEventTime: securityEvents?.[0]?.created_at
        },
        performance: {
          systemHealth: responseTime < 500 ? 'healthy' : responseTime < 1000 ? 'warning' : 'critical',
          responseTime,
          errorRate: eventsError ? 5 : 0.1
        }
      }));

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize security orchestrator:', error);
    }
  }, []);

  // Start real-time monitoring
  const startMonitoring = useCallback(() => {
    if (!user || !isInitialized) return;

    const channel = supabase
      .channel('security-orchestrator')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'security_events' },
        (payload) => {
          setOrchestrator(prev => ({
            ...prev,
            monitoring: {
              ...prev.monitoring,
              eventsDetected: prev.monitoring.eventsDetected + 1,
              lastEventTime: payload.new.created_at
            }
          }));

          // Auto-escalate critical events
          if (payload.new.metadata?.severity === 'critical') {
            setOrchestrator(prev => ({
              ...prev,
              incidents: {
                ...prev.incidents,
                criticalCount: prev.incidents.criticalCount + 1,
                activeCount: prev.incidents.activeCount + 1
              }
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_activity_log' },
        (payload) => {
          // Track admin activities for security monitoring
          console.log('Admin activity detected:', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isInitialized]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setOrchestrator(prev => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        isActive: false
      }
    }));
  }, []);

  // Log security event
  const logSecurityEvent = useCallback(async (
    eventType: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: any
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: user.id,
          event_type: eventType,
          description,
          metadata: {
            severity,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        });

      if (error) throw error;

      // Update local state
      setOrchestrator(prev => ({
        ...prev,
        monitoring: {
          ...prev.monitoring,
          eventsDetected: prev.monitoring.eventsDetected + 1,
          lastEventTime: new Date().toISOString()
        }
      }));

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user]);

  // Update system performance metrics
  const updatePerformanceMetrics = useCallback((metrics: {
    responseTime?: number;
    errorRate?: number;
    systemHealth?: 'healthy' | 'warning' | 'critical';
  }) => {
    setOrchestrator(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        ...metrics
      }
    }));
  }, []);

  // Update readiness score
  const updateReadinessScore = useCallback((score: number, criticalIssues: number) => {
    setOrchestrator(prev => ({
      ...prev,
      readiness: {
        score,
        criticalIssues,
        lastCheck: new Date().toISOString()
      }
    }));
  }, []);

  // Resolve incident
  const resolveIncident = useCallback((incidentId: string, type: 'resolved' | 'false_positive') => {
    setOrchestrator(prev => ({
      ...prev,
      incidents: {
        ...prev.incidents,
        activeCount: Math.max(0, prev.incidents.activeCount - 1),
        criticalCount: type === 'resolved' ? Math.max(0, prev.incidents.criticalCount - 1) : prev.incidents.criticalCount,
        resolvedToday: prev.incidents.resolvedToday + 1
      }
    }));
  }, []);

  // Get overall security status
  const getSecurityStatus = useCallback(() => {
    const { performance, incidents, readiness } = orchestrator;
    
    if (incidents.criticalCount > 0 || performance.systemHealth === 'critical' || readiness.criticalIssues > 0) {
      return 'critical';
    }
    
    if (incidents.activeCount > 5 || performance.systemHealth === 'warning' || readiness.score < 85) {
      return 'warning';
    }
    
    return 'healthy';
  }, [orchestrator]);

  // Auto-start monitoring when user is available
  useEffect(() => {
    if (user && !isInitialized) {
      initializeOrchestrator();
    }
  }, [user, isInitialized, initializeOrchestrator]);

  return {
    orchestrator,
    isInitialized,
    initializeOrchestrator,
    startMonitoring,
    stopMonitoring,
    logSecurityEvent,
    updatePerformanceMetrics,
    updateReadinessScore,
    resolveIncident,
    getSecurityStatus
  };
};