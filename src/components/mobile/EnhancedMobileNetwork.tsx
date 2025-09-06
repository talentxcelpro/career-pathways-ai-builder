import React from 'react';
import { TalentXcelHeader } from './TalentXcelHeader';
import { TalentXcelFeed } from './TalentXcelFeed';
import { useIsMobile } from '@/hooks/use-mobile';

export const EnhancedMobileNetwork: React.FC = () => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">This view is optimized for mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <TalentXcelHeader />
      <div className="flex-1 overflow-y-auto">
        <TalentXcelFeed />
      </div>
    </div>
  );
};