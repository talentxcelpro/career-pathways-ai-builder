import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentRecommendations } from '@/components/intelligent/ContentRecommendations';
import { SmartNotifications } from '@/components/intelligent/SmartNotifications';
import { OnlineUsersWidget } from '@/components/presence/OnlineUsersWidget';
import { EnhancedNotificationCenter } from '@/components/engagement/EnhancedNotificationCenter';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  Briefcase,
  Play,
  Bell,
  BarChart3,
  Activity,
  Target,
  Zap,
  Brain,
  Compass
} from 'lucide-react';

interface IntelligentDashboardProps {
  className?: string;
  currentModule?: 'reels' | 'network' | 'jobs' | 'profile';
}

export const IntelligentDashboard: React.FC<IntelligentDashboardProps> = ({
  className,
  currentModule = 'network'
}) => {
  const [activeTab, setActiveTab] = useState('recommendations');

  const getModuleStats = () => {
    // These would come from real analytics in production
    return {
      reels: {
        engagement: 87,
        views: 15420,
        trending: 12
      },
      network: {
        engagement: 92,
        connections: 847,
        trending: 8
      },
      jobs: {
        engagement: 78,
        matches: 23,
        trending: 5
      }
    };
  };

  const stats = getModuleStats();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Intelligence Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Content Match</span>
                <Badge variant="secondary" className="text-xs">
                  {stats[currentModule]?.engagement || 85}%
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats[currentModule]?.engagement || 85}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your content preferences are being learned
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Live Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Users</span>
                <Badge variant="secondary" className="text-xs">
                  247 online
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  High engagement period
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gradient">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Smart Targeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Relevance Score</span>
                <Badge variant="secondary" className="text-xs">
                  94%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommendations improving daily
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Intelligence Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations" className="text-xs">
            <Compass className="h-3 w-3 mr-1" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">
            <Bell className="h-3 w-3 mr-1" />
            Smart Alerts
          </TabsTrigger>
          <TabsTrigger value="presence" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            Live Users
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Engagement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ContentRecommendations 
              module="reels" 
              maxItems={4}
              className="lg:col-span-1"
            />
            <ContentRecommendations 
              module="network" 
              maxItems={4}
              className="lg:col-span-1"
            />
            <ContentRecommendations 
              module="jobs" 
              maxItems={4}
              className="lg:col-span-1"
            />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SmartNotifications maxItems={8} />
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Notification Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Click Rate</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Relevance Score</span>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Today's Notifications</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Bell className="h-3 w-3 mr-2" />
                      Manage Notification Settings
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Target className="h-3 w-3 mr-2" />
                      Update Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presence" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <OnlineUsersWidget 
              maxUsers={12}
              showModule={true}
              currentModule={currentModule}
            />
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Peak Hours</span>
                      <span className="font-medium">9-11 AM, 6-8 PM</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Most Active Module</span>
                      <Badge variant="secondary">Network</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Engagement Rate</span>
                      <span className="font-medium text-green-600">+23%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Module Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Play className="h-3 w-3 text-purple-500" />
                        <span className="text-xs">Reels</span>
                      </div>
                      <span className="text-xs font-medium">35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="text-xs">Network</span>
                      </div>
                      <span className="text-xs font-medium">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3 text-green-500" />
                        <span className="text-xs">Jobs</span>
                      </div>
                      <span className="text-xs font-medium">20%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <EnhancedNotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};