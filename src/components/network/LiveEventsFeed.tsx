import React from 'react';
import { AdvancedLiveEventsFeed } from "./AdvancedLiveEventsFeed";

interface LiveEventsFeedProps {
  variant?: 'full' | 'compact';
  maxItems?: number;
}

export const LiveEventsFeed: React.FC<LiveEventsFeedProps> = ({
  variant = 'full',
  maxItems = 20
}) => {
  return <AdvancedLiveEventsFeed variant={variant} maxItems={maxItems} />;
};