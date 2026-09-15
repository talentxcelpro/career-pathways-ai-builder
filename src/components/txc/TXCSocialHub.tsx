import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TXCLeaderboard } from './TXCLeaderboard';
import { TXCLiveActivity } from './TXCLiveActivity';
import { TXCMiningDashboard } from './TXCMiningDashboard';
// import TXCAdvancedAnalytics from './TXCAdvancedAnalytics';
import TXCMobileOptimized from './TXCMobileOptimized';
import TXCSecurityManager from './TXCSecurityManager';
import TXCSystemStatus from './TXCSystemStatus';
import { Trophy, Activity, Users, TrendingUp, Zap, BarChart3, Shield, Server } from 'lucide-react';

interface TXCSocialHubProps {
  className?: string;
}

export const TXCSocialHub: React.FC<TXCSocialHubProps> = ({ className = '' }) => {
  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">TXC Social Hub</h1>
        <p className="text-muted-foreground">
          Connect with the TXC community, track leaderboards, and see real-time activity
        </p>
      </div>

      <Tabs defaultValue="mobile" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            TXC Hub
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-6">
          <TXCMobileOptimized />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <TXCLiveActivity />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="font-mono font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Daily Transactions</span>
                    <span className="font-mono font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TXC Circulating</span>
                    <span className="font-mono font-medium">2.4M</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">AI Tools</span>
                    <span className="text-sm font-medium text-green-600">↗ 23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Job Applications</span>
                    <span className="text-sm font-medium text-green-600">↗ 15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mining</span>
                    <span className="text-sm font-medium text-blue-600">→ 8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    <span>New mining milestone reached</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-blue-500" />
                    <span>Community goal achieved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-green-500" />
                    <span>Daily active users record</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <TXCLeaderboard />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            Advanced Analytics - Coming Soon
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <TXCSecurityManager />
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <TXCSystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};