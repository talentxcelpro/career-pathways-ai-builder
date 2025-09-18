import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Check, Star } from 'lucide-react';
import { TXCPricingTier, formatTXC } from '@/types/txc-pricing';
import { useTXCPurchase } from '@/hooks/useTXCPurchase';

interface TXCPricingCardProps {
  tier: TXCPricingTier;
  onPurchase?: (tier: TXCPricingTier) => void;
  className?: string;
}

export const TXCPricingCard: React.FC<TXCPricingCardProps> = ({
  tier,
  onPurchase,
  className = ""
}) => {
  const { purchaseFeature, canAfford, isProcessing } = useTXCPurchase();

  const handlePurchase = async () => {
    if (onPurchase) {
      onPurchase(tier);
      return;
    }

    const success = await purchaseFeature(
      tier.id,
      tier.name,
      {
        duration: tier.duration,
        features: tier.features
      }
    );

    if (success) {
      // Handle successful purchase (e.g., refresh page, show success state)
      console.log('Purchase successful for:', tier.name);
    }
  };

  const getDurationText = (duration: string) => {
    switch (duration) {
      case 'monthly':
        return '/month';
      case 'yearly':
        return '/year';
      case 'one-time':
        return 'one-time';
      default:
        return '';
    }
  };

  return (
    <Card className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''} ${className}`}>
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Coins className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold text-primary">
            {formatTXC(tier.cost)}
          </span>
          <span className="text-sm text-muted-foreground">
            {getDurationText(tier.duration)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handlePurchase}
          disabled={!canAfford(tier.cost) || isProcessing}
          className="w-full"
          variant={tier.popular ? 'default' : 'outline'}
        >
          {isProcessing ? (
            'Processing...'
          ) : !canAfford(tier.cost) ? (
            'Insufficient TXC'
          ) : (
            `Purchase for ${formatTXC(tier.cost)}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};