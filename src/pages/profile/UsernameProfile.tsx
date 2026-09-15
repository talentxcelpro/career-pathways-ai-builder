import React from 'react';
import UniversalProfileRouteHandler from '@/components/profile/UniversalProfileRouteHandler';

/**
 * UsernameProfile delegator
 * Transparently delegates to UniversalProfileRouteHandler & SlugProfile
 * to ensure all slug, custom_profile_url, username, and full_name formats resolve seamlessly.
 */
export const UsernameProfile: React.FC = () => {
  return <UniversalProfileRouteHandler />;
};

export default UsernameProfile;