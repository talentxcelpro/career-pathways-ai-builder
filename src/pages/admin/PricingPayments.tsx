
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Edit, 
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { usePricingPayments } from '@/hooks/usePricingPayments';

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

  const statsCards = [
    { label: 'Total Revenue', value: `$${paymentStats?.totalRevenue || 0}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Total Subscribers', value: paymentStats?.totalSubscribers || 0, icon: Users, color: 'text-blue-600' },
    { label: 'Total Transactions', value: paymentStats?.totalTransactions || 0, icon: CreditCard, color: 'text-purple-600' },
    { label: 'Failed Payments', value: paymentStats?.failedTransactions || 0, icon: AlertCircle, color: 'text-red-600' }
  ];

  return (
    <UnifiedAdminLayout 
      title="Pricing & Payments" 
      description="Manage subscription plans, pricing, and payment processing"
    >
      <div className="space-y-8">
        {/* Real-time Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Real-time data updates</span>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        
        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}</p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Zap className="h-3 w-3 text-green-500 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Plans */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Subscription Plans</CardTitle>
              <Button onClick={() => window.open('/admin/pricing/create', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans?.map((plan) => (
                <Card key={plan.id} className="border-2">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <Switch checked={plan.is_active} />
                    </div>
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-600">/{plan.billing_cycle}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-600">Subscribers</span>
                      <Badge variant="outline">{plan.subscriber_count}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <span className="font-medium">{transaction.user_email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.plan_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${transaction.amount}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 
                                      transaction.status === 'failed' ? 'destructive' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Basic Plan</span>
                  <span className="font-medium">$0 (Free)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Pro Plan</span>
                  <span className="font-medium">$29/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Enterprise Plan</span>
                  <span className="font-medium">$99/month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Credit Card</span>
                  <Badge>85%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>PayPal</span>
                  <Badge>12%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bank Transfer</span>
                  <Badge>3%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default PricingPayments;
