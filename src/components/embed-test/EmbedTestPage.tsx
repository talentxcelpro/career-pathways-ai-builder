import React from 'react';
import { EmbedStatusCheck } from '@/components/feed/EmbedStatusCheck';

export const EmbedTestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Embed Test Page</h1>
          <p className="text-muted-foreground">
            Test and verify how different social media and content embeds work on TalentXcel.
          </p>
        </div>
        
        <EmbedStatusCheck />
      </div>
    </div>
  );
};