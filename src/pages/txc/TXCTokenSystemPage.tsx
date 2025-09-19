import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { Coins, CreditCard, TrendingUp, Users, Award, Settings } from 'lucide-react';
import { formatTXC, TXC_SUBSCRIPTION_TIERS, TXC_TOOLS_PRICING } from '@/types/txc-pricing';

export const TXCTokenSystemPage = () => {
  const { balance, isLoading } = useTokenBalance();

  const systemStats = [
    { label: 'Total Supply', value: '1,000,000 TXC', icon: <Coins className="h-5 w-5" /> },
    { label: 'Circulating', value: '250,000 TXC', icon: <TrendingUp className="h-5 w-5" /> },
    { label: 'Active Users', value: '1,847', icon: <Users className="h-5 w-5" /> },
    { label: 'Daily Volume', value: '15,230 TXC', icon: <Award className="h-5 w-5" /> }
  ];

  const recentTransactions = [
    { type: 'Mining', amount: '+150', activity: 'Post Created', time: '2 mins ago' },
    { type: 'Purchase', amount: '-2,000', activity: 'AI Resume Builder', time: '1 hour ago' },
    { type: 'Bonus', amount: '+300', activity: 'Weekly Activity', time: '1 day ago' },
    { type: 'Mining', amount: '+75', activity: 'Connection Made', time: '2 days ago' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">TXC Token System</h1>
        <p className="text-muted-foreground">Complete token management and analytics</p>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : formatTXC(balance?.available || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Locked Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTXC(balance?.locked || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lifetime Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTXC(balance?.lifetime_earned || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{((balance?.available || 0) * 0.001).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* System Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>System Statistics</CardTitle>
                <CardDescription>Real-time TXC ecosystem metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {systemStats.map((stat, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="text-primary">{stat.icon}</div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest TXC transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={tx.type === 'Mining' ? 'default' : tx.type === 'Bonus' ? 'secondary' : 'outline'}>
                          {tx.type}
                        </Badge>
                        <div>
                          <p className="font-medium">{tx.activity}</p>
                          <p className="text-sm text-muted-foreground">{tx.time}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount} TXC
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Complete history of all TXC transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Transaction filters and search would go here */}
                <div className="text-center py-8 text-muted-foreground">
                  Transaction history will be loaded from the database
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <div className="grid gap-6">
            {/* Subscription Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Tiers</CardTitle>
                <CardDescription>Upgrade your account with TXC tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {TXC_SUBSCRIPTION_TIERS.map((tier) => (
                    <Card key={tier.id} className={tier.popular ? 'border-primary' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{tier.name}</CardTitle>
                          {tier.popular && <Badge>Popular</Badge>}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatTXC(tier.cost)}
                        </div>
                        <CardDescription>per {tier.duration}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {tier.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-4">
                          Purchase with TXC
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Tools */}
            <Card>
              <CardHeader>
                <CardTitle>AI Tools & Services</CardTitle>
                <CardDescription>Purchase AI-powered tools with TXC</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {TXC_TOOLS_PRICING.filter(tool => tool.category === 'tools').map((tool) => (
                    <div key={tool.feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{tool.description}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{tool.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatTXC(tool.cost)}</div>
                        <Button size="sm" variant="outline">Buy</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Token Economics</CardTitle>
                <CardDescription>TXC ecosystem analytics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+15.3%</div>
                      <p className="text-sm text-muted-foreground">Token Velocity</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">84.2%</div>
                      <p className="text-sm text-muted-foreground">Utility Rate</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">2.8x</div>
                      <p className="text-sm text-muted-foreground">Growth Factor</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Token Settings
              </CardTitle>
              <CardDescription>Configure your TXC preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-mining Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get notified when you earn TXC</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Transaction Alerts</h4>
                    <p className="text-sm text-muted-foreground">Email alerts for large transactions</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Download your transaction history</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};