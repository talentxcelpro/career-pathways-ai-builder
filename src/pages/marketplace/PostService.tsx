
import React from 'react';
import EnhancedServiceForm from '@/components/marketplace/EnhancedServiceForm';
import { useAuth } from '@/contexts/AuthContext';
// TXC-based system - no subscription needed
import { useFeatureGating } from '@/hooks/useFeatureGating';
import { SubscriptionGate } from '@/components/subscription/SubscriptionGate';

export default function PostService() {
  const { user } = useAuth();
  // TXC system allows all users to create services
  const { checkFeatureAccess, canAddService, getServiceLimit } = useFeatureGating();

  // Check if user has access to create services
  const hasServiceAccess = checkFeatureAccess('create_services', false);
  const serviceLimit = getServiceLimit();
  
  // For now, we'll allow free users to create 1 service and paid users unlimited
  const canCreateService = !!user; // TXC system allows all users

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

  // TXC system allows service creation for all users

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Your Service</h1>
          <p className="text-muted-foreground mt-2">
            Set up your professional service and start connecting with clients
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">TXC Token System</span>
              <span className="ml-2">• Unlimited Services Available</span>
            </p>
          </div>
        </div>
        
        <EnhancedServiceForm 
          onCancel={() => window.history.back()}
          onSaved={() => window.location.href = '/pro/services'}
        />
      </div>
    </div>
  );
}
