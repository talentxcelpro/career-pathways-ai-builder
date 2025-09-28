import React from 'react';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';

export const MobilePendingConnections: React.FC = () => {
  return (
    <MobileNavWrapper>
      <main className="p-4 native-app-style safe-area-top">
        <div className="native-card p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Pending Connections</h1>
          <p className="text-sm text-gray-600">No pending requests right now.</p>
        </div>
      </main>
    </MobileNavWrapper>
  );
};

export default MobilePendingConnections;
