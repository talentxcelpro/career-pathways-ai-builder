import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, Star, Gift, Crown, Zap } from 'lucide-react';
import { useCreatorMonetization } from '@/hooks/useCreatorMonetization';

export const CreatorMonetizationHub: React.FC = () => {
  const {
    earnings,
    subscriptions,
    createSubscriptionTier,
    isLoading
  } = useCreatorMonetization();

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${earnings.total.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{earnings.growth}%</span>
              <span className="text-sm text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
                <p className="text-2xl font-bold">{earnings.subscribers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{earnings.subscriberGrowth}</span>
              <span className="text-sm text-muted-foreground ml-1">new this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">${earnings.monthlyRevenue.toLocaleString()}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Avg. ${earnings.avgRevenuePerSubscriber}/subscriber
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tiers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription Tiers
            </CardTitle>
            <Button 
              onClick={() => createSubscriptionTier({
                name: 'Premium',
                price: 9.99,
                description: 'Access to premium content and exclusive features'
              })}
              disabled={isLoading}
            >
              <Crown className="h-4 w-4 mr-2" />
              Create Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subscriptions.tiers.map((tier) => (
              <Card key={tier.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      <p className="text-2xl font-bold text-primary">
                        ${tier.price}
                        <span className="text-sm text-muted-foreground">/month</span>
                      </p>
                    </div>
                    <Badge variant={tier.isPopular ? 'default' : 'secondary'}>
                      {tier.isPopular ? 'Popular' : 'Tier'}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{tier.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {tier.subscriberCount} subscribers
                    </span>
                    <Button variant="outline" size="sm">
                      Edit Tier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Tier Card */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-primary/50 transition-colors">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
                <Crown className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Create New Tier</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Add a new subscription tier to offer more value to your audience
                </p>
                <Button variant="outline">
                  <Crown className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earnings.revenueSources.map((source) => (
                <div key={source.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${source.color}`}></div>
                    <span className="font-medium">{source.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${source.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {earnings.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Gift className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.type}</p>
                      <p className="text-sm text-muted-foreground">{transaction.subscriber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+${transaction.amount}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};