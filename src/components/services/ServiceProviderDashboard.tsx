import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Edit,
  Eye,
  MessageSquare,
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

// Mock data - would come from database
const mockProvider = {
  id: 'provider-1',
  name: 'Sarah Johnson',
  avatar: '/api/placeholder/80/80',
  title: 'Professional Resume Writer & Career Coach',
  verified: true,
  rating: 4.9,
  reviewCount: 127,
  completedOrders: 156,
  responseTime: '< 2 hours',
  memberSince: '2022',
  location: 'Mumbai, India'
};

const mockServices = [
  {
    id: '1',
    title: 'Professional Resume Writing Service',
    category: 'Career Services',
    price: 2500,
    status: 'active',
    orders: 23,
    views: 1240,
    rating: 4.9,
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    title: 'LinkedIn Profile Optimization',
    category: 'Career Services',
    price: 1500,
    status: 'active',
    orders: 18,
    views: 890,
    rating: 4.8,
    lastUpdated: '2024-01-12'
  },
  {
    id: '3',
    title: 'Interview Coaching Session',
    category: 'Career Services',
    price: 3000,
    status: 'paused',
    orders: 15,
    views: 670,
    rating: 4.9,
    lastUpdated: '2024-01-10'
  }
];

const mockOrders = [
  {
    id: 'order-1',
    service: 'Professional Resume Writing Service',
    client: 'John Doe',
    status: 'in_progress',
    price: 2500,
    deadline: '2024-01-25',
    progress: 60
  },
  {
    id: 'order-2',
    service: 'LinkedIn Profile Optimization',
    client: 'Jane Smith',
    status: 'completed',
    price: 1500,
    completedDate: '2024-01-20',
    progress: 100
  },
  {
    id: 'order-3',
    service: 'Interview Coaching Session',
    client: 'Mike Wilson',
    status: 'pending',
    price: 3000,
    deadline: '2024-01-28',
    progress: 0
  }
];

const mockEarnings = {
  thisMonth: 45000,
  lastMonth: 38000,
  totalEarnings: 234000,
  pendingPayments: 12500,
  completedOrders: 156,
  avgOrderValue: 2400
};

export const ServiceProviderDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="lg:w-80">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={mockProvider.avatar} alt={mockProvider.name} />
                <AvatarFallback>
                  {mockProvider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{mockProvider.name}</h2>
                  {mockProvider.verified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{mockProvider.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{mockProvider.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {mockProvider.rating}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mockProvider.reviewCount} reviews
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {mockProvider.completedOrders}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completed orders
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response time:</span>
                  <span className="font-medium">{mockProvider.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since:</span>
                  <span className="font-medium">{mockProvider.memberSince}</span>
                </div>
              </div>

              <Button className="w-full">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    ₹{mockEarnings.thisMonth.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-2 text-xs text-green-600">
                +{Math.round(((mockEarnings.thisMonth - mockEarnings.lastMonth) / mockEarnings.lastMonth) * 100)}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold">
                    {mockOrders.filter(o => o.status === 'in_progress' || o.status === 'pending').length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    {mockProvider.rating}
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Services</p>
                  <p className="text-2xl font-bold">{mockServices.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2">
                  <Plus className="h-6 w-6" />
                  Create New Service
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <MessageSquare className="h-6 w-6" />
                  View Messages
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getOrderStatusIcon(order.status)}
                      <div>
                        <p className="font-medium">{order.service}</p>
                        <p className="text-sm text-muted-foreground">Client: {order.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.price.toLocaleString()}</p>
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">My Services</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Button>
          </div>

          <div className="grid gap-6">
            {mockServices.map(service => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{service.title}</h4>
                        {getStatusBadge(service.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{service.category}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price:</span>
                          <p className="font-medium">₹{service.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Orders:</span>
                          <p className="font-medium">{service.orders}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Views:</span>
                          <p className="font-medium">{service.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rating:</span>
                          <p className="font-medium flex items-center gap-1">
                            {service.rating}
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold">Orders Management</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </div>

          <div className="space-y-4">
            {mockOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getOrderStatusIcon(order.status)}
                      <div>
                        <h4 className="font-semibold">{order.service}</h4>
                        <p className="text-sm text-muted-foreground">Client: {order.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.price.toLocaleString()}</p>
                      {getOrderStatusBadge(order.status)}
                    </div>
                  </div>

                  {order.status === 'in_progress' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className="w-full" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {order.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Deadline: {order.deadline}
                        </div>
                      )}
                      {order.completedDate && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed: {order.completedDate}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      {order.status === 'pending' && (
                        <Button size="sm">Accept Order</Button>
                      )}
                      {order.status === 'in_progress' && (
                        <Button size="sm">Update Progress</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ₹{mockEarnings.totalEarnings.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  ₹{mockEarnings.pendingPayments.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Will be paid in 3-5 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Avg. Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ₹{mockEarnings.avgOrderValue.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Average per order</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <span>January 2024</span>
                  <span className="font-bold">₹{mockEarnings.thisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <span>December 2023</span>
                  <span className="font-bold">₹{mockEarnings.lastMonth.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};