import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTXCTokenStats } from '@/hooks/useTXCData';
import { Hexagon, TrendingUp, Users, Zap, Activity, DollarSign } from 'lucide-react';

export const BlockchainStats: React.FC = () => {
  const { data: tokenStats, isLoading } = useTXCTokenStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hexagon className="h-5 w-5" />
            TXC Blockchain Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hexagon className="h-5 w-5 text-primary" />
          TXC Blockchain Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3 mx-auto">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {tokenStats?.circulatingSupply?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">TXC in Circulation</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-full mb-3 mx-auto">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-2xl font-bold text-secondary">
              {tokenStats?.totalHolders?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">Token Holders</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-accent/10 rounded-full mb-3 mx-auto">
              <Activity className="h-6 w-6 text-accent" />
            </div>
            <div className="text-2xl font-bold text-accent">
              {tokenStats?.dailyTransactions?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">Daily Transactions</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full mb-3 mx-auto">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">
              {tokenStats?.avgBalance?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Balance</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium">Network Activity</span>
            </div>
            <div className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              +{tokenStats?.weeklyGrowth || 0}% this week
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};