import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Star } from 'lucide-react';
import { usePremiumFeatures } from '@/hooks/usePremiumFeatures';
import { TXCFeaturePurchase } from '@/components/txc/TXCFeaturePurchase';
import { formatTXC } from '@/types/txc-pricing';
import { useNavigate } from 'react-router-dom';

interface PremiumGuardProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({
  featureKey,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasFeature, features, trackFeatureUsage } = usePremiumFeatures();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (hasFeature(featureKey)) {
      trackFeatureUsage(featureKey);
    }
  }, [featureKey, hasFeature, trackFeatureUsage]);

  if (hasFeature(featureKey)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const feature = features.find((f) => f.feature_key === featureKey);

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Crown className="h-8 w-8 text-amber-600" />
        </div>
        <div>
          <CardTitle className="flex items-center justify-center gap-2 text-amber-800 dark:text-amber-200">
            <Lock className="h-5 w-5" />
            Premium Feature Required
          </CardTitle>
          <CardDescription className="mt-2">
            {feature?.feature_name || 'This feature'} requires a premium subscription to access.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {feature && (
          <>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-amber-200">
              <h4 className="font-semibold text-lg mb-2">{feature.feature_name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
              <div className="text-2xl font-bold text-amber-600">
                {formatTXC(feature.txc_cost)}
              </div>
              {feature.is_subscription && (
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.subscription_duration} subscription
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Unlock premium features with TXC tokens</span>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {feature ? (
          <TXCFeaturePurchase
            featureId={feature.feature_key}
            featureName={feature.feature_name}
            cost={feature.txc_cost}
            description={feature.description}
            variant="default"
            className="w-full"
          />
        ) : (
          <Button onClick={() => navigate('/premium')} className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Browse Premium Features
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/txc/pricing')}
          className="w-full"
        >
          Get More TXC Tokens
        </Button>
      </CardFooter>
    </Card>
  );
};