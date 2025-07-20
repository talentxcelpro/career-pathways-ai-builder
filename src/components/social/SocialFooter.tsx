import React from 'react';
import { SocialConnect } from './SocialConnect';

export const SocialFooter: React.FC = () => {
  return (
    <div className="bg-muted/30 py-8 px-4">
      <div className="container mx-auto">
        <SocialConnect
          title="Stay Connected"
          description="Follow TalentXcel for the latest career opportunities, industry insights, and professional development tips"
          variant="default"
          size="md"
        />
      </div>
    </div>
  );
};