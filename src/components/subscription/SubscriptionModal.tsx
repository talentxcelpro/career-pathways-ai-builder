import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const { plans, loading, subscribeToPlan, getSubscriptionTier } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setProcessing(true);
    setSelectedPlan(planId);
    
    try {
      const success = await subscribeToPlan(planId);
      if (success) {
        onClose();
      }
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Elite')) return <Crown className="w-5 h-5" />;
    if (planName.includes('Business')) return <Star className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('Elite')) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (planName.includes('Business')) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    return 'bg-gradient-to-r from-green-500 to-teal-500';
  };

  const currentTier = getSubscriptionTier();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Pro Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
                plan.name === 'Pro Business' ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              {plan.name === 'Pro Business' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <div className="text-center mb-4">
                <div className={`w-12 h-12 rounded-full ${getPlanColor(plan.name)} flex items-center justify-center mx-auto mb-3`}>
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={processing || loading || currentTier === plan.name}
                className="w-full"
                variant={currentTier === plan.name ? "outline" : "default"}
              >
                {processing && selectedPlan === plan.id ? (
                  "Processing..."
                ) : currentTier === plan.name ? (
                  "Current Plan"
                ) : (
                  `Subscribe to ${plan.name}`
                )}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Why Go Pro?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>• Enhanced professional profile visibility</div>
            <div>• Priority customer support</div>
            <div>• Advanced analytics and insights</div>
            <div>• Lead generation tools</div>
            <div>• Custom branding options (Elite)</div>
            <div>• Vanity URLs (Elite)</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};