import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNetworkRealtime, useJobsRealtime, useLearningRealtime, useAdminRealtime, useEmployerRealtime } from '@/hooks/useRealtimeData';
import { useToast } from '@/hooks/use-toast';
import { useNotificationStore } from '@/stores/useNotificationStore';

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'auth_required';
  enableNotifications: boolean;
  setEnableNotifications: (enabled: boolean) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within RealtimeProvider');
  }
  return context;
}

interface RealtimeProviderProps {
  children: React.ReactNode;
  userId?: string;
  isAdmin?: boolean;
  isEmployer?: boolean;
}

export function RealtimeProvider({ 
  children, 
  userId, 
  isAdmin = false, 
  isEmployer = false 
}: RealtimeProviderProps) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error' | 'auth_required'>('auth_required');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const { toast } = useToast();
  const { soundEnabled } = useNotificationStore();

  // Only set up subscriptions if user is authenticated
  const isAuthenticated = !!userId;

  console.log('RealtimeProvider state:', { 
    userId, 
    isAuthenticated, 
    isAdmin, 
    isEmployer, 
    connectionStatus 
  });

  // Global realtime handlers
  const handleNetworkUpdate = (payload: any) => {
    if (!enableNotifications || !soundEnabled) return;
    
    if (payload.eventType === 'INSERT' && payload.table === 'posts') {
      // New post notification logic can be added here
    }
  };

  const handleJobUpdate = (payload: any) => {
    if (!enableNotifications || !soundEnabled) return;
    
    if (payload.eventType === 'INSERT' && payload.table === 'jobs') {
      toast({
        title: "New Job Posted",
        description: "A new job matching your preferences is available",
      });
    }
  };

  const handleApplicationUpdate = (payload: any) => {
    if (!enableNotifications || !isEmployer || !soundEnabled) return;
    
    if (payload.eventType === 'INSERT') {
      toast({
        title: "New Application",
        description: "You received a new job application",
      });
    }
  };

  const handleLearningUpdate = (payload: any) => {
    if (!enableNotifications || !soundEnabled) return;
    // Learning progress notifications
  };

  const handleAdminUpdate = (payload: any) => {
    if (!enableNotifications || !isAdmin || !soundEnabled) return;
    
    if (payload.table === 'employer_requests' && payload.eventType === 'INSERT') {
      toast({
        title: "New Employer Request",
        description: "A new employer registration request needs review",
        variant: "default"
      });
    }
  };

  // Set up realtime subscriptions only when authenticated
  const networkRealtime = useNetworkRealtime(
    isAuthenticated ? handleNetworkUpdate : () => {}, 
    isAuthenticated ? handleNetworkUpdate : () => {}
  );
  const jobsRealtime = useJobsRealtime(
    isAuthenticated ? handleJobUpdate : () => {}, 
    isAuthenticated ? handleApplicationUpdate : () => {}
  );
  const learningRealtime = useLearningRealtime(
    isAuthenticated ? handleLearningUpdate : () => {}, 
    isAuthenticated ? handleLearningUpdate : () => {}
  );
  
  // Conditionally enable employer and admin subscriptions
  const employerRealtime = useEmployerRealtime(
    userId || '', 
    isEmployer && isAuthenticated ? handleApplicationUpdate : () => {}, 
    isEmployer && isAuthenticated ? handleJobUpdate : () => {}
  );
     
  const adminRealtime = useAdminRealtime(
    isAdmin && isAuthenticated ? handleAdminUpdate : () => {}, 
    isAdmin && isAuthenticated ? handleAdminUpdate : () => {}, 
    isAdmin && isAuthenticated ? handleAdminUpdate : () => {}
  );

  // Update connection status based on authentication and subscriptions
  useEffect(() => {
    if (!isAuthenticated) {
      setConnectionStatus('auth_required');
      console.log('Realtime: Authentication required');
      return;
    }

    const allStatuses = [
      networkRealtime.connectionStatus,
      jobsRealtime.connectionStatus,
      learningRealtime.connectionStatus,
      employerRealtime.connectionStatus,
      adminRealtime.connectionStatus
    ];

    const allConnected = allStatuses.every(status => status === 'connected');
    const anyError = allStatuses.some(status => status === 'error');
    const anyConnecting = allStatuses.some(status => status === 'connecting');

    console.log('Realtime status update:', {
      allStatuses,
      allConnected,
      anyError,
      anyConnecting,
      isAuthenticated
    });

    if (anyError) {
      setConnectionStatus('error');
    } else if (allConnected) {
      setConnectionStatus('connected');
    } else if (anyConnecting) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [
    isAuthenticated,
    networkRealtime.connectionStatus, 
    jobsRealtime.connectionStatus, 
    learningRealtime.connectionStatus,
    employerRealtime.connectionStatus,
    adminRealtime.connectionStatus
  ]);

  const value: RealtimeContextType = {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    enableNotifications,
    setEnableNotifications
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}