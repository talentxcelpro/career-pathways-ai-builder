import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TXCAnalytics {
  totalTransactions: number;
  totalEarned: number;
  totalSpent: number;
  averageTransactionSize: number;
  transactionFrequency: number;
  mostActiveHour: number;
  earningTrends: { hour: number; amount: number }[];
  spendingTrends: { hour: number; amount: number }[];
  topActivities: { activity: string; count: number; total: number }[];
}

interface RealtimeEvent {
  eventType: 'transaction' | 'balance_update' | 'rate_limit';
  data: any;
  timestamp: Date;
}

export const useTXCRealtimeAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<TXCAnalytics>({
    totalTransactions: 0,
    totalEarned: 0,
    totalSpent: 0,
    averageTransactionSize: 0,
    transactionFrequency: 0,
    mostActiveHour: 0,
    earningTrends: [],
    spendingTrends: [],
    topActivities: []
  });
  
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'disconnected'>('disconnected');

  const calculateAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get all transactions for analysis
      const { data: transactions, error } = await supabase
        .from('txc_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000); // Analyze last 1000 transactions

      if (error) {
        console.error('Error fetching analytics data:', error);
        return;
      }

      if (!transactions || transactions.length === 0) {
        return;
      }

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const recent = transactions.filter(t => new Date(t.created_at) > last24h);

      // Basic metrics
      const totalTransactions = transactions.length;
      const earned = transactions.filter(t => t.transaction_type === 'earned');
      const spent = transactions.filter(t => t.transaction_type === 'spent');
      
      const totalEarned = earned.reduce((sum, t) => sum + t.amount, 0);
      const totalSpent = spent.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const averageTransactionSize = totalTransactions > 0 
        ? (totalEarned + totalSpent) / totalTransactions 
        : 0;

      // Transaction frequency (transactions per hour in last 24h)
      const transactionFrequency = recent.length / 24;

      // Most active hour analysis
      const hourCounts = Array(24).fill(0);
      recent.forEach(t => {
        const hour = new Date(t.created_at).getHours();
        hourCounts[hour]++;
      });
      const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

      // Earning and spending trends by hour
      const earningTrends = Array(24).fill(0).map((_, hour) => ({
        hour,
        amount: earned
          .filter(t => new Date(t.created_at).getHours() === hour)
          .reduce((sum, t) => sum + t.amount, 0)
      }));

      const spendingTrends = Array(24).fill(0).map((_, hour) => ({
        hour,
        amount: spent
          .filter(t => new Date(t.created_at).getHours() === hour)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      }));

      // Top activities analysis
      const activityMap = new Map<string, { count: number; total: number }>();
      transactions.forEach(t => {
        const activity = t.activity_type || t.transaction_type;
        if (!activityMap.has(activity)) {
          activityMap.set(activity, { count: 0, total: 0 });
        }
        const current = activityMap.get(activity)!;
        current.count++;
        current.total += Math.abs(t.amount);
      });

      const topActivities = Array.from(activityMap.entries())
        .map(([activity, data]) => ({ activity, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setAnalytics({
        totalTransactions,
        totalEarned,
        totalSpent,
        averageTransactionSize,
        transactionFrequency,
        mostActiveHour,
        earningTrends,
        spendingTrends,
        topActivities
      });

    } catch (error) {
      console.error('Error calculating analytics:', error);
    }
  }, [user?.id]);

  const addRealtimeEvent = useCallback((eventType: RealtimeEvent['eventType'], data: any) => {
    const event: RealtimeEvent = {
      eventType,
      data,
      timestamp: new Date()
    };

    setRealtimeEvents(prev => {
      const newEvents = [event, ...prev.slice(0, 49)]; // Keep last 50 events
      return newEvents;
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    let heartbeatInterval: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const setupRealtimeConnection = () => {
      const channel = supabase
        .channel(`txc_analytics:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'txc_transactions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('TXC transaction update:', payload);
            addRealtimeEvent('transaction', payload);
            calculateAnalytics(); // Recalculate analytics on new transaction
            setConnectionHealth('healthy');
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_txc_balances',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('TXC balance update:', payload);
            addRealtimeEvent('balance_update', payload);
            setConnectionHealth('healthy');
          }
        )
        .subscribe((status, err) => {
          console.log('TXC Analytics subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setConnectionHealth('healthy');
            reconnectAttempts = 0;
            
            // Set up heartbeat to monitor connection health
            heartbeatInterval = setInterval(() => {
              // Simple heartbeat - if no events received recently, mark as degraded
              const lastEvent = realtimeEvents[0];
              if (lastEvent && Date.now() - lastEvent.timestamp.getTime() > 300000) { // 5 minutes
                setConnectionHealth('degraded');
              }
            }, 60000); // Check every minute
            
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setConnectionHealth('disconnected');
            
            // Attempt reconnection with exponential backoff
            if (reconnectAttempts < maxReconnectAttempts) {
              const delay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
              setTimeout(() => {
                reconnectAttempts++;
                console.log(`Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`);
                setupRealtimeConnection();
              }, delay);
            }
          }
          
          if (err) {
            console.error('TXC Analytics subscription error:', err);
            addRealtimeEvent('rate_limit', { error: err.message });
          }
        });

      return channel;
    };

    // Initial analytics calculation
    calculateAnalytics();
    
    // Setup realtime connection
    const channel = setupRealtimeConnection();

    return () => {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      supabase.removeChannel(channel);
      setIsConnected(false);
      setConnectionHealth('disconnected');
    };
  }, [user?.id, calculateAnalytics, addRealtimeEvent, realtimeEvents]);

  const getConnectionStatus = () => {
    if (!isConnected) return 'Disconnected';
    return connectionHealth === 'healthy' ? 'Connected' : 'Degraded';
  };

  const refreshAnalytics = useCallback(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  return {
    analytics,
    realtimeEvents,
    isConnected,
    connectionHealth,
    connectionStatus: getConnectionStatus(),
    refreshAnalytics
  };
};