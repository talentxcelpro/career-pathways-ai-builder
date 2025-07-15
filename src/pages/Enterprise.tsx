import React from 'react';
import { EnterpriseGuard } from '@/components/enterprise/EnterpriseGuard';
import { EnterpriseLayout } from '@/components/enterprise/EnterpriseLayout';
import { EnterpriseDashboard } from '@/components/enterprise/EnterpriseDashboard';

export const Enterprise: React.FC = () => {
  return (
    <EnterpriseGuard>
      <EnterpriseLayout>
        <EnterpriseDashboard />
      </EnterpriseLayout>
    </EnterpriseGuard>
  );
};