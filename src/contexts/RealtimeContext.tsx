import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNetworkRealtime, useJobsRealtime, useLearningRealtime, useAdminRealtime, useEmployerRealtime } from '@/hooks/useRealtimeData';
import { useToast } from '@/hooks/use-toast';

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const { toast } = useToast();

  // Global realtime handlers
  const handleNetworkUpdate = (payload: any) => {
    if (!enableNotifications) return;
    
    if (payload.eventType === 'INSERT' && payload.table === 'posts') {
      // New post notification logic can be added here
    }
  };

  const handleJobUpdate = (payload: any) => {
    if (!enableNotifications) return;
    
    if (payload.eventType === 'INSERT' && payload.table === 'jobs') {
      toast({
        title: "New Job Posted",
        description: "A new job matching your preferences is available",
      });
    }
  };

  const handleApplicationUpdate = (payload: any) => {
    if (!enableNotifications || !isEmployer) return;
    
    if (payload.eventType === 'INSERT') {
      toast({
        title: "New Application",
        description: "You received a new job application",
      });
    }
  };

  const handleLearningUpdate = (payload: any) => {
    if (!enableNotifications) return;
    // Learning progress notifications
  };

  const handleAdminUpdate = (payload: any) => {
    if (!enableNotifications || !isAdmin) return;
    
    if (payload.table === 'employer_requests' && payload.eventType === 'INSERT') {
      toast({
        title: "New Employer Request",
        description: "A new employer registration request needs review",
        variant: "default"
      });
    }
  };

  // Set up realtime subscriptions
  const networkRealtime = useNetworkRealtime(handleNetworkUpdate, handleNetworkUpdate);
  const jobsRealtime = useJobsRealtime(handleJobUpdate, handleApplicationUpdate);
  const learningRealtime = useLearningRealtime(handleLearningUpdate, handleLearningUpdate);
  
  // Only subscribe to employer/admin realtime if user has those roles
  const employerRealtime = isEmployer && userId ?
    useEmployerRealtime(userId, handleApplicationUpdate, handleJobUpdate) : 
    { isConnected: true };
    
  const adminRealtime = isAdmin ? 
    useAdminRealtime(handleAdminUpdate, handleAdminUpdate, handleAdminUpdate) : 
    { isConnected: true };

  // Update connection status based on all subscriptions
  useEffect(() => {
    const allConnected = networkRealtime.isConnected && 
                        jobsRealtime.isConnected && 
                        learningRealtime.isConnected &&
                        employerRealtime.isConnected &&
                        adminRealtime.isConnected;

    if (allConnected) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('connecting');
    }
  }, [
    networkRealtime.isConnected, 
    jobsRealtime.isConnected, 
    learningRealtime.isConnected,
    employerRealtime.isConnected,
    adminRealtime.isConnected
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