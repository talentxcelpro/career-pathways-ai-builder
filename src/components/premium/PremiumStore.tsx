import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Star, Clock, Check, Zap } from 'lucide-react';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { TXCFeaturePurchase } from '@/components/txc/TXCFeaturePurchase';
import { formatTXC } from '@/types/txc-pricing';

export const PremiumStore: React.FC = () => {
  const { features, hasFeature, loading } = usePremiumFeatures();

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-48 bg-muted/50" />
        ))}
      </div>
    );
  }

  const getFeatureIcon = (featureKey: string) => {
    if (featureKey.includes('messaging')) return <Zap className="h-5 w-5" />;
    if (featureKey.includes('video')) return <Star className="h-5 w-5" />;
    if (featureKey.includes('premium')) return <Crown className="h-5 w-5" />;
    if (featureKey.includes('support')) return <Check className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  const getDurationText = (duration: string) => {
    if (duration === '30 days') return '30 days';
    if (duration === '7 days') return '7 days';
    return 'One-time';
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Premium Store
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Unlock powerful features with TXC tokens. Enhance your professional experience with premium tools and capabilities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const isOwned = hasFeature(feature.feature_key);
          
          return (
            <Card 
              key={feature.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                isOwned ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'hover:border-primary/50'
              }`}
            >
              {isOwned && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-500 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Owned
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getFeatureIcon(feature.feature_key)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.feature_name}</CardTitle>
                    {feature.is_subscription && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {getDurationText(feature.subscription_duration)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    {formatTXC(feature.txc_cost)}
                  </div>
                  {feature.is_subscription && (
                    <Badge variant="outline" className="text-xs">
                      Subscription
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                {isOwned ? (
                  <Button disabled className="w-full bg-green-500 text-white">
                    <Check className="h-4 w-4 mr-2" />
                    Purchased
                  </Button>
                ) : (
                  <TXCFeaturePurchase
                    featureId={feature.feature_key}
                    featureName={feature.feature_name}
                    cost={feature.txc_cost}
                    description={feature.description}
                    variant="default"
                    className="w-full"
                    onSuccess={() => {
                      // Handle successful purchase
                      console.log('Feature purchased successfully');
                    }}
                  />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {features.length === 0 && (
        <div className="text-center py-12">
          <Crown className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Premium Features Available</h3>
          <p className="text-muted-foreground">
            Premium features will be available soon. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};