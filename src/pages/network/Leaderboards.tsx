import React from 'react';
import { LeaderboardsWidget } from '@/components/gamification/LeaderboardsWidget';

const Leaderboards: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <LeaderboardsWidget />
    </div>
  );
};

export default Leaderboards;