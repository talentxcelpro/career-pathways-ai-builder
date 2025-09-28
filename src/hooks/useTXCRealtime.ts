import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface TXCUserPresence {
  user_id: string;
  username: string;
  avatar_url?: string;
  balance: number;
  activity: 'mining' | 'shopping' | 'idle';
  last_seen: string;
}

interface TXCTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  username?: string;
}

export const useTXCRealtime = () => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<TXCUserPresence[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TXCTransaction[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const updateUserPresence = useCallback(async (activity: 'mining' | 'shopping' | 'idle', balance: number) => {
    if (!channel) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, profile_picture_url')
      .eq('id', user.id)
      .single();

    const presence: TXCUserPresence = {
      user_id: user.id,
      username: profile?.full_name || 'Anonymous',
      avatar_url: profile?.profile_picture_url,
      balance,
      activity,
      last_seen: new Date().toISOString()
    };

    await channel.track(presence);
  }, [channel]);

  const broadcastTransaction = useCallback(async (transaction: Omit<TXCTransaction, 'username'>) => {
    if (!channel) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', transaction.user_id)
      .single();

    const transactionWithUsername = {
      ...transaction,
      username: profile?.full_name || 'Anonymous'
    };

    await channel.send({
      type: 'broadcast',
      event: 'txc_transaction',
      payload: transactionWithUsername
    });
  }, [channel]);

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    const initializeRealtime = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('TXC Realtime: No authenticated user');
          setIsConnected(false);
          return;
        }

        const txcChannel = supabase.channel('txc_global', {
          config: {
            presence: {
              key: user.id
            }
          }
        });

      // Handle presence changes
      txcChannel
        .on('presence', { event: 'sync' }, () => {
          const newState = txcChannel.presenceState();
          const users = Object.values(newState).flat() as unknown as TXCUserPresence[];
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          const joinedUsers = newPresences as unknown as TXCUserPresence[];
          joinedUsers.forEach(presenceUser => {
            if (presenceUser.user_id !== user.id) {
              toast.success(`${presenceUser.username} joined TXC activities`);
            }
          });
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          const leftUsers = leftPresences as unknown as TXCUserPresence[];
          leftUsers.forEach(presenceUser => {
            if (presenceUser.user_id !== user.id) {
              toast.info(`${presenceUser.username} left TXC activities`);
            }
          });
        });

      // Handle transaction broadcasts
      txcChannel
        .on('broadcast', { event: 'txc_transaction' }, ({ payload }) => {
          const transaction = payload as TXCTransaction;
          setRecentTransactions(prev => [transaction, ...prev.slice(0, 9)]);
          
          // Show toast for significant transactions
          if (Math.abs(transaction.amount) >= 1000) {
            const action = transaction.amount > 0 ? 'earned' : 'spent';
            toast.info(`${transaction.username} ${action} ${Math.abs(transaction.amount)} TXC`);
          }
        });

      // Subscribe to database changes
      txcChannel
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'txc_transactions' }, 
          (payload) => {
            console.log('New TXC transaction:', payload.new);
          }
        );

        txcChannel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setChannel(txcChannel);
            
            // Set initial presence
            await updateUserPresence('idle', 0);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            // Don't show error toast for every connection issue
            console.warn('TXC realtime connection issue');
          }
        });

        cleanup = () => {
          setIsConnected(false);
          setChannel(null);
          supabase.removeChannel(txcChannel);
        };
      } catch (error) {
        console.warn('Error initializing TXC realtime:', error);
        setIsConnected(false);
      }
    };

    initializeRealtime();
    
    return () => {
      cleanup?.();
    };
  }, []); // Removed updateUserPresence dependency to prevent re-initialization loops

  return {
    onlineUsers,
    recentTransactions,
    isConnected,
    updateUserPresence,
    broadcastTransaction
  };
};