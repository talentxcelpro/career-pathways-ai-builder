
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { BulkAdminCreationPanel } from '@/components/admin/BulkAdminCreationPanel';

const BulkAdminCreation = () => {
  return (
    <UnifiedAdminLayout 
      title="Bulk Super Admin Creation"
      description="Create multiple Super Admin accounts with Pro Elite subscriptions"
    >
      <div className="flex justify-center">
        <BulkAdminCreationPanel />
      </div>
    </UnifiedAdminLayout>
  );
};

export default BulkAdminCreation;
