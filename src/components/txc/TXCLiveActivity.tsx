import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Activity, Users, Wifi, WifiOff, Clock, Coins } from 'lucide-react';
import { useTXCRealtime } from '@/hooks/useTXCRealtime';
import { formatTXC } from '@/types/txc-pricing';
import { formatDistanceToNow } from 'date-fns';

interface TXCLiveActivityProps {
  className?: string;
}

export const TXCLiveActivity: React.FC<TXCLiveActivityProps> = ({ className = '' }) => {
  const { onlineUsers, recentTransactions, isConnected } = useTXCRealtime();

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'mining':
        return '⛏️';
      case 'shopping':
        return '🛒';
      default:
        return '💤';
    }
  };

  const getActivityColor = (activity: string) => {
    switch (activity) {
      case 'mining':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'shopping':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Online Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Online Users
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <Badge variant="secondary">
                {onlineUsers.length} online
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {onlineUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users online</p>
                {!isConnected && (
                  <p className="text-sm mt-2">Connecting to real-time updates...</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getActivityColor(user.activity)}`}
                          >
                            {getActivityIcon(user.activity)} {user.activity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium">
                        {formatTXC(user.balance)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {recentTransactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent transactions</p>
                <p className="text-sm mt-2">Transaction activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="space-y-2">
                    <div className="flex items-start justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Coins className={`h-4 w-4 ${getTransactionColor(transaction.amount)}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {transaction.username || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-sm font-medium ${getTransactionColor(transaction.amount)}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatTXC(Math.abs(transaction.amount))}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.transaction_type}
                        </Badge>
                      </div>
                    </div>
                    {index < recentTransactions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};