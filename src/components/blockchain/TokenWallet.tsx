import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Coins, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Trophy,
  Gift,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TokenTransaction {
  id: string;
  transaction_type: 'earned' | 'spent' | 'bonus';
  amount: number;
  description: string;
  created_at: string;
  metadata?: any;
}

interface TokenBalance {
  balance: number;
  locked_balance: number;
  token_type: string;
}

export const TokenWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchTokenData();
    }
  }, [user?.id]);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      
      // Fetch balance from existing token_balances table
      const { data: balanceData, error: balanceError } = await supabase
        .from('token_balances')
        .select('*')
        .eq('user_id', user?.id)
        .eq('token_type', 'TXC')
        .single();
      
      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error('Balance error:', balanceError);
      } else if (balanceData) {
        setBalance(balanceData);
      } else {
        // Create initial balance for user
        const { data: newBalance, error: createError } = await supabase
          .from('token_balances')
          .insert({
            user_id: user?.id,
            balance: 100,
            locked_balance: 0,
            token_type: 'TXC'
          })
          .select()
          .single();
        
        if (!createError && newBalance) {
          setBalance(newBalance);
          
          // Create welcome transaction
          await supabase.from('token_transactions').insert({
            to_user_id: user?.id,
            transaction_type: 'reward', // Use 'reward' instead of 'earned'
            amount: 100,
            description: 'Welcome bonus - TXC tokens!',
            token_type: 'TXC',
            status: 'completed'
          });
        }
      }

      // Fetch recent transactions from existing token_transactions table
      const { data: transactionsData, error: txError } = await supabase
        .from('token_transactions')
        .select('*')
        .or(`to_user_id.eq.${user?.id},from_user_id.eq.${user?.id}`)
        .eq('token_type', 'TXC')
        .order('created_at', { ascending: false })
        .limit(20);

      if (txError) {
        console.error('Transactions error:', txError);
      } else if (transactionsData) {
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
      toast.error('Failed to load token data');
    } finally {
      setLoading(false);
    }
  };

  const claimDailyBonus = async () => {
    try {
      setClaiming(true);
      
      // Check if already claimed today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayBonus } = await supabase
        .from('token_transactions')
        .select('id')
        .eq('to_user_id', user?.id)
        .eq('transaction_type', 'reward') // Use 'reward' instead of 'earned'
        .eq('description', 'Daily login bonus')
        .gte('created_at', today + 'T00:00:00Z')
        .single();

      if (todayBonus) {
        toast.error('Daily bonus already claimed today!');
        return;
      }

      const bonusAmount = 50;
      
      // Create transaction
      const { error: txError } = await supabase
        .from('token_transactions')
        .insert({
          to_user_id: user?.id,
          transaction_type: 'reward', // Use 'reward' instead of 'earned'
          amount: bonusAmount,
          description: 'Daily login bonus',
          token_type: 'TXC',
          status: 'completed'
        });

      if (txError) throw txError;

      // Update balance
      const { error: balanceError } = await supabase
        .from('token_balances')
        .update({
          balance: (balance?.balance || 0) + bonusAmount
        })
        .eq('user_id', user?.id)
        .eq('token_type', 'TXC');

      if (balanceError) throw balanceError;

      toast.success(`Claimed ${bonusAmount} TXC tokens!`);
      fetchTokenData();
    } catch (error) {
      console.error('Error claiming bonus:', error);
      toast.error('Failed to claim daily bonus');
    } finally {
      setClaiming(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(balance?.balance || 0).toLocaleString()} TXC</div>
            <p className="text-xs text-muted-foreground">
              Ready to spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Tokens</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(balance?.locked_balance || 0).toLocaleString()} TXC</div>
            <p className="text-xs text-muted-foreground">
              Staked or pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((balance?.balance || 0) + (balance?.locked_balance || 0)).toLocaleString()} TXC</div>
            <p className="text-xs text-muted-foreground">
              Total tokens owned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Bonus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Daily Bonus
          </CardTitle>
          <CardDescription>
            Claim your daily TXC tokens for staying active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">50 TXC Available</p>
              <p className="text-sm text-muted-foreground">New bonus available daily</p>
            </div>
            <Button 
              onClick={claimDailyBonus} 
              disabled={claiming}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {claiming ? 'Claiming...' : 'Claim Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Usage */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="earning">Earning Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent TXC token activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No transactions yet. Start earning tokens by completing your profile!
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          tx.transaction_type === 'earned' ? 'bg-green-100 text-green-600' :
                          tx.transaction_type === 'spent' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {tx.transaction_type === 'earned' ? <ArrowUpRight className="h-4 w-4" /> :
                           tx.transaction_type === 'spent' ? <ArrowDownLeft className="h-4 w-4" /> :
                           <Trophy className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.transaction_type === 'spent' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {tx.transaction_type === 'spent' ? '-' : '+'}{tx.amount} TXC
                        </p>
                        <Badge variant={
                          tx.transaction_type === 'earned' ? 'default' :
                          tx.transaction_type === 'spent' ? 'destructive' : 'secondary'
                        }>
                          {tx.transaction_type}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earning" className="space-y-4">
          <div className="grid gap-4">
            {[
              { action: 'Complete Profile', reward: 100, progress: 75 },
              { action: 'Upload Resume', reward: 50, progress: 100 },
              { action: 'Apply to 5 Jobs', reward: 75, progress: 60 },
              { action: 'Get Profile Views', reward: 25, progress: 30 },
              { action: 'Share Content', reward: 15, progress: 0 },
              { action: 'Daily Login', reward: 50, progress: 100 }
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{item.action}</p>
                    <Badge variant="outline">{item.reward} TXC</Badge>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.progress}% complete
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Token Economy Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            About TalentXcel Coin (TXC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            TXC is the native token of TalentXcel platform. Use it for premium services, skill assessments, 
            and exclusive career opportunities.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Earn TXC by:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Completing your profile</li>
                <li>Daily login bonuses</li>
                <li>Referring friends</li>
                <li>Participating in assessments</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Spend TXC on:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>Premium job applications</li>
                <li>AI resume optimization</li>
                <li>Interview coaching</li>
                <li>Career analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};