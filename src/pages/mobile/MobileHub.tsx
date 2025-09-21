import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TalentXcelHub } from '@/components/hubs/TalentXcelHub';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileHub: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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
        <title>TalentXcel Hub - Mobile</title>
        <meta name="description" content="Explore opportunities and connect with the community through TalentXcel Hub on mobile." />
      </Helmet>
      
      <div className="h-full bg-background mobile-optimized">
        <TalentXcelHub />
      </div>
    </>
  );
};