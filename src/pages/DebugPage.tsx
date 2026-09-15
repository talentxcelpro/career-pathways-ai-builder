import React from 'react';
import { DataDebuggingPanel } from '@/components/debug/DataDebuggingPanel';
import { PostsDebugPulse } from '@/components/Pulse/PostsDebugPulse';

const DebugPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug CommandCenter</h1>
        <p className="text-gray-600">
          Troubleshoot data fetching, caching, and real-time issues
        </p>
      </div>
      
      <DataDebuggingPanel />
      <PostsDebugPulse />
    </div>
  );
};

export default DebugPage;

