import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Calendar, CreditCard, Crown, Star, Zap, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionModal } from './SubscriptionModal';

export const SubscriptionManagement = () => {
  const { subscription, loading, cancelSubscription, getSubscriptionTier, isActive } = useSubscription();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilRenewal = () => {
    if (!subscription) return 0;
    const renewalDate = new Date(subscription.current_period_end);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getRenewalProgress = () => {
    if (!subscription) return 0;
    const startDate = new Date(subscription.current_period_start);
    const endDate = new Date(subscription.current_period_end);
    const today = new Date();
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('Elite')) return <Crown className="w-5 h-5" />;
    if (planName.includes('Business')) return <Star className="w-5 h-5" />;
    return <Zap className="w-5 h-5" />;
  };

  const getPlanColor = (planName: string) => {
    if (planName.includes('Elite')) return 'from-purple-500 to-pink-500';
    if (planName.includes('Business')) return 'from-blue-500 to-indigo-500';
    return 'from-green-500 to-teal-500';
  };

  const currentTier = getSubscriptionTier();
  const daysUntilRenewal = getDaysUntilRenewal();
  const renewalProgress = getRenewalProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Subscription Management</h2>
        {!isActive() && (
          <Button onClick={() => setShowUpgradeModal(true)}>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        )}
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription && isActive() ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getPlanColor(subscription.subscription_plans.name)} flex items-center justify-center`}>
                    {getPlanIcon(subscription.subscription_plans.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{subscription.subscription_plans.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ₹{subscription.subscription_plans.price}/month
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Billing period</span>
                  <span>{daysUntilRenewal} days remaining</span>
                </div>
                <Progress value={renewalProgress} className="h-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Started: {formatDate(subscription.current_period_start)}</span>
                  <span>Renews: {formatDate(subscription.current_period_end)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  Change Plan
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your subscription? You'll lose access to all Pro features at the end of your current billing period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        disabled={cancelling}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                You're currently on the free plan. Upgrade to Pro to unlock premium features.
              </p>
              <Button onClick={() => setShowUpgradeModal(true)}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      {subscription && isActive() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Your Pro Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscription.subscription_plans.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No billing history available</p>
          </div>
        </CardContent>
      </Card>

      <SubscriptionModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
};