import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  TrendingUp,
  Calendar,
  Coins,
  PieChart,
  Receipt,
  Activity,
  Target,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export const TXCSpendingHistory: React.FC = () => {
  const { user } = useAuth();

  const { data: spendingData, isLoading } = useQuery({
    queryKey: ['txc-spending-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase.functions.invoke('txc-purchase-history');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 60000
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const spendingHistory = spendingData?.spendingHistory || [];
  const spendingByCategory = spendingData?.spendingByCategory || {};
  const insights = spendingData?.insights || {};
  const monthlySpending = spendingData?.monthlySpending || {};

  // Prepare chart data
  const categoryChartData = Object.entries(spendingByCategory).map(([name, data]: [string, any]) => ({
    name,
    value: data.total,
    count: data.count
  }));

  const monthlyChartData = Object.entries(monthlySpending)
    .sort()
    .slice(-6) // Last 6 months
    .map(([month, amount]: [string, any]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount
    }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const getBadgeVariant = (category: string) => {
    const variants = {
      'Subscriptions': 'default',
      'AI Tools': 'secondary',
      'Resume & Templates': 'outline',
      'Job Applications': 'destructive',
      'Learning & Development': 'default',
      'Other': 'secondary'
    };
    return variants[category] || 'outline';
  };

  const getTransactionIcon = (category: string) => {
    const icons = {
      'Subscriptions': <CreditCard className="h-4 w-4" />,
      'AI Tools': <Activity className="h-4 w-4" />,
      'Resume & Templates': <Receipt className="h-4 w-4" />,
      'Job Applications': <Target className="h-4 w-4" />,
      'Learning & Development': <Calendar className="h-4 w-4" />,
      'Other': <ShoppingBag className="h-4 w-4" />
    };
    return icons[category] || <ShoppingBag className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">TXC Spending History</h2>
        <p className="text-muted-foreground">
          Track your TXC token spending patterns and purchase history
        </p>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalSpent?.toLocaleString() || 0} TXC</div>
            <p className="text-xs text-muted-foreground">
              Across {insights.transactionCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.avgTransactionSize?.toLocaleString() || 0} TXC</div>
            <p className="text-xs text-muted-foreground">
              Average purchase size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{insights.mostSpentCategory?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {insights.mostSpentCategory?.percentage || 0}% of total spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(monthlySpending[new Date().toISOString().substring(0, 7)] || 0).toLocaleString()} TXC
            </div>
            <p className="text-xs text-muted-foreground">
              Current month spending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>How you've allocated your TXC tokens</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} TXC`, 'Spent']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No spending data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>Your spending pattern over time</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} TXC`, 'Spent']} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No monthly data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>Your latest TXC spending transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spendingHistory.length > 0 ? (
              spendingHistory.slice(0, 10).map((transaction, index) => (
                <div key={transaction.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                      {getTransactionIcon(transaction.category)}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getBadgeVariant(transaction.category)} className="text-xs">
                          {transaction.category}
                        </Badge>
                        {transaction.subcategory && (
                          <Badge variant="outline" className="text-xs">
                            {transaction.subcategory}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString()} at {new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-red-600">
                      <ArrowDownRight className="h-4 w-4" />
                      <span className="font-bold">{transaction.amount.toLocaleString()} TXC</span>
                    </div>
                    {transaction.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(transaction.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No purchases yet</h3>
                <p className="text-sm text-muted-foreground">Start exploring the TXC Store to unlock premium features!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};