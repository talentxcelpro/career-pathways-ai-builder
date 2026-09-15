import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationAnalyticsDashboard } from '@/components/admin/NotificationAnalyticsDashboard';
import { EmailAutomationOptimizer } from '@/components/admin/EmailAutomationOptimizer';
import { TestNotificationSender } from '@/components/notifications/TestNotificationSender';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { TXCTestButton } from '@/components/TXCTestButton';
import { Bell, Settings, BarChart3, Zap, Coins } from 'lucide-react';

export const TestingDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Testing Dashboard</h1>
        <p className="text-muted-foreground">
          Test all notification analytics and email automation features
        </p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="txc" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            TXC System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Test Rich Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <TestNotificationSender />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Notification Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationAnalyticsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Email Automation Optimizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmailAutomationOptimizer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationPreferences />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="txc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                TXC Token System Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <TXCTestButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};