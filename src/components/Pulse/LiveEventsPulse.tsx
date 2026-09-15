import React from 'react';
import { AdvancedLiveEventsPulse } from "./AdvancedLiveEventsPulse";

interface LiveEventsPulseProps {
  variant?: 'full' | 'compact';
  maxItems?: number;
}

export const LiveEventsPulse: React.FC<LiveEventsPulseProps> = ({
  variant = 'full',
  maxItems = 20
}) => {
  return <AdvancedLiveEventsPulse variant={variant} maxItems={maxItems} />;
};
