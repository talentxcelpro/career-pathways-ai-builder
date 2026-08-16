import React from 'react';
import { ExecutiveMessenger } from '@/components/network/ExecutiveMessenger';

export const Messages: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-slate-50 dark:bg-background p-2 sm:p-4">
      <ExecutiveMessenger />
    </div>
  );
};

export default Messages;
