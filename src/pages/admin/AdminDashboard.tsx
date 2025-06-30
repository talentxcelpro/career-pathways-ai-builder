
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { AdminNotifications } from '@/components/admin/AdminNotifications';
import { PlatformStatsCards } from '@/components/admin/dashboard/PlatformStatsCards';
import { PendingActionsCard } from '@/components/admin/dashboard/PendingActionsCard';
import { UserGrowthChart } from '@/components/admin/dashboard/UserGrowthChart';
import { RecentActivityCard } from '@/components/admin/dashboard/RecentActivityCard';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useUserGrowthData } from '@/hooks/useUserGrowthData';

const AdminDashboard = () => {
  const { data: stats } = useAdminStats();
  const { data: recentActivity } = useRecentActivity();
  const { data: userGrowthData } = useUserGrowthData();

  return (
    <UnifiedAdminLayout 
      title="Admin Dashboard" 
      description="Welcome back! Here's what's happening on TalentXcel."
    >
      <div className="space-y-8">
        <PlatformStatsCards stats={stats} />
        
        <PendingActionsCard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UserGrowthChart data={userGrowthData} />
          </div>

          <div className="space-y-6">
            <AdminNotifications />
            <RecentActivityCard activities={recentActivity} />
          </div>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AdminDashboard;
