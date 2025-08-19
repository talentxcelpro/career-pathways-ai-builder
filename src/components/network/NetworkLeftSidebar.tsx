import React from 'react';
import { NetworkProfileCard } from './NetworkProfileCard';
import { NetworkNavigation } from './NetworkNavigation';
import { NetworkStatsCard } from './NetworkStatsCard';

export const NetworkLeftSidebar = () => {
  return (
    <div className="space-y-4">
      <NetworkProfileCard />
      <NetworkNavigation />
      <NetworkStatsCard />
    </div>
  );
};