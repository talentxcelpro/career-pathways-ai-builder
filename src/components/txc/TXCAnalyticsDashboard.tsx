import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Calendar, 
  BarChart3, 
  PieChart,
  Activity,
  Target,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { formatTXC } from '@/types/txc-pricing';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
  feature_name?: string;
}

interface Analytics {
  totalTransactions: number;
  totalEarned: number;
  totalSpent: number;
  averageTransaction: number;
  recentTransactions: Transaction[];
  monthlyTrend: { month: string; earned: number; spent: number }[];
}

export const TXCAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { balance, availableBalance } = useTokenBalance();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get date range
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

      // Fetch transactions
      const { data: transactions, error } = await supabase
        .from('txc_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process analytics
      const totalTransactions = transactions?.length || 0;
      const totalEarned = transactions
        ?.filter(t => ['earning', 'bonus'].includes(t.transaction_type))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
      const totalSpent = transactions
        ?.filter(t => t.transaction_type === 'purchase')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
      
      const averageTransaction = totalTransactions > 0 
        ? (totalEarned + totalSpent) / totalTransactions 
        : 0;

      // Group by month for trend
      const monthlyData: { [key: string]: { earned: number; spent: number } } = {};
      transactions?.forEach(t => {
        const month = new Date(t.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        
        if (!monthlyData[month]) {
          monthlyData[month] = { earned: 0, spent: 0 };
        }
        
        if (['earning', 'bonus'].includes(t.transaction_type)) {
          monthlyData[month].earned += Math.abs(t.amount);
        } else if (t.transaction_type === 'purchase') {
          monthlyData[month].spent += Math.abs(t.amount);
        }
      });

      const monthlyTrend = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .slice(-6); // Last 6 months

      setAnalytics({
        totalTransactions,
        totalEarned,
        totalSpent,
        averageTransaction,
        recentTransactions: transactions?.slice(0, 10) || [],
        monthlyTrend,
      });

    } catch (error) {
      console.error('Error fetching TXC analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-24" />
          ))}
        </div>
        <Card className="h-96" />
      </div>
    );
  }

  const netGain = (analytics?.totalEarned || 0) - (analytics?.totalSpent || 0);
  const isPositive = netGain >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TXC Analytics</h1>
          <p className="text-muted-foreground">Track your TXC earnings and spending</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatTXC(availableBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatTXC(analytics?.totalEarned || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              In {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatTXC(analytics?.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              In {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatTXC(netGain)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPositive ? 'Profit' : 'Loss'} in {timeRange}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest TXC activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        ['earning', 'bonus'].includes(transaction.transaction_type)
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {['earning', 'bonus'].includes(transaction.transaction_type) ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        ['earning', 'bonus'].includes(transaction.transaction_type)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {['earning', 'bonus'].includes(transaction.transaction_type) ? '+' : '-'}
                        {formatTXC(Math.abs(transaction.amount))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                  </div>
                ))}

                {analytics?.recentTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions in the selected time range</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Insights
              </CardTitle>
              <CardDescription>
                Personalized recommendations for your TXC strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Earning Opportunity
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You could earn an additional {formatTXC(2500)} this month by completing 
                  your profile and connecting with 5 more professionals.
                </p>
              </div>

              {analytics && analytics.totalSpent > analytics.totalEarned && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Spending Alert
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You've spent {formatTXC(analytics.totalSpent - analytics.totalEarned)} more 
                    than you've earned. Consider focusing on earning activities.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Growth Tip
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Premium features can accelerate your career growth. Consider investing 
                  in networking or analytics features for better ROI.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                TXC Goals
              </CardTitle>
              <CardDescription>
                Set and track your TXC earning targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Earning Goal</span>
                  <span className="text-sm text-muted-foreground">10,000 TXC</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((analytics?.totalEarned || 0) / 10000 * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTXC(analytics?.totalEarned || 0)} earned</span>
                  <span>{Math.round((analytics?.totalEarned || 0) / 10000 * 100)}% complete</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Savings Goal</span>
                  <span className="text-sm text-muted-foreground">25,000 TXC</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(availableBalance / 25000 * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTXC(availableBalance)} saved</span>
                  <span>{Math.round(availableBalance / 25000 * 100)}% complete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};