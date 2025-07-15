import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  LineChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Mail, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EmailTrackingFixer } from './EmailTrackingFixer';
import { EmailAnalyticsEngine } from './EmailAnalyticsEngine';
import { RobustEmailProcessor } from './RobustEmailProcessor';
import { EmailSystemHealthMonitor } from './EmailSystemHealthMonitor';
import { InstantAnalyticsRefresh } from './InstantAnalyticsRefresh';

interface EmailAnalytics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

interface DailyStats {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

interface EmailDetails {
  id: string;
  recipient_email: string;
  subject: string;
  status: string;
  trigger_type: string;
  created_at: string;
  sent_at: string;
  error_message?: string;
  delivery_events?: {
    delivered: boolean;
    opened: boolean;
    clicked: boolean;
    bounced: boolean;
  };
}

export const EmailAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<EmailAnalytics>({
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    failed: 0,
    pending: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [emailDetails, setEmailDetails] = useState<EmailDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7' | '30' | '90'>('7');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Use the new analytics engine for correct data correlation
      const { analytics, dailyStats, emailDetails } = await EmailAnalyticsEngine.fetchCorrectAnalytics(selectedTimeRange);
      
      setAnalytics(analytics);
      setDailyStats(dailyStats);
      setEmailDetails(emailDetails);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load email analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalytics = async () => {
    await EmailAnalyticsEngine.refreshAnalytics();
    await fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#f59e0b', '#ef4444', '#6b7280'];

  const pieData = [
    { name: 'Delivered', value: analytics.delivered, color: COLORS[0] },
    { name: 'Opened', value: analytics.opened, color: COLORS[1] },
    { name: 'Clicked', value: analytics.clicked, color: COLORS[2] },
    { name: 'Bounced', value: analytics.bounced, color: COLORS[4] },
    { name: 'Failed', value: analytics.failed, color: COLORS[5] },
  ].filter(item => item.value > 0);

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: { variant: 'default' as const, color: 'text-green-600', icon: CheckCircle },
      pending: { variant: 'secondary' as const, color: 'text-yellow-600', icon: Clock },
      failed: { variant: 'destructive' as const, color: 'text-red-600', icon: AlertTriangle },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive email delivery and engagement reports
          </p>
        </div>
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map((days) => (
            <Button
              key={days}
              variant={selectedTimeRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(days)}
            >
              {days} days
            </Button>
          ))}
          <Button onClick={handleRefreshAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
      </div>

      {/* System Health & Processing Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* System Health Monitor */}
        <EmailSystemHealthMonitor />
        
        {/* Robust Email Processor */}
        <RobustEmailProcessor onComplete={fetchAnalytics} />
        
        {/* Instant Analytics Refresh */}
        <InstantAnalyticsRefresh onComplete={fetchAnalytics} />
        
        {/* Email Tracking Fixer - only show if delivery rate is 0 */}
        {analytics.totalSent > 0 && analytics.deliveryRate === 0 && (
          <EmailTrackingFixer onComplete={fetchAnalytics} />
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-3xl font-bold text-primary">{analytics.totalSent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Delivery Rate: {analytics.deliveryRate.toFixed(1)}%
                </p>
              </div>
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-3xl font-bold text-green-600">{analytics.delivered}</p>
                <Progress value={analytics.deliveryRate} className="mt-2 h-2" />
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opened</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.opened}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Open Rate: {analytics.openRate.toFixed(1)}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicked</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.clicked}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click Rate: {analytics.clickRate.toFixed(1)}%
                </p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Email Trends</CardTitle>
            <CardDescription>Daily email delivery and engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" name="Sent" />
                <Line type="monotone" dataKey="delivered" stroke="#10b981" name="Delivered" />
                <Line type="monotone" dataKey="opened" stroke="#3b82f6" name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#8b5cf6" name="Clicked" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Email engagement distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Email Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Email Activity</CardTitle>
          <CardDescription>Detailed view of recent email deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Recipient</th>
                  <th className="text-left p-2">Subject</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Sent At</th>
                  <th className="text-left p-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {emailDetails.slice(0, 20).map((email) => (
                  <tr key={email.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">{email.recipient_email}</td>
                    <td className="p-2">{email.subject}</td>
                    <td className="p-2">
                      <Badge variant="outline">{email.trigger_type.replace('_', ' ')}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(email.status)}
                        {email.delivery_events && (
                          <div className="flex gap-1">
                            {email.delivery_events.delivered && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                ✓ Delivered
                              </Badge>
                            )}
                            {email.delivery_events.opened && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                👁 Opened
                              </Badge>
                            )}
                            {email.delivery_events.clicked && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                🖱 Clicked
                              </Badge>
                            )}
                            {email.delivery_events.bounced && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                                ↩ Bounced
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {email.sent_at ? new Date(email.sent_at).toLocaleString() : '-'}
                    </td>
                    <td className="p-2 text-sm text-red-600">
                      {email.error_message ? (
                        <span className="truncate max-w-xs block" title={email.error_message}>
                          {email.error_message}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {emailDetails.length > 20 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing 20 of {emailDetails.length} emails
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};