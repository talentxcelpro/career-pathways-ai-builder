import React from 'react';
import { ConnectionsList } from './ConnectionsList';
import { ConnectionSuggestions } from './ConnectionSuggestions';

export const EnhancedConnections = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ConnectionsList />
      <ConnectionSuggestions />
    </div>
  );
};