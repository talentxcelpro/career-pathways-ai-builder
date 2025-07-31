import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ScrapedLogData {
  id: string;
  log_date: string;
  total_scraped: number;
  duplicates_removed: number;
  quality_approved: number;
  quality_rejected: number;
  source_success_rate: number;
  average_quality_score: number;
  processing_time_ms: number;
  errors_count: number;
  created_at: string;
}

interface SystemAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const JobAnalyticsDashboard: React.FC = () => {
  // Fetch scraper logs
  const { data: scrapedLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['scraper-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .order('log_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as ScrapedLogData[];
    }
  });

  // Fetch system alerts
  const { data: systemAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as SystemAlert[];
    }
  });

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (!scrapedLogs?.length) return null;

    const latest = scrapedLogs[0];
    const total7Days = scrapedLogs.slice(0, 7).reduce((sum, log) => sum + log.total_scraped, 0);
    const totalDuplicates7Days = scrapedLogs.slice(0, 7).reduce((sum, log) => sum + log.duplicates_removed, 0);
    const avgQuality7Days = scrapedLogs.slice(0, 7).reduce((sum, log) => sum + log.average_quality_score, 0) / Math.min(7, scrapedLogs.length);
    const duplicateRate = latest.total_scraped > 0 ? (latest.duplicates_removed / latest.total_scraped) * 100 : 0;

    return {
      todayScraped: latest.total_scraped,
      last7Days: total7Days,
      duplicateRate,
      avgQuality: avgQuality7Days,
      processingTime: latest.processing_time_ms,
      errorCount: latest.errors_count,
      totalDuplicates7Days
    };
  }, [scrapedLogs]);

  // Chart data preparation
  const chartData = React.useMemo(() => {
    if (!scrapedLogs?.length) return [];
    
    return scrapedLogs
      .slice(0, 14)
      .reverse()
      .map(log => ({
        date: new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scraped: log.total_scraped,
        duplicates: log.duplicates_removed,
        quality: log.average_quality_score,
        approved: log.quality_approved,
        rejected: log.quality_rejected
      }));
  }, [scrapedLogs]);

  // Quality distribution data
  const qualityDistribution = React.useMemo(() => {
    if (!scrapedLogs?.length) return [];
    
    const total7Days = scrapedLogs.slice(0, 7);
    const approved = total7Days.reduce((sum, log) => sum + log.quality_approved, 0);
    const rejected = total7Days.reduce((sum, log) => sum + log.quality_rejected, 0);
    const pending = total7Days.reduce((sum, log) => sum + (log.total_scraped - log.quality_approved - log.quality_rejected), 0);

    return [
      { name: 'Approved', value: approved, color: '#10B981' },
      { name: 'Rejected', value: rejected, color: '#EF4444' },
      { name: 'Pending', value: pending, color: '#F59E0B' }
    ];
  }, [scrapedLogs]);

  // Alert severity counts
  const alertCounts = React.useMemo(() => {
    if (!systemAlerts?.length) return { critical: 0, high: 0, medium: 0, low: 0 };
    
    const unresolved = systemAlerts.filter(alert => !alert.is_resolved);
    return {
      critical: unresolved.filter(a => a.severity === 'critical').length,
      high: unresolved.filter(a => a.severity === 'high').length,
      medium: unresolved.filter(a => a.severity === 'medium').length,
      low: unresolved.filter(a => a.severity === 'low').length
    };
  }, [systemAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'low_job_count': return <TrendingDown className="h-4 w-4" />;
      case 'high_duplicate_rate': return <Activity className="h-4 w-4" />;
      case 'quality_drop': return <XCircle className="h-4 w-4" />;
      case 'function_failure': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (logsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor scraping performance, quality metrics, and system health
          </p>
        </div>
        <Button onClick={() => refetchLogs()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.todayScraped}</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.last7Days} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duplicate Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.duplicateRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.totalDuplicates7Days} duplicates removed (7d)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.avgQuality.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">
                7-day average score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(summaryStats.processingTime / 1000)}s</div>
              <p className="text-xs text-muted-foreground">
                {summaryStats.errorCount} errors today
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jobs Scraped Trend</CardTitle>
            <CardDescription>Daily job scraping volume over the last 2 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="scraped" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Jobs Scraped"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="duplicates" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Duplicates"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Assessment</CardTitle>
            <CardDescription>AI-powered job quality distribution (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {qualityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
            {alertCounts.critical > 0 && (
              <Badge variant="destructive">{alertCounts.critical} Critical</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Recent system alerts and health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemAlerts && systemAlerts.length > 0 ? (
            <div className="space-y-3">
              {systemAlerts.slice(0, 10).map((alert) => (
                <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-500' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.alert_type)}
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge variant={alert.is_resolved ? "secondary" : "outline"}>
                            {alert.is_resolved ? "Resolved" : "Active"}
                          </Badge>
                        </div>
                        <AlertDescription>{alert.message}</AlertDescription>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No system alerts. Everything is running smoothly!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};