import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EnterpriseClients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const queryClient = useQueryClient();

  // Fetch enterprise clients
  const { data: clients, isLoading } = useQuery({
    queryKey: ['enterprise-clients', searchTerm, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          company_name,
          subscription_tier,
          created_at,
          phone,
          user_id,
          pro_subscriptions(
            id,
            plan_type,
            amount,
            status,
            created_at
          )
        `)
        .eq('subscription_tier', 'enterprise');

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get usage statistics for clients
  const { data: clientUsage } = useQuery({
    queryKey: ['client-usage'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_usage_logs')
        .select('user_id, tokens_used, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      // Group by user_id
      const usageByUser = data?.reduce((acc, log) => {
        if (!acc[log.user_id]) {
          acc[log.user_id] = { totalTokens: 0, requests: 0 };
        }
        acc[log.user_id].totalTokens += log.tokens_used || 0;
        acc[log.user_id].requests += 1;
        return acc;
      }, {} as Record<string, any>) || {};
      
      return usageByUser;
    }
  });

  // Create/Update client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([clientData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-clients'] });
      toast.success('Enterprise client saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save client: ' + error.message);
    }
  });

  const filteredClients = clients?.filter(client => {
    if (selectedStatus === 'all') return true;
    const hasActiveSubscription = client.pro_subscriptions?.some(sub => sub.status === 'active');
    return selectedStatus === 'active' ? hasActiveSubscription : !hasActiveSubscription;
  });

  const getClientUsage = (userId: string) => {
    return clientUsage?.[userId] || { totalTokens: 0, requests: 0 };
  };

  const getSubscriptionStatus = (client: any) => {
    const activeSubscription = client.pro_subscriptions?.find((sub: any) => sub.status === 'active');
    return activeSubscription ? 'active' : 'inactive';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Clients</h1>
          <p className="text-muted-foreground">
            Manage enterprise client accounts and relationships
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Enterprise Client</DialogTitle>
              <DialogDescription>
                Create a new enterprise client account
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input id="company_name" placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input id="contact_name" placeholder="Enter contact name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes about the client" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Client</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Enterprise accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredClients?.filter(client => getSubscriptionStatus(client) === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently paying</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${clients?.reduce((sum, client) => {
                const activeSubscription = client.pro_subscriptions?.find((sub: any) => sub.status === 'active');
                return sum + (activeSubscription?.amount || 0);
              }, 0)?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">From enterprise plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(Object.values(clientUsage || {}).reduce((sum: number, usage: any) => sum + usage.totalTokens, 0) / (Object.keys(clientUsage || {}).length || 1))}
            </div>
            <p className="text-xs text-muted-foreground">Tokens per client</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="active">Active Subscriptions</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Clients</CardTitle>
          <CardDescription>
            {filteredClients?.length || 0} clients found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients?.map((client) => {
              const usage = getClientUsage(client.user_id);
              const subscriptionStatus = getSubscriptionStatus(client);
              
              return (
                <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.company_name || 'Enterprise Client'}</h3>
                      <p className="text-sm text-muted-foreground">{client.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{client.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{usage.totalTokens.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">tokens used</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{usage.requests}</p>
                      <p className="text-xs text-muted-foreground">API calls</p>
                    </div>
                    <Badge variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                      {subscriptionStatus}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {!filteredClients?.length && !isLoading && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No enterprise clients found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseClients;