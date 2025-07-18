
import React from 'react';
import ServiceSetupForm from '@/components/marketplace/ServiceSetupForm';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureGating } from '@/hooks/useFeatureGating';
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate';

export default function PostService() {
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();
  const { checkFeatureAccess, canAddService, getServiceLimit } = useFeatureGating();

  // Check if user has access to create services
  const hasServiceAccess = checkFeatureAccess('create_services', false);
  const serviceLimit = getServiceLimit();
  
  // For now, we'll allow free users to create 1 service and paid users unlimited
  const canCreateService = user && (isActive() || !subscription);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to create services</h1>
          <p className="text-muted-foreground">You need to be logged in to become a service provider</p>
        </div>
      </div>
    );
  }

  if (!canCreateService) {
    return (
      <SubscriptionGate
        title="Become a Service Provider"
        description="Unlock the ability to create and manage professional services on TalentXcel"
        feature="service creation"
        currentTier={subscription?.subscription_plans?.name || 'Free'}
        requiredTier="Pro"
        benefits={[
          "Create unlimited services",
          "Featured service listings",
          "Advanced service analytics",
          "Priority customer support",
          "Custom service branding",
          "Portfolio showcase",
          "Direct client messaging",
          "Revenue tracking & reports"
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Your Service</h1>
          <p className="text-muted-foreground mt-2">
            Set up your professional service and start connecting with clients
          </p>
          {subscription && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Current Plan: <span className="font-semibold text-primary">{subscription.subscription_plans.name}</span>
                {serviceLimit > 0 && (
                  <span className="ml-2">• Service Limit: {serviceLimit}</span>
                )}
              </p>
            </div>
          )}
        </div>
        
        <ServiceSetupForm />
      </div>
    </div>
  );
}
