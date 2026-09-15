import React from 'react';
import { EnterpriseGuard } from '@/components/enterprise/EnterpriseGuard';
import { EnterpriseLayout } from '@/components/enterprise/EnterpriseLayout';
import { EnterpriseCommandCenter } from '@/components/enterprise/EnterpriseDashboard';

export const Enterprise: React.FC = () => {
  return (
    <EnterpriseGuard>
      <EnterpriseLayout>
        <EnterpriseCommandCenter />
      </EnterpriseLayout>
    </EnterpriseGuard>
  );
};
