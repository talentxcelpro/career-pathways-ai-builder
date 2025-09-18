import React from 'react';
import { useTieredAccess, AccessTier } from '@/hooks/useTieredAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Lock, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTXCPrice, formatTXC } from '@/types/txc-pricing';
import { TXCFeaturePurchase } from '@/components/txc/TXCFeaturePurchase';

interface TieredAccessGuardProps {
  children: React.ReactNode;
  feature: string;
  requiredTier?: AccessTier;
  requiresAuth?: boolean;
  fallback?: React.ReactNode;
  featureId?: string; // For TXC purchases
  featureName?: string;
}

export const TieredAccessGuard: React.FC<TieredAccessGuardProps> = ({
  children,
  feature,
  requiredTier = 'free',
  requiresAuth = true,
  fallback,
  featureId,
  featureName
}) => {
  const { hasFeatureAccess, getUpgradeMessage, isAuthenticated, refreshFeatures } = useTieredAccess();
  const navigate = useNavigate();

  // Check authentication first
  if (requiresAuth && !isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Please sign in to access this feature.
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check feature access
  if (!hasFeatureAccess(feature, requiresAuth)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const purchaseFeatureId = featureId || feature;
    const cost = getTXCPrice(purchaseFeatureId);
    const displayName = featureName || feature;

    const getTierIcon = (tier: AccessTier) => {
      switch (tier) {
        case 'pro':
          return <Crown className="h-8 w-8 text-amber-500" />;
        case 'enterprise':
          return <Star className="h-8 w-8 text-purple-500" />;
        default:
          return <Coins className="h-8 w-8 text-primary" />;
      }
    };

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          {getTierIcon(requiredTier)}
          <CardTitle className="mt-4">
            {cost > 0 ? 'TXC Purchase Required' : `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature`}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {getUpgradeMessage(feature)}
          </p>
          
          {cost > 0 ? (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                  <Coins className="h-5 w-5 text-primary" />
                  {formatTXC(cost)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Purchase to unlock {displayName}
                </p>
              </div>
              
              <TXCFeaturePurchase
                featureId={purchaseFeatureId}
                featureName={displayName}
                cost={cost}
                onSuccess={() => {
                  refreshFeatures();
                }}
                className="w-full"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/txc/pricing')} 
                className="w-full"
              >
                View TXC Pricing
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};