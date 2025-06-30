
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { PlatformStatsCards } from '@/components/admin/dashboard/PlatformStatsCards';
import { UserGrowthChart } from '@/components/admin/dashboard/UserGrowthChart';
import { RecentActivityCard } from '@/components/admin/dashboard/RecentActivityCard';
import { PendingActionsCard } from '@/components/admin/dashboard/PendingActionsCard';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useUserGrowthData } from '@/hooks/useUserGrowthData';
import { useRecentActivity } from '@/hooks/useRecentActivity';

const AdminDashboard = () => {
  const { data: adminStats, isLoading: statsLoading } = useAdminStats();
  const { data: userGrowthData, isLoading: growthLoading } = useUserGrowthData();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();

  if (statsLoading || growthLoading || activityLoading) {
    return (
      <UnifiedAdminLayout 
        title="Admin Dashboard" 
        description="Platform overview and analytics"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </UnifiedAdminLayout>
    );
  }

  return (
    <UnifiedAdminLayout 
      title="Admin Dashboard" 
      description="Platform overview and analytics"
    >
      <div className="space-y-8">
        <PlatformStatsCards stats={adminStats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UserGrowthChart data={userGrowthData} />
          <RecentActivityCard activities={recentActivity} />
        </div>

        <PendingActionsCard stats={adminStats} />
      </div>
    </UnifiedAdminLayout>
  );
};

export default AdminDashboard;
