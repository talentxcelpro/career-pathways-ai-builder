import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { GrowthEngineAdminPanel } from '@/components/admin/GrowthEngineAdminPanel';

const GrowthEngineAdmin: React.FC = () => (
  <UnifiedAdminLayout
    title="Growth Engine"
    description="Platform-wide referral analytics, viral coefficient, mission stats and real leaderboard"
  >
    <GrowthEngineAdminPanel />
  </UnifiedAdminLayout>
);

export default GrowthEngineAdmin;
