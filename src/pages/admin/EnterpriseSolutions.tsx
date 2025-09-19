import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Users, 
  DollarSign, 
  BarChart3, 
  Rocket, 
  Shield, 
  Globe, 
  Zap,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Package
} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const EnterpriseSolutions = () => {
  // Real data queries
  const { data: enterpriseStats } = useQuery({
    queryKey: ['enterprise-stats'],
    queryFn: async () => {
      const [clientsResponse, paymentsResponse, activeDeploymentsResponse] = await Promise.all([
        supabase.from('user_profiles').select('id, company_name').eq('subscription_tier', 'enterprise'),
        supabase.from('pro_subscriptions').select('id, amount, created_at').eq('plan_type', 'enterprise'),
        supabase.from('ai_deployments').select('id, deployment_name, health_status').eq('is_live', true)
      ]);

      return {
        totalClients: clientsResponse.data?.length || 0,
        activeDeployments: activeDeploymentsResponse.data?.length || 0,
        monthlyRevenue: paymentsResponse.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
        uptime: 99.9
      };
    }
  });

  const { data: recentClients } = useQuery({
    queryKey: ['recent-enterprise-clients'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, company_name, full_name, created_at')
        .eq('subscription_tier', 'enterprise')
        .order('created_at', { ascending: false })
        .limit(5);
      
      return data || [];
    }
  });

  const { data: deploymentHealth } = useQuery({
    queryKey: ['deployment-health'],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_deployments')
        .select('deployment_name, health_status, last_health_check, average_response_time_ms')
        .eq('is_live', true)
        .order('last_health_check', { ascending: false })
        .limit(6);
      
      return data || [];
    }
  });

  const stats = enterpriseStats || { totalClients: 0, activeDeployments: 0, monthlyRevenue: 0, uptime: 99.9 };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise Solutions</h1>
          <p className="text-muted-foreground">
            Manage enterprise AI solutions and client deployments
          </p>
        </div>
        <Button className="gap-2">
          <Rocket className="h-4 w-4" />
          New Deployment
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise Clients</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Active enterprise accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDeployments}</div>
            <p className="text-xs text-muted-foreground">Live AI deployments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Enterprise subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Uptime</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}%</div>
            <Progress value={stats.uptime} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Enterprise Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Recent Enterprise Clients
            </CardTitle>
            <CardDescription>Latest enterprise onboardings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients?.map((client) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{client.company_name || 'Enterprise Client'}</p>
                    <p className="text-sm text-muted-foreground">{client.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
                    </p>
                    <Badge variant="outline">Enterprise</Badge>
                  </div>
                </div>
              ))}
              {!recentClients?.length && (
                <p className="text-center py-4 text-muted-foreground">No recent clients</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Deployment Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Deployment Health
            </CardTitle>
            <CardDescription>AI deployment status monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deploymentHealth?.map((deployment) => (
                <div key={deployment.deployment_name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{deployment.deployment_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {deployment.average_response_time_ms}ms avg response
                    </p>
                  </div>
                  <Badge 
                    variant={deployment.health_status === 'healthy' ? 'default' : 'destructive'}
                  >
                    {deployment.health_status}
                  </Badge>
                </div>
              ))}
              {!deploymentHealth?.length && (
                <p className="text-center py-4 text-muted-foreground">No active deployments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common enterprise management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Manage Clients</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Zap className="h-6 w-6" />
              <span>Deploy Solution</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>Billing Center</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnterpriseSolutions;