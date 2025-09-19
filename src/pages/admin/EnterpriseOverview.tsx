import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useEnterpriseStats, useEnterpriseBilling } from '@/hooks/useEnterpriseData';
import { ProtectedAdminRoute } from '@/components/admin/ProtectedAdminRoute';

const EnterpriseOverview = () => {
  const { data: enterpriseStats, isLoading: statsLoading } = useEnterpriseStats();
  const { data: billingData, isLoading: billingLoading } = useEnterpriseBilling();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enterprise Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive enterprise client management and analytics dashboard
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseStats?.totalClients || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Enterprise accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${enterpriseStats?.monthlyRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              +{enterpriseStats?.growthRate || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseStats?.activeClients || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Contract Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${enterpriseStats?.avgContractValue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Per client monthly
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Client Management</TabsTrigger>
          <TabsTrigger value="billing">Billing & Revenue</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          <TabsTrigger value="support">Support & Services</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Enterprise Clients</CardTitle>
                <CardDescription>
                  Latest companies that joined the enterprise program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enterpriseStats?.recentClients?.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(client.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={client.is_verified ? "default" : "secondary"}>
                        {client.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Health Score</CardTitle>
                <CardDescription>
                  Overall client satisfaction and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Overall Satisfaction</span>
                    <span className="text-sm font-medium">4.7/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Platform Usage</span>
                    <span className="text-sm font-medium">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Feature Adoption</span>
                    <span className="text-sm font-medium">76%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Support Response</span>
                    <span className="text-sm font-medium">&lt; 2hrs</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  View Detailed Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Enterprise subscription and billing metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium mb-1">Total Revenue</h3>
                        <p className="text-2xl font-bold text-primary">
                          ${billingData?.totalRevenue?.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h3 className="font-medium mb-1">Monthly Recurring</h3>
                        <p className="text-2xl font-bold text-green-600">
                          ${billingData?.monthlyRecurring?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Churn Rate</span>
                        <span className="text-sm font-medium">{billingData?.churnRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Subscription</span>
                        <span className="text-sm font-medium">${billingData?.averageSubscription?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Status</CardTitle>
                <CardDescription>
                  Invoice and payment status overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Pending Invoices</p>
                      <p className="text-sm text-muted-foreground">{billingData?.pendingInvoices || 0} invoices pending</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Overdue Payments</p>
                      <p className="text-sm text-muted-foreground">{billingData?.overduePayments || 0} payments overdue</p>
                    </div>
                  </div>
                  <Button className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Enterprise client performance and usage analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Platform Usage</h3>
                  <p className="text-2xl font-bold text-primary">87.3%</p>
                  <p className="text-sm text-muted-foreground">Daily active rate</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Feature Adoption</h3>
                  <p className="text-2xl font-bold text-green-600">73.5%</p>
                  <p className="text-sm text-muted-foreground">Feature utilization</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Support Satisfaction</h3>
                  <p className="text-2xl font-bold text-blue-600">4.8/5</p>
                  <p className="text-sm text-muted-foreground">Customer rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Support</CardTitle>
              <CardDescription>
                Support tickets and service level management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Support Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Response Time</span>
                      <span className="text-sm font-medium">1.2 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Resolution Rate</span>
                      <span className="text-sm font-medium">96.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Open Tickets</span>
                      <span className="text-sm font-medium">8 tickets</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Service Levels</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">SLA Compliance</span>
                      <span className="text-sm font-medium">99.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Escalations</span>
                      <span className="text-sm font-medium">2 this month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Priority Support</span>
                      <span className="text-sm font-medium">24/7 Available</span>
                    </div>
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

const WrappedEnterpriseOverview = () => (
  <ProtectedAdminRoute requiredPermission="canAccessEnterprise">
    <EnterpriseOverview />
  </ProtectedAdminRoute>
);

export default WrappedEnterpriseOverview;