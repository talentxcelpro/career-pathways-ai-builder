import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { AffiliateAdminCentre } from '@/components/admin/affiliate/AffiliateAdminCentre';

const AffiliateAdminPage: React.FC = () => (
  <UnifiedAdminLayout
    title="Affiliate Marketplace"
    description="Configure product commission rules, view real-time sales conversions, and manage partner disbursements."
  >
    <AffiliateAdminCentre />
  </UnifiedAdminLayout>
);

export default AffiliateAdminPage;
