import React from 'react';
import { ExecutiveMessenger } from '@/components/network/ExecutiveMessenger';

export const Messages: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background p-3 sm:p-6">
      <ExecutiveMessenger />
    </div>
  );
};

export default Messages;
