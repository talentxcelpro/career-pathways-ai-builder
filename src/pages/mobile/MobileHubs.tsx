import React from 'react';
import { Helmet } from 'react-helmet-async';
import { HubsList } from '@/components/hubs/HubsList';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileHubs: React.FC = () => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>TalentXcel Hubs - Mobile</title>
        <meta name="description" content="Discover and connect with organizations, colleges, and companies through TalentXcel Hubs on mobile." />
      </Helmet>
      
      <div className="h-full bg-background mobile-optimized">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">TalentXcel Hubs</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Connect with organizations, discover opportunities, and join communities.
          </p>
        </div>
        
        <div className="px-4">
          <HubsList />
        </div>
      </div>
    </>
  );
};