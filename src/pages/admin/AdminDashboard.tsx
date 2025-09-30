
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { PlatformStatsCards } from '@/components/admin/dashboard/PlatformStatsCards';
import { UserGrowthChart } from '@/components/admin/dashboard/UserGrowthChart';
import { RecentActivityCard } from '@/components/admin/dashboard/RecentActivityCard';
import { PendingActionsCard } from '@/components/admin/dashboard/PendingActionsCard';
import { RealtimeStatsWidget } from '@/components/admin/dashboard/RealtimeStatsWidget';
import { SystemHealthWidget } from '@/components/admin/dashboard/SystemHealthWidget';
import { QuickActionsPanel } from '@/components/admin/QuickActionsPanel';
import { PlatformOverviewWidget } from '@/components/admin/dashboard/PlatformOverviewWidget';
import EmailSystemTest from '@/components/admin/EmailSystemTest';
import { EmailQueueManager } from '@/components/admin/EmailQueueManager';
import ProfileReminderEmailSender from '@/components/admin/ProfileReminderEmailSender';
import { EmailNotificationTest } from '@/components/dashboard/EmailNotificationTest';
import { SimpleEmailTest } from '@/components/admin/SimpleEmailTest';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useUserGrowthData } from '@/hooks/useUserGrowthData';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import SystemHealthDashboard from '@/components/admin/SystemHealthDashboard';
import { RealisticJobGenerator } from '@/components/admin/RealisticJobGenerator';
import SocialTXCAwardPanel from '@/components/admin/SocialTXCAwardPanel';
import { JoiningBonusPanel } from '@/components/admin/JoiningBonusPanel';
import { VideoUrlFixer } from '@/components/admin/VideoUrlFixer';
import { AdminNavigationPanel } from '@/components/admin/AdminNavigationPanel';
import { QuickVideoFix } from '@/components/admin/QuickVideoFix';
import { VideoHealthMonitor } from '@/components/admin/VideoHealthMonitor';

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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <UserGrowthChart data={userGrowthData} />
          </div>
          <div className="space-y-6">
            <RealtimeStatsWidget stats={adminStats} />
            <SystemHealthWidget stats={adminStats} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <RecentActivityCard activities={recentActivity} />
            <QuickActionsPanel stats={adminStats} />
          </div>
          <div className="space-y-6">
            <PlatformOverviewWidget stats={adminStats} />
            <AdminNavigationPanel />
          </div>
        </div>

        {/* Video Management Panels */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <QuickVideoFix />
          <VideoHealthMonitor />
          <SocialTXCAwardPanel />
        </div>

        {/* Additional Admin Panels */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <JoiningBonusPanel />
        </div>

        {/* Realistic Job Generator - High Priority */}
        <div className="mt-8">
          <RealisticJobGenerator />
        </div>

        {/* Email System Test Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <EmailSystemTest />
          <EmailQueueManager />
          <EmailNotificationTest />
          <SimpleEmailTest />
        </div>
        
        <div className="mt-6">
          <ProfileReminderEmailSender />
        </div>
        
        {/* System Health Monitoring */}
        <SystemHealthDashboard />
      </div>
    </UnifiedAdminLayout>
  );
};

export default AdminDashboard;
