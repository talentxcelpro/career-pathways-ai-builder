import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  Plus, DollarSign, CreditCard, TrendingUp, Users, 
  Search, Filter, Download, RefreshCw, Settings,
  Calendar, Award, Target, Zap
} from 'lucide-react';
import { usePricingPayments } from '@/hooks/usePricingPayments';
import { format } from 'date-fns';

const PricingPayments = () => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    paymentStats,
    plans,
    transactions,
    refreshData,
    isLoading
  } = usePricingPayments();

  const stats = [
    { 
      title: 'Total Revenue', 
      value: `$${paymentStats?.totalRevenue?.toLocaleString() || '0'}`, 
      icon: DollarSign,
      trend: '+12.5%',
      color: 'text-green-600'
    },
    { 
      title: 'Monthly Revenue', 
      value: `$${paymentStats?.monthlyRevenue?.toLocaleString() || '0'}`, 
      icon: TrendingUp,
      trend: '+8.2%',
      color: 'text-blue-600'
    },
    { 
      title: 'Total Transactions', 
      value: paymentStats?.totalTransactions?.toString() || '0', 
      icon: CreditCard,
      trend: '+15.3%',
      color: 'text-purple-600'
    },
    { 
      title: 'Active Subscriptions', 
      value: paymentStats?.activeSubscriptions?.toString() || '0', 
      icon: Users,
      trend: '+5.7%',
      color: 'text-orange-600'
    },
    {
      title: 'Conversion Rate',
      value: `${paymentStats?.conversionRate?.toFixed(1) || '0'}%`,
      icon: Target,
      trend: '+2.1%',
      color: 'text-cyan-600'
    },
    {
      title: 'Avg Order Value',
      value: `$${paymentStats?.averageOrderValue?.toFixed(2) || '0'}`,
      icon: Award,
      trend: '+4.3%',
      color: 'text-indigo-600'
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12400, subscriptions: 234 },
    { month: 'Feb', revenue: 15600, subscriptions: 267 },
    { month: 'Mar', revenue: 18200, subscriptions: 298 },
    { month: 'Apr', revenue: 21800, subscriptions: 325 },
    { month: 'May', revenue: 24500, subscriptions: 354 },
    { month: 'Jun', revenue: 28900, subscriptions: 389 }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment & Billing Management</h1>
          <p className="text-muted-foreground">Comprehensive revenue analytics and subscription management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.trend}
                  </span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subscription Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="subscriptions" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Subscription Plans</h3>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Manage Plans
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{plan.name}</CardTitle>
                    <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                      {plan.status}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subscribers</span>
                      <span className="font-bold">{plan.subscribers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Revenue</span>
                      <span className="font-bold text-green-600">${plan.revenue.toLocaleString()}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Transaction History</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.user_email}</TableCell>
                      <TableCell>{transaction.plan_name}</TableCell>
                      <TableCell className="font-mono">
                        ${transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{transaction.payment_method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${paymentStats?.monthlyRevenue?.toLocaleString() || '0'}</div>
                <p className="text-xs text-green-600">+12.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Customer Lifetime Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$456</div>
                <p className="text-xs text-green-600">+8.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3%</div>
                <p className="text-xs text-green-600">-0.5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.7%</div>
                <p className="text-xs text-green-600">+2.1% from last quarter</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingPayments;