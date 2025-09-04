import React from 'react';
import { useTieredAccess } from '@/hooks/useTieredAccess';
import { AccessTier } from '@/types/access';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TieredAccessGuardProps {
  children: React.ReactNode;
  feature: string;
  requiredTier?: AccessTier;
  requiresAuth?: boolean;
  fallback?: React.ReactNode;
}

export const TieredAccessGuard: React.FC<TieredAccessGuardProps> = ({
  children,
  feature,
  requiredTier = 'free',
  requiresAuth = true,
  fallback
}) => {
  const { hasFeatureAccess, currentTier, getUpgradeMessage, isAuthenticated } = useTieredAccess();
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

    const getTierIcon = (tier: AccessTier) => {
      switch (tier) {
        case 'pro':
          return <Crown className="h-8 w-8 text-amber-500" />;
        case 'enterprise':
          return <Star className="h-8 w-8 text-purple-500" />;
        default:
          return <Lock className="h-8 w-8 text-muted-foreground" />;
      }
    };

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader className="text-center">
          {getTierIcon(requiredTier)}
          <CardTitle className="mt-4">
            {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {getUpgradeMessage(feature)}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/pro/subscription')} 
              className="w-full"
            >
              Upgrade Now
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};