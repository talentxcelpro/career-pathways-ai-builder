import React from 'react';
import { NetworkSponsoredCard } from './NetworkSponsoredCard';
import { NetworkQuickActions } from './NetworkQuickActions';
import { Badge } from "@/components/ui/badge";

export const NetworkRightSidebar = () => {
  return (
    <div className="space-y-4">
      {/* Sponsored Badge */}
      <div className="text-center">
        <Badge variant="secondary" className="text-xs px-3 py-1">
          Sponsored
        </Badge>
      </div>
      
      {/* Sponsored Cards */}
      <div className="space-y-4">
        <NetworkSponsoredCard
          title="Boost Your Career with Pro"
          description="Unlock premium features, priority support, and exclusive networking opportunities."
          buttonText="Upgrade Now"
          buttonColor="bg-gradient-to-br from-green-400 to-green-600"
          badge="Popular"
          badgeColor="bg-yellow-400 text-yellow-900"
        />
        
        <NetworkSponsoredCard
          title="Find Your Dream Job"
          description="Browse thousands of job opportunities from top companies."
          buttonText="Browse Jobs"
          buttonColor="bg-gradient-to-br from-blue-500 to-purple-600"
          badge="New"
          badgeColor="bg-blue-400 text-blue-900"
        />
        
        <NetworkSponsoredCard
          title="Skill Assessment"
          description="Take our AI-powered skill assessment and get personalized recommendations."
          buttonText="Start Assessment"
          buttonColor="bg-gradient-to-br from-orange-400 to-red-500"
        />
      </div>
      
      {/* Quick Actions */}
      <NetworkQuickActions />
    </div>
  );
};