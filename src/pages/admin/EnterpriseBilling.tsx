import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  Download,
  Search,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EnterpriseBilling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch enterprise subscriptions and billing data
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['enterprise-billing', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('pro_subscriptions')
        .select(`
          id,
          user_id,
          plan_type,
          amount,
          status,
          created_at,
          expires_at,
          stripe_subscription_id,
          user_profiles!inner(
            id,
            full_name,
            email,
            company_name
          )
        `)
        .eq('plan_type', 'enterprise');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get revenue summary
  const { data: revenueSummary } = useQuery({
    queryKey: ['revenue-summary'],
    queryFn: async () => {
      const [currentMonth, lastMonth, totalRevenue] = await Promise.all([
        // Current month revenue
        supabase
          .from('pro_subscriptions')
          .select('amount')
          .eq('plan_type', 'enterprise')
          .eq('status', 'active')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        
        // Last month revenue
        supabase
          .from('pro_subscriptions')
          .select('amount')
          .eq('plan_type', 'enterprise')
          .eq('status', 'active')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
          .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        
        // Total active revenue
        supabase
          .from('pro_subscriptions')
          .select('amount')
          .eq('plan_type', 'enterprise')
          .eq('status', 'active')
      ]);

      return {
        currentMonth: currentMonth.data?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0,
        lastMonth: lastMonth.data?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0,
        totalActive: totalRevenue.data?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0,
        activeSubscriptions: totalRevenue.data?.length || 0
      };
    }
  });

  // Get upcoming renewals
  const { data: upcomingRenewals } = useQuery({
    queryKey: ['upcoming-renewals'],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data } = await supabase
        .from('pro_subscriptions')
        .select(`
          id,
          amount,
          expires_at,
          user_profiles(company_name, full_name, email)
        `)
        .eq('plan_type', 'enterprise')
        .eq('status', 'active')
        .lte('expires_at', thirtyDaysFromNow)
        .order('expires_at', { ascending: true });
      
      return data || [];
    }
  });

  const filteredBilling = billingData?.filter(billing => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const profiles = billing.user_profiles as any;
    return (
      profiles?.company_name?.toLowerCase().includes(searchLower) ||
      profiles?.full_name?.toLowerCase().includes(searchLower) ||
      profiles?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'canceled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'past_due':
        return 'destructive';
      case 'canceled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Billing</h1>
          <p className="text-muted-foreground">
            Manage enterprise subscriptions and billing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueSummary?.currentMonth?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {revenueSummary?.currentMonth && revenueSummary?.lastMonth ? (
                <>
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {Math.round(((revenueSummary.currentMonth - revenueSummary.lastMonth) / revenueSummary.lastMonth) * 100)}% from last month
                </>
              ) : (
                'Current month revenue'
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueSummary?.activeSubscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">Enterprise accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(revenueSummary?.totalActive * 12)?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Annual recurring revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRenewals?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals Alert */}
      {upcomingRenewals && upcomingRenewals.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Upcoming Renewals
            </CardTitle>
            <CardDescription className="text-orange-700">
              {upcomingRenewals.length} subscriptions expiring in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingRenewals.slice(0, 3).map((renewal) => (
                <div key={renewal.id} className="flex items-center justify-between">
                  <span className="font-medium">
                    {(renewal.user_profiles as any)?.company_name || (renewal.user_profiles as any)?.full_name}
                  </span>
                  <span className="text-sm text-orange-700">
                    Expires {new Date(renewal.expires_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Subscriptions</CardTitle>
          <CardDescription>
            {filteredBilling?.length || 0} subscriptions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBilling?.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {(subscription.user_profiles as any)?.company_name || (subscription.user_profiles as any)?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(subscription.user_profiles as any)?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subscription.plan_type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${subscription.amount?.toLocaleString() || 0}/month
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(subscription.status)}
                      <Badge variant={getStatusVariant(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(subscription.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {subscription.expires_at 
                      ? new Date(subscription.expires_at).toLocaleDateString()
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!filteredBilling?.length && !isLoading && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No enterprise subscriptions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseBilling;