import React from 'react';
import { RealtimeDemo } from '@/components/realtime/RealtimeDemo';

const RealtimeDemoPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            TalentXcel Real-time System
          </h1>
          <p className="text-lg text-muted-foreground">
            Experience live updates across all TalentXcel modules
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RealtimeDemo />
          
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">How it works</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <p>Universal realtime system monitors all TalentXcel tables</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <p>Changes are instantly broadcast to all connected users</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <p>Components auto-refresh without page reload</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                  <p>Works across Jobs, Network, Messages, Profile, etc.</p>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-4">Try these actions</h3>
              <div className="space-y-2 text-sm">
                <p>• Open multiple tabs and create a post</p>
                <p>• Update your profile in another tab</p>
                <p>• Apply to a job or bookmark a college</p>
                <p>• Send a connection request</p>
                <p>• Watch the real-time events appear!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDemoPage;