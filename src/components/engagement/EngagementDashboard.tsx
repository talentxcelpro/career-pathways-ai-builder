import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GamificationWidget } from './GamificationWidget';
import { NotificationCenter } from './NotificationCenter';
import { JobAlertsManager } from './JobAlertsManager';
import { ConnectionSuggestions } from './ConnectionSuggestions';
import { LearningProgress } from './LearningProgress';
import { 
  Bell, 
  Trophy, 
  Briefcase, 
  Users, 
  GraduationCap,
  Zap
} from 'lucide-react';

export const EngagementDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Engagement Center</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Trophy className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Job Alerts
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Users className="h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="learning" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Learning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <GamificationWidget />
            </div>
            <div className="lg:col-span-2">
              <NotificationCenter />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConnectionSuggestions />
            <JobAlertsManager />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="jobs">
          <JobAlertsManager />
        </TabsContent>

        <TabsContent value="network">
          <ConnectionSuggestions />
        </TabsContent>

        <TabsContent value="learning">
          <LearningProgress />
        </TabsContent>
      </Tabs>
    </div>
  );
};