
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Eye,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const PricingPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const pricingPlans = [
    {
      id: '1',
      name: 'Basic',
      price: 0,
      duration: 'month',
      features: ['5 Job Applications', 'Basic Resume Builder', 'Email Support'],
      subscribers: 1234,
      isActive: true,
      type: 'free'
    },
    {
      id: '2',
      name: 'Premium',
      price: 499,
      duration: 'month',
      features: ['Unlimited Applications', 'Premium Templates', 'AI Tools', 'Priority Support'],
      subscribers: 567,
      isActive: true,
      type: 'paid'
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 2999,
      duration: 'month',
      features: ['All Premium Features', 'Team Management', 'Custom Branding', 'Dedicated Support'],
      subscribers: 89,
      isActive: true,
      type: 'enterprise'
    }
  ];

  const recentTransactions = [
    {
      id: '1',
      user: 'John Doe',
      plan: 'Premium',
      amount: 499,
      status: 'completed',
      date: '2024-01-15',
      paymentMethod: 'Razorpay'
    },
    {
      id: '2',
      user: 'Jane Smith',
      plan: 'Enterprise',
      amount: 2999,
      status: 'pending',
      date: '2024-01-14',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: '3',
      user: 'Mike Johnson',
      plan: 'Premium',
      amount: 499,
      status: 'failed',
      date: '2024-01-13',
      paymentMethod: 'Razorpay'
    }
  ];

  const paymentStats = [
    { label: 'Total Revenue', value: '₹2,45,670', icon: DollarSign, color: 'text-green-600' },
    { label: 'Active Subscribers', value: '1,890', icon: Users, color: 'text-blue-600' },
    { label: 'Monthly Growth', value: '+23%', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Success Rate', value: '97.2%', icon: CheckCircle, color: 'text-orange-600' }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing & Payments</h1>
              <p className="text-gray-600">Manage pricing plans, payments, and transactions</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Plan
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {paymentStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pricing Plans */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pricing Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pricingPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-2xl font-bold">
                              ₹{plan.price}
                              <span className="text-sm font-normal text-gray-600">/{plan.duration}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={plan.isActive} />
                            <Badge variant={plan.type === 'free' ? 'secondary' : 
                                           plan.type === 'paid' ? 'default' : 'destructive'}>
                              {plan.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">{plan.subscribers} subscribers</p>
                          <ul className="text-sm space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Transactions</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
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
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.user}</TableCell>
                          <TableCell>{transaction.plan}</TableCell>
                          <TableCell>₹{transaction.amount}</TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === 'completed' ? 'default' :
                              transaction.status === 'pending' ? 'secondary' :
                              'destructive'
                            }>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">This Month</span>
                      <span className="font-semibold">₹45,670</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Month</span>
                      <span className="font-semibold">₹38,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Growth</span>
                      <span className="font-semibold text-green-600">+18.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Gateway Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Payment Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Razorpay Gateway</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bank Transfer</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">UPI Payments</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">International Cards</span>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Generate Invoice
                  </Button>
                  <Button className="w-full" variant="outline">
                    Refund Request
                  </Button>
                  <Button className="w-full" variant="outline">
                    Payment Reports
                  </Button>
                  <Button className="w-full" variant="outline">
                    Gateway Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Subscription Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Free Users</span>
                      <span className="text-sm font-semibold">65.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Premium Users</span>
                      <span className="text-sm font-semibold">30.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Enterprise</span>
                      <span className="text-sm font-semibold">4.6%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PricingPayments;
