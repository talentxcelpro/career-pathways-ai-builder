import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TXCTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  activity_type?: string;
  source?: string;
}

export const TXCTransactionMonitor: React.FC = () => {
  const { user } = useAuth();
  const [recentTransactions, setRecentTransactions] = useState<TXCTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchRecentTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('txc_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching transactions:', error);
          return;
        }

        setRecentTransactions(data || []);
        
        // Check for suspicious patterns
        if (data && data.length > 0) {
          const lastHour = new Date(Date.now() - 60 * 60 * 1000);
          const recentCount = data.filter(tx => 
            new Date(tx.created_at) > lastHour
          ).length;
          
          setSuspiciousActivity(recentCount > 10); // More than 10 transactions in an hour
        }
      } catch (error) {
        console.error('Error in transaction monitoring:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentTransactions();

    // Set up real-time monitoring
    const channel = supabase
      .channel(`txc_transactions:${user.id}`)
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
          fetchRecentTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'spent':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'transferred':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTransactionVariant = (type: string) => {
    switch (type) {
      case 'earned':
        return 'default';
      case 'spent':
        return 'destructive';
      case 'transferred':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!user) return null;
  if (isLoading) return <div className="animate-pulse">Loading transaction history...</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Transaction Monitor
          {suspiciousActivity && (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {suspiciousActivity && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                High transaction activity detected. Your account is being monitored for security.
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent transactions
            </p>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                    {transaction.activity_type && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {transaction.activity_type}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant={getTransactionVariant(transaction.transaction_type)}>
                    {transaction.transaction_type === 'earned' ? '+' : '-'}
                    {transaction.amount} TXC
                  </Badge>
                  {transaction.source && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.source}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};