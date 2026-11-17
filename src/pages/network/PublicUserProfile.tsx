import React from 'react';
import UniversalProfileRouteHandler from '@/components/profile/UniversalProfileRouteHandler';

/**
 * Legacy PublicUserProfile proxy.
 * Safely delegates all /p/:id and /p/:username routing directly to UniversalProfileRouteHandler,
 * ensuring 100% profile resolution without 404s across all registered users.
 */
const PublicUserProfile: React.FC = () => {
  return <UniversalProfileRouteHandler />;
};

export default PublicUserProfile;
