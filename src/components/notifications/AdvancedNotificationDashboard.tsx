import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  TrendingUp, 
  Clock, 
  Users, 
  Briefcase, 
  Sparkles,
  Calendar,
  Target,
  Zap,
  BarChart3,
  Settings,
  TestTube2,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useComprehensivePushNotifications } from '@/hooks/useComprehensivePushNotifications';

interface NotificationAnalytics {
  totalSent: number;
  openRate: number;
  clickRate: number;
  bestTimeToSend: string;
  popularCategories: Array<{ name: string; count: number; color: string }>;
  weeklyTrend: Array<{ day: string; sent: number; opened: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
}

const mockAnalytics: NotificationAnalytics = {
  totalSent: 1247,
  openRate: 68.5,
  clickRate: 23.2,
  bestTimeToSend: '2:30 PM',
  popularCategories: [
    { name: 'Job Opportunities', count: 487, color: 'bg-blue-500' },
    { name: 'Career Growth', count: 324, color: 'bg-green-500' },
    { name: 'Social Interactions', count: 235, color: 'bg-purple-500' },
    { name: 'Skill Development', count: 156, color: 'bg-orange-500' },
    { name: 'Achievements', count: 89, color: 'bg-pink-500' }
  ],
  weeklyTrend: [
    { day: 'Mon', sent: 45, opened: 32 },
    { day: 'Tue', sent: 52, opened: 38 },
    { day: 'Wed', sent: 38, opened: 28 },
    { day: 'Thu', sent: 61, opened: 42 },
    { day: 'Fri', sent: 44, opened: 31 },
    { day: 'Sat', sent: 23, opened: 18 },
    { day: 'Sun', sent: 19, opened: 14 }
  ],
  deviceBreakdown: [
    { device: 'Mobile', percentage: 67 },
    { device: 'Desktop', percentage: 28 },
    { device: 'Tablet', percentage: 5 }
  ]
};

export const AdvancedNotificationDashboard: React.FC = () => {
  const { 
    preferences, 
    sendComprehensiveNotification, 
    templates 
  } = useComprehensivePushNotifications();
  
  const [analytics] = useState<NotificationAnalytics>(mockAnalytics);
  const [isTestSending, setIsTestSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const sendTestNotification = async (templateType: string) => {
    setIsTestSending(true);
    try {
      await sendComprehensiveNotification(templateType, {
        test: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Test notification failed:', error);
    } finally {
      setIsTestSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Analytics</h2>
          <p className="text-muted-foreground">
            Insights into your notification performance and user engagement
          </p>
        </div>
        <Button className="gap-2">
          <Settings className="h-4 w-4" />
          Advanced Settings
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                  <p className="text-2xl font-bold">{analytics.totalSent.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12.5%</span>
                <span className="text-muted-foreground ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                  <p className="text-2xl font-bold">{analytics.openRate}%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <Progress value={analytics.openRate} className="mt-4" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                  <p className="text-2xl font-bold">{analytics.clickRate}%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <Progress value={analytics.clickRate} className="mt-4" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Time</p>
                  <p className="text-2xl font-bold">{analytics.bestTimeToSend}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Optimal sending time for your audience
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.popularCategories.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.weeklyTrend.map((day, index) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="font-medium">{day.day}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span>{day.sent} sent</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>{day.opened} opened</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Device Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.deviceBreakdown.map((device, index) => (
                    <motion.div
                      key={device.device}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{device.device}</span>
                        <span>{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-2">🎯 Optimization Tip</p>
                    <p className="text-sm">
                      Your open rates are 15% higher on Thursdays. Consider scheduling important 
                      notifications for Thursday afternoons.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-700 mb-2">✨ Success Pattern</p>
                    <p className="text-sm text-green-600">
                      Job opportunity notifications have a 34% higher click rate when sent 
                      with personalized skill matching.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-medium text-blue-700 mb-2">📈 Growth Opportunity</p>
                    <p className="text-sm text-blue-600">
                      Users engage 2x more with notifications that include actionable career steps.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage and customize your notification templates
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.slice(0, 9).map((template, index) => (
                  <motion.div
                    key={template.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant={template.priority === 'high' ? 'destructive' : 
                                         template.priority === 'medium' ? 'default' : 'secondary'}>
                            {template.priority}
                          </Badge>
                          <div className="flex gap-1">
                            {template.channels.map((channel) => (
                              <div
                                key={channel}
                                className="w-2 h-2 rounded-full bg-primary"
                                title={channel}
                              />
                            ))}
                          </div>
                        </div>
                        <h4 className="font-medium mb-2">{template.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {template.message}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => sendTestNotification(template.type)}
                            disabled={isTestSending}
                          >
                            Test
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="h-5 w-5" />
                Notification Testing Lab
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test different notification types and analyze their performance
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Tests</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'welcome', label: 'Welcome Message', color: 'bg-green-500' },
                      { type: 'job_match', label: 'Job Match Alert', color: 'bg-blue-500' },
                      { type: 'profile_completion', label: 'Profile Reminder', color: 'bg-orange-500' },
                      { type: 'achievement', label: 'Achievement Unlock', color: 'bg-purple-500' }
                    ].map((test) => (
                      <Button
                        key={test.type}
                        variant="outline"
                        className="w-full justify-start gap-3"
                        onClick={() => sendTestNotification(test.type)}
                        disabled={isTestSending}
                      >
                        <div className={`w-3 h-3 rounded-full ${test.color}`} />
                        {test.label}
                        {isTestSending && selectedTemplate === test.type && (
                          <div className="ml-auto">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">A/B Testing</h4>
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Enable A/B Testing</span>
                      <Switch />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Test different notification variations to optimize engagement
                    </div>
                    <Button className="w-full" variant="outline">
                      Create A/B Test Campaign
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Test Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">92%</div>
                      <div className="text-sm text-muted-foreground">Delivery Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">67%</div>
                      <div className="text-sm text-muted-foreground">Open Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">24%</div>
                      <div className="text-sm text-muted-foreground">Click Rate</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Smart Automation
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-powered notification automation based on user behavior
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Active Automations</h4>
                  {[
                    {
                      name: 'Welcome Series',
                      description: 'Onboard new users with a 7-day sequence',
                      status: 'active',
                      triggers: 156
                    },
                    {
                      name: 'Re-engagement Campaign',
                      description: 'Bring back inactive users with personalized content',
                      status: 'active',
                      triggers: 89
                    },
                    {
                      name: 'Job Match Alerts',
                      description: 'Instant notifications for perfect job matches',
                      status: 'active',
                      triggers: 234
                    }
                  ].map((automation, index) => (
                    <motion.div
                      key={automation.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">{automation.name}</h5>
                        <Badge variant="outline" className="text-green-600">
                          {automation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {automation.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {automation.triggers} triggers this week
                        </span>
                        <Button size="sm" variant="ghost">
                          Configure
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Create New Automation</h4>
                  <div className="space-y-3">
                    {[
                      'Profile Completion Reminder',
                      'Skill Assessment Follow-up',
                      'Connection Request Series',
                      'Career Milestone Celebration',
                      'Weekly Digest Summary'
                    ].map((automation) => (
                      <Button
                        key={automation}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {automation}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};