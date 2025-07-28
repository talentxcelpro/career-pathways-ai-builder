import React from 'react';
import { CareerHub } from './CareerHub';
import { PostCreation } from './PostCreation';
import { ConnectionRequests } from './ConnectionRequests';
import { ReferralNetworkAd } from '@/components/referral/ReferralNetworkAd';
import { AdvertisingSidebar } from './AdvertisingSidebar';
import Posts from '@/pages/network/Posts';

export const EnhancedConnections = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-gray-900">
      <div className="lg:col-span-2 space-y-4">
        {/* Career Hub */}
        <CareerHub />
        
        {/* Post Creation */}
        <PostCreation />
        
        {/* Connection Requests */}
        <ConnectionRequests />
        
        {/* Posts Feed */}
        <Posts feedType="all" />
      </div>
      
      <div className="space-y-4">
        <ReferralNetworkAd variant="sidebar" />
        <AdvertisingSidebar position="right" maxAds={3} />
      </div>
    </div>
  );
};