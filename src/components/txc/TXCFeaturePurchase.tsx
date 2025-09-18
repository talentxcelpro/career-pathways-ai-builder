import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { formatTXC } from '@/types/txc-pricing';
import { useTXCPurchase } from '@/hooks/useTXCPurchase';

interface TXCFeaturePurchaseProps {
  featureId: string;
  featureName: string;
  cost: number;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export const TXCFeaturePurchase: React.FC<TXCFeaturePurchaseProps> = ({
  featureId,
  featureName,
  cost,
  description,
  onSuccess,
  onError,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false
}) => {
  const { purchaseFeature, canAfford, isProcessing, availableBalance } = useTXCPurchase();

  const handlePurchase = async () => {
    const success = await purchaseFeature(
      featureId,
      description || featureName,
      { feature_name: featureName }
    );

    if (success) {
      onSuccess?.();
    } else {
      onError?.('Purchase failed. Please try again.');
    }
  };

  const isDisabled = disabled || isProcessing || !canAfford(cost);

  const getButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (!canAfford(cost)) {
      const needed = cost - availableBalance;
      return `Need ${formatTXC(needed)} more`;
    }
    return (
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4" />
        <span>Purchase for {formatTXC(cost)}</span>
      </div>
    );
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={className}
    >
      {getButtonText()}
    </Button>
  );
};