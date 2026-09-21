import React from 'react';

/**
 * PlatformGlobalAutoRefresher - Deactivated
 * Previously refetched active queries every 3 seconds, which caused excessive Supabase egress (138% of monthly quota).
 * Now completely disabled. Views refresh on-demand, on mutations, or via Supabase Realtime channels.
 */
export const PlatformGlobalAutoRefresher: React.FC = () => {
  return null;
};
