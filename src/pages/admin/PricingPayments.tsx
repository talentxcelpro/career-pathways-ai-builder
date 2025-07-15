import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, CreditCard, TrendingUp, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PricingPayments = () => {
  const { data: paymentStats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('amount, status')
        .eq('status', 'completed');

      if (error && error.code !== 'PGRST116') throw error;
      const total = data?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      return { total, count: data?.length || 0 };
    }
  });

  const stats = [
    { title: 'Total Revenue', value: `$${paymentStats?.total.toLocaleString() || '0'}`, icon: DollarSign },
    { title: 'This Month', value: '$2,450', icon: TrendingUp },
    { title: 'Transactions', value: paymentStats?.count.toString() || '0', icon: CreditCard },
    { title: 'Active Plans', value: '3', icon: Users }
  ];

  const plans = [
    { name: 'Basic', price: 9.99, subscribers: 142, status: 'active' },
    { name: 'Professional', price: 29.99, subscribers: 89, status: 'active' },
    { name: 'Enterprise', price: 99.99, subscribers: 23, status: 'active' }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pricing & Payments</h1>
          <p className="text-muted-foreground">Manage subscription plans and payment processing</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Pricing Plans</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">${plan.price}/month</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subscribers</span>
                      <span className="font-bold">{plan.subscribers}</span>
                    </div>
                    <Badge variant="default">{plan.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Payment system initialized. Transactions will appear here.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingPayments;