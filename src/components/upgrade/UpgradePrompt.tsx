import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Check, ArrowRight } from 'lucide-react';
import { useTieredAccess } from '@/hooks/useTieredAccess';
import { useNavigate } from 'react-router-dom';
import { AccessTier } from '@/types/access';

interface UpgradePromptProps {
  feature: string;
  requiredTier: AccessTier;
  currentUsage?: number;
  limit?: number;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  requiredTier,
  currentUsage,
  limit
}) => {
  const { currentTier, availableBalance } = useTieredAccess();
  const navigate = useNavigate();

  const getTierFeatures = (tier: AccessTier) => {
    switch (tier) {
      case 'pro':
        return [
          '50 AI requests daily',
          '100 job applications/month',
          '15 resume templates',
          'Advanced analytics',
          'Priority support',
          'Custom branding'
        ];
      case 'enterprise':
        return [
          'Unlimited AI requests',
          'Unlimited job applications',
          'All resume templates',
          'Advanced analytics',
          'Priority 24/7 support',
          'Custom branding',
          'API access',
          'Team management'
        ];
      default:
        return [
          '5 AI requests daily',
          '10 job applications/month',
          '3 resume templates',
          'Basic support'
        ];
    }
  };

  const getTierIcon = (tier: AccessTier) => {
    switch (tier) {
      case 'pro':
        return <Crown className="h-6 w-6 text-amber-500" />;
      case 'enterprise':
        return <Star className="h-6 w-6 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTierPrice = (tier: AccessTier) => {
    switch (tier) {
      case 'pro':
        return '₹999/month';
      case 'enterprise':
        return 'Contact Sales';
      default:
        return 'Free';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Usage Warning */}
      {currentUsage !== undefined && limit !== undefined && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Current Usage</span>
              <Badge variant="outline">
                {currentUsage} / {limit === -1 ? '∞' : limit}
              </Badge>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ 
                  width: limit === -1 ? '0%' : `${Math.min((currentUsage / limit) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-sm text-amber-700 mt-2">
              You've reached your {feature} limit for the {currentTier} tier.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {requiredTier === 'pro' && (
          <Card className="relative border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTierIcon('pro')}
                  <CardTitle>Pro Plan</CardTitle>
                </div>
                <Badge className="bg-amber-100 text-amber-800">
                  Most Popular
                </Badge>
              </div>
              <p className="text-2xl font-bold">{getTierPrice('pro')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {getTierFeatures('pro').map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full"
                onClick={() => navigate('/pro/subscription')}
              >
                Upgrade to Pro
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="relative border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              {getTierIcon('enterprise')}
              <CardTitle>Enterprise Plan</CardTitle>
            </div>
            <p className="text-2xl font-bold">{getTierPrice('enterprise')}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {getTierFeatures('enterprise').slice(0, 6).map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};