import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Zap, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatTXC } from '@/types/txc-pricing';

interface LeaderboardUser {
  user_id: string;
  full_name: string;
  profile_picture_url?: string;
  balance: number;
  total_earned: number;
  transactions_count: number;
  rank: number;
}

interface LeaderboardProps {
  className?: string;
}

export const TXCLeaderboard: React.FC<LeaderboardProps> = ({ className = '' }) => {
  const [balanceLeaders, setBalanceLeaders] = useState<LeaderboardUser[]>([]);
  const [earningsLeaders, setEarningsLeaders] = useState<LeaderboardUser[]>([]);
  const [activityLeaders, setActivityLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
    
    // Set up real-time subscription for balance updates
    const channel = supabase
      .channel('leaderboard_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_txc_balances' }, 
        () => {
          fetchLeaderboards();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch balance leaderboard
      const { data: balanceData } = await supabase
        .from('user_txc_balances')
        .select(`
          user_id,
          balance,
          total_earned,
          profiles!inner(full_name, profile_picture_url)
        `)
        .order('balance', { ascending: false })
        .limit(10);

      // Fetch earnings leaderboard
      const { data: earningsData } = await supabase
        .from('user_txc_balances')
        .select(`
          user_id,
          balance,
          total_earned,
          profiles!inner(full_name, profile_picture_url)
        `)
        .order('total_earned', { ascending: false })
        .limit(10);

      // Fetch activity leaderboard (transaction count)
      const { data: activityData } = await supabase
        .rpc('get_txc_activity_leaderboard');

      if (balanceData) {
        const formattedBalance = balanceData.map((item, index) => ({
          user_id: item.user_id,
          full_name: item.profiles.full_name || 'Anonymous',
          profile_picture_url: item.profiles.profile_picture_url,
          balance: item.balance,
          total_earned: item.total_earned,
          transactions_count: 0,
          rank: index + 1
        }));
        setBalanceLeaders(formattedBalance);
      }

      if (earningsData) {
        const formattedEarnings = earningsData.map((item, index) => ({
          user_id: item.user_id,
          full_name: item.profiles.full_name || 'Anonymous',
          profile_picture_url: item.profiles.profile_picture_url,
          balance: item.balance,
          total_earned: item.total_earned,
          transactions_count: 0,
          rank: index + 1
        }));
        setEarningsLeaders(formattedEarnings);
      }

      if (activityData) {
        setActivityLeaders(activityData.map((item: any, index: number) => ({
          ...item,
          rank: index + 1
        })));
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  const renderLeaderboardList = (users: LeaderboardUser[], metric: 'balance' | 'total_earned' | 'transactions_count') => (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.user_id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(user.rank)}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profile_picture_url} />
              <AvatarFallback>
                {user.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {metric === 'balance' && `Current Balance`}
                {metric === 'total_earned' && `Total Earned`}
                {metric === 'transactions_count' && `Transactions`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="font-mono">
              {metric === 'transactions_count' 
                ? `${user.transactions_count} txns`
                : formatTXC(user[metric])
              }
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            TXC Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted animate-pulse">
                <div className="w-8 h-8 bg-muted-foreground/20 rounded" />
                <div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
                <div className="flex-1">
                  <div className="w-24 h-4 bg-muted-foreground/20 rounded mb-1" />
                  <div className="w-16 h-3 bg-muted-foreground/20 rounded" />
                </div>
                <div className="w-16 h-6 bg-muted-foreground/20 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          TXC Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Balance
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="balance" className="mt-4">
            {renderLeaderboardList(balanceLeaders, 'balance')}
          </TabsContent>
          
          <TabsContent value="earnings" className="mt-4">
            {renderLeaderboardList(earningsLeaders, 'total_earned')}
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4">
            {renderLeaderboardList(activityLeaders, 'transactions_count')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};