import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Mail, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

interface RealTimeMetrics {
  emailsSentToday: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  bounceRate: number;
  unsubscribeRate: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

interface EmailActivity {
  id: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  email: string;
  template: string;
  timestamp: string;
  location?: string;
  device?: string;
}

interface TopPerformingTemplate {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export const RealTimeEmailAnalytics = () => {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    emailsSentToday: 0,
    emailsDelivered: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<EmailActivity[]>([]);
  const [topTemplates, setTopTemplates] = useState<TopPerformingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRealTimeMetrics();
    loadRecentActivity();
    loadTopTemplates();
    
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      loadRealTimeMetrics();
      loadRecentActivity();
    }, 10000);

    // Set up real-time subscription for email events
    const subscription = supabase
      .channel('email_analytics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'email_analytics' },
        () => {
          loadRealTimeMetrics();
          loadRecentActivity();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const loadRealTimeMetrics = async () => {
    try {
      // Mock real-time metrics - in real implementation, this would come from email_analytics table
      const mockMetrics: RealTimeMetrics = {
        emailsSentToday: 12456,
        emailsDelivered: 12100,
        emailsOpened: 5890,
        emailsClicked: 1834,
        bounceRate: 2.8,
        unsubscribeRate: 0.3,
        deliveryRate: 97.1,
        openRate: 48.7,
        clickRate: 31.1
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
    }
    setLoading(false);
  };

  const loadRecentActivity = async () => {
    try {
      // Mock recent email activity
      const mockActivity: EmailActivity[] = [
        {
          id: '1',
          type: 'clicked',
          email: 'user@example.com',
          template: 'Weekly Newsletter',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          location: 'New York, US',
          device: 'Mobile'
        },
        {
          id: '2',
          type: 'opened',
          email: 'customer@domain.com',
          template: 'Welcome Email',
          timestamp: new Date(Date.now() - 45000).toISOString(),
          location: 'London, UK',
          device: 'Desktop'
        },
        {
          id: '3',
          type: 'delivered',
          email: 'lead@company.com',
          template: 'Product Update',
          timestamp: new Date(Date.now() - 60000).toISOString(),
        },
        {
          id: '4',
          type: 'sent',
          email: 'subscriber@email.com',
          template: 'Monthly Report',
          timestamp: new Date(Date.now() - 90000).toISOString(),
        },
        {
          id: '5',
          type: 'bounced',
          email: 'invalid@nonexistent.com',
          template: 'Welcome Email',
          timestamp: new Date(Date.now() - 120000).toISOString(),
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const loadTopTemplates = async () => {
    try {
      // Mock top performing templates
      const mockTemplates: TopPerformingTemplate[] = [
        {
          name: 'Weekly Newsletter',
          sent: 5000,
          opened: 2850,
          clicked: 912,
          openRate: 57.0,
          clickRate: 32.0
        },
        {
          name: 'Welcome Email',
          sent: 3200,
          opened: 1856,
          clicked: 445,
          openRate: 58.0,
          clickRate: 24.0
        },
        {
          name: 'Product Update',
          sent: 2800,
          opened: 1204,
          clicked: 361,
          openRate: 43.0,
          clickRate: 30.0
        },
        {
          name: 'Monthly Report',
          sent: 1500,
          opened: 675,
          clicked: 162,
          openRate: 45.0,
          clickRate: 24.0
        }
      ];
      
      setTopTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading top templates:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      sent: Mail,
      delivered: CheckCircle,
      opened: Eye,
      clicked: MousePointer,
      bounced: AlertTriangle,
      unsubscribed: TrendingUp
    };
    
    const IconComponent = icons[type as keyof typeof icons] || Mail;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      sent: 'text-blue-600',
      delivered: 'text-green-600',
      opened: 'text-purple-600',
      clicked: 'text-orange-600',
      bounced: 'text-red-600',
      unsubscribed: 'text-gray-600'
    };
    
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Real-time Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Emails Sent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emailsSentToday.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +12% vs yesterday
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deliveryRate}%</div>
            <Progress value={metrics.deliveryRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.openRate}%</div>
            <Progress value={metrics.openRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.clickRate}%</div>
            <Progress value={metrics.clickRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Live Activity</TabsTrigger>
          <TabsTrigger value="performance">Template Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Real-time Email Activity
              </CardTitle>
              <CardDescription>
                Live feed of email interactions as they happen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={getActivityColor(activity.type)}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <div className="font-medium">
                          {activity.email} {activity.type} "{activity.template}"
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.location && `${activity.location} • `}
                          {activity.device && `${activity.device} • `}
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Performing Templates
              </CardTitle>
              <CardDescription>
                Email templates ranked by engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTemplates.map((template, index) => (
                  <div key={template.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{template.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {template.sent.toLocaleString()} sent
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Open Rate</span>
                          <span>{template.openRate}%</span>
                        </div>
                        <Progress value={template.openRate} className="h-1" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Click Rate</span>
                          <span>{template.clickRate}%</span>
                        </div>
                        <Progress value={template.clickRate} className="h-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="text-sm font-medium text-red-600">{metrics.bounceRate}%</span>
                </div>
                <Progress value={metrics.bounceRate} className="h-1" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unsubscribe Rate</span>
                  <span className="text-sm font-medium text-yellow-600">{metrics.unsubscribeRate}%</span>
                </div>
                <Progress value={metrics.unsubscribeRate} className="h-1" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Peak Activity Time</span>
                    <span className="font-medium">2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Day</span>
                    <span className="font-medium">Tuesday</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Device</span>
                    <span className="font-medium">Mobile (67%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Reading Time</span>
                    <span className="font-medium">2m 34s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-900">Optimize Send Times</div>
                  <div className="text-sm text-blue-700">
                    Your audience is most active between 2-4 PM. Consider scheduling campaigns during this window for +15% better engagement.
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-900">Template Recommendation</div>
                  <div className="text-sm text-green-700">
                    "Weekly Newsletter" template shows 32% higher click rates. Consider using similar design patterns for other campaigns.
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="font-medium text-orange-900">Subject Line Optimization</div>
                  <div className="text-sm text-orange-700">
                    Subject lines with 6-10 words show 21% higher open rates. Current average is 12 words.
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