
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';
import { useProSubscriptionStatus } from '@/hooks/useProSubscriptionStatus';
import EnhancedCreatePost from '@/components/posts/EnhancedCreatePost';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Posts = () => {
  const { user } = useAuth();
  const { hasEmployerAccess } = useEmployerAccess();
  const { hasActiveSubscription, loading: subscriptionLoading } = useProSubscriptionStatus();

  // Show setup services only if user has employer access but no active subscription
  const shouldShowSetupServices = hasEmployerAccess && !hasActiveSubscription && !subscriptionLoading;
  
  // Show pro banner if user has active subscription
  const shouldShowProBanner = hasActiveSubscription && !subscriptionLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">Network</h3>
              <p className="text-sm text-muted-foreground">Connect with professionals</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pro Welcome Banner - Show when subscription is active */}
          {shouldShowProBanner && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Welcome to Pro!</h3>
                    <p className="text-sm text-green-700">Your subscription is active and verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Setup Services Card - Show only when user has employer access but no active subscription */}
          {shouldShowSetupServices && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Set Up Your Professional Services</h3>
                      <p className="text-sm text-green-700">Complete your pro subscription to start offering services</p>
                    </div>
                  </div>
                  <Link to="/pro/pricing">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Get Pro
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Post */}
          <EnhancedCreatePost />

          {/* Post Feed */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">Recent Posts</h3>
              <p className="text-sm text-muted-foreground">Post feed coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          {/* Additional content can go here */}
        </div>
      </div>
    </div>
  );
};

export default Posts;
