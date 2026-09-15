import React from 'react';
import { ConnectionsList } from './ConnectionsList';
import { ConnectionSuggestions } from './ConnectionSuggestions';
import { PeopleToKnow } from './PeopleToKnow';
import { Users, UserPlus, Star } from 'lucide-react';

export const EnhancedConnections = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Network
        </h1>
        <p className="text-muted-foreground">
          Grow your professional network and discover meaningful connections
        </p>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - My Connections */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              My Connections
            </h2>
          </div>
          <div className="animate-fade-in">
            <ConnectionsList />
          </div>
        </div>

        {/* Middle Column - Suggested Connections */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <UserPlus className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Suggested Connections
            </h2>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <ConnectionSuggestions />
          </div>
        </div>

        {/* Right Column - People to Know */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Star className="h-5 w-5 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              People to Know
            </h2>
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <PeopleToKnow />
          </div>
        </div>
      </div>
    </div>
  );
};