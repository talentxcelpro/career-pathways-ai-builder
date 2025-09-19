import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TXCTokenManagement = () => {
  // Mock data - replace with real queries
  const { data: tokenStats } = useQuery({
    queryKey: ['txc-token-stats'],
    queryFn: async () => ({
      totalSupply: 50000000,
      circulatingSupply: 12500000,
      totalHolders: 8450,
      avgBalance: 1480,
      dailyTransactions: 2340,
      weeklyGrowth: 12.5
    })
  });

  const { data: topHolders } = useQuery({
    queryKey: ['txc-top-holders'],
    queryFn: async () => [
      { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', balance: 15750, rank: 1 },
      { id: '2', name: 'Priya Sharma', email: 'priya@example.com', balance: 14200, rank: 2 },
      { id: '3', name: 'Amit Singh', email: 'amit@example.com', balance: 12800, rank: 3 },
      { id: '4', name: 'Neha Gupta', email: 'neha@example.com', balance: 11500, rank: 4 },
      { id: '5', name: 'Vikram Patel', email: 'vikram@example.com', balance: 10900, rank: 5 }
    ]
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['txc-recent-transactions'],
    queryFn: async () => [
      { id: '1', user: 'Rajesh Kumar', type: 'earned', amount: 150, activity: 'Created post', timestamp: '2024-01-20T10:30:00Z' },
      { id: '2', user: 'Priya Sharma', type: 'earned', amount: 75, activity: 'Daily login', timestamp: '2024-01-20T09:15:00Z' },
      { id: '3', user: 'Amit Singh', type: 'earned', amount: 300, activity: 'Profile completion', timestamp: '2024-01-20T08:45:00Z' },
      { id: '4', user: 'Neha Gupta', type: 'earned', amount: 90, activity: 'Applied to job', timestamp: '2024-01-20T08:20:00Z' },
      { id: '5', user: 'Vikram Patel', type: 'earned', amount: 120, activity: 'Gave recommendation', timestamp: '2024-01-19T17:30:00Z' }
    ]
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">TXC Token Management</h1>
        <p className="text-muted-foreground">
          Monitor token balances, transactions, and mining activities across the platform
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats?.totalSupply?.toLocaleString() || '0'} TXC</div>
            <p className="text-xs text-muted-foreground">
              Maximum token supply
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Circulating Supply</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats?.circulatingSupply?.toLocaleString() || '0'} TXC</div>
            <p className="text-xs text-muted-foreground">
              +{tokenStats?.weeklyGrowth || 0}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Holders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats?.totalHolders?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Active TXC holders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenStats?.dailyTransactions?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Token transactions today
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="holders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="holders">Top Holders</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="mining">Mining Analytics</TabsTrigger>
          <TabsTrigger value="admin">Admin Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="holders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top TXC Holders</CardTitle>
              <CardDescription>
                Users with the highest TXC token balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topHolders?.map((holder) => (
                  <div key={holder.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{holder.rank}</Badge>
                      <div>
                        <p className="font-medium">{holder.name}</p>
                        <p className="text-sm text-muted-foreground">{holder.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{holder.balance.toLocaleString()} TXC</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Token Transactions</CardTitle>
              <CardDescription>
                Latest TXC earnings and activities across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.user}</p>
                        <p className="text-sm text-muted-foreground">{transaction.activity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{transaction.amount} TXC</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mining" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mining Statistics</CardTitle>
              <CardDescription>
                Token earning patterns and mining activity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Most Popular Activities</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Daily Login</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Post Creation</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Job Applications</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Average Daily Earnings</h3>
                  <p className="text-2xl font-bold text-primary">245 TXC</p>
                  <p className="text-sm text-muted-foreground">Per active user</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Mining Efficiency</h3>
                  <p className="text-2xl font-bold text-green-600">92%</p>
                  <p className="text-sm text-muted-foreground">Successful rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Token Management</CardTitle>
              <CardDescription>
                Manually adjust user token balances and manage special rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Award Tokens</h3>
                  <div className="space-y-2">
                    <Input placeholder="User email or ID" />
                    <Input placeholder="Amount" type="number" />
                    <Input placeholder="Reason" />
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Award TXC
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Deduct Tokens</h3>
                  <div className="space-y-2">
                    <Input placeholder="User email or ID" />
                    <Input placeholder="Amount" type="number" />
                    <Input placeholder="Reason" />
                    <Button variant="destructive" className="w-full">
                      <Minus className="h-4 w-4 mr-2" />
                      Deduct TXC
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TXCTokenManagement;