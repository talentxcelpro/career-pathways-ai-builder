import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Play, Pause, RotateCcw, TrendingUp, AlertCircle, Zap, Target, Filter } from 'lucide-react';
import { 
  useScrapingStats, 
  useJobSources, 
  useJobQualityAnalysis, 
  useScrapingErrors, 
  useScrapingSchedule,
  useTriggerScraping,
  useCleanupExpiredJobs
} from '@/hooks/useAdvancedJobScraper';
import { formatDistanceToNow } from 'date-fns';

// ============= PHASE 4: ADVANCED MONITORING DASHBOARD =============

export const AdvancedJobScrapingDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { 
    data: scrapingData, 
    isLoading: statsLoading, 
    refetch: refetchStats 
  } = useScrapingStats(selectedTimeframe);

  const { 
    data: sources, 
    isLoading: sourcesLoading 
  } = useJobSources();

  const { 
    data: qualityAnalysis, 
    isLoading: qualityLoading 
  } = useJobQualityAnalysis();

  const { 
    data: errors, 
    isLoading: errorsLoading 
  } = useScrapingErrors();

  const { 
    data: schedule, 
    isLoading: scheduleLoading 
  } = useScrapingSchedule();

  const triggerScraping = useTriggerScraping();
  const cleanupJobs = useCleanupExpiredJobs();

  const stats = scrapingData?.stats;
  const logs = scrapingData?.logs || [];

  // Real-time status indicators
  const getSystemStatus = () => {
    if (!stats) return 'unknown';
    if (stats.errors_count > 10) return 'critical';
    if (stats.success_rate < 70) return 'warning';
    if (stats.success_rate >= 90) return 'excellent';
    return 'good';
  };

  const statusColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    unknown: 'bg-gray-500'
  };

  return (
    <div className="space-y-6">
      {/* ============= SYSTEM STATUS HEADER ============= */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold">Advanced Job Scraping System</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[getSystemStatus()]} animate-pulse`} />
            <span className="text-sm font-medium capitalize">{getSystemStatus()} Status</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoRefresh ? 'Pause' : 'Resume'} Auto-refresh</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ============= QUICK ACTIONS ============= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button
          onClick={() => triggerScraping.mutate({ limit: 100 })}
          disabled={triggerScraping.isPending}
          className="flex items-center justify-center space-x-2 h-16"
        >
          <Zap className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Start Scraping</div>
            <div className="text-xs opacity-80">Run now (100 jobs)</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={() => cleanupJobs.mutate()}
          disabled={cleanupJobs.isPending}
          className="flex items-center justify-center space-x-2 h-16"
        >
          <RotateCcw className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Cleanup Jobs</div>
            <div className="text-xs opacity-80">Remove expired</div>
          </div>
        </Button>

        <Card className="h-16 flex items-center">
          <CardContent className="flex items-center space-x-3 p-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <div className="font-semibold text-sm">Next Run</div>
              <div className="text-xs text-muted-foreground">
                {schedule?.next_run ? formatDistanceToNow(schedule.next_run, { addSuffix: true }) : 'Unknown'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-16 flex items-center">
          <CardContent className="flex items-center space-x-3 p-4">
            <Target className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-semibold text-sm">Success Rate</div>
              <div className="text-xs text-muted-foreground">
                {stats?.success_rate ? `${stats.success_rate.toFixed(1)}%` : 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============= MAIN DASHBOARD TABS ============= */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* ============= OVERVIEW TAB ============= */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Scraped</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_scraped || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.published_jobs || 0} published
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.average_quality_score ? stats.average_quality_score.toFixed(1) : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average across all jobs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.success_rate ? `${stats.success_rate.toFixed(1)}%` : 'N/A'}
                </div>
                <Progress value={stats?.success_rate || 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats?.errors_count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last {selectedTimeframe}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Scraping Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {logs.slice(0, 10).map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center space-x-2">
                      {log.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : log.status === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="text-sm font-medium">{log.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                      <Badge variant={log.status === 'success' ? 'default' : log.status === 'error' ? 'destructive' : 'secondary'}>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= SOURCES TAB ============= */}
        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Sources Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources?.map((source) => (
                  <Card key={source.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{source.name}</h3>
                        <Badge variant={source.is_active ? 'default' : 'secondary'}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Jobs:</span>
                          <span className="font-medium">{source.jobs_count}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Success Rate:</span>
                          <span className="font-medium">{source.success_rate.toFixed(1)}%</span>
                        </div>
                        <Progress value={source.success_rate} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= QUALITY TAB ============= */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Excellent (40+)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(qualityAnalysis?.score_distribution.excellent || 0) / (qualityAnalysis?.total_jobs || 1) * 100} className="w-20" />
                      <span className="text-sm font-medium">{qualityAnalysis?.score_distribution.excellent || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Good (30-39)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(qualityAnalysis?.score_distribution.good || 0) / (qualityAnalysis?.total_jobs || 1) * 100} className="w-20" />
                      <span className="text-sm font-medium">{qualityAnalysis?.score_distribution.good || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average (20-29)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(qualityAnalysis?.score_distribution.average || 0) / (qualityAnalysis?.total_jobs || 1) * 100} className="w-20" />
                      <span className="text-sm font-medium">{qualityAnalysis?.score_distribution.average || 0}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Poor (&lt;20)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(qualityAnalysis?.score_distribution.poor || 0) / (qualityAnalysis?.total_jobs || 1) * 100} className="w-20" />
                      <span className="text-sm font-medium">{qualityAnalysis?.score_distribution.poor || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {Object.entries(qualityAnalysis?.by_source || {}).map(([source, data]: [string, any]) => (
                    <div key={source} className="flex justify-between items-center p-2 rounded border">
                      <div>
                        <div className="font-medium text-sm">{source}</div>
                        <div className="text-xs text-muted-foreground">{data.count} jobs</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{data.avg_score.toFixed(1)}</div>
                        <Progress value={(data.avg_score / 50) * 100} className="w-16 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============= ERRORS TAB ============= */}
        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Validation Errors</span>
                    <Badge variant="destructive">{errors?.categories.validation_errors || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">URL Errors</span>
                    <Badge variant="destructive">{errors?.categories.url_errors || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality Errors</span>
                    <Badge variant="destructive">{errors?.categories.quality_errors || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Errors</span>
                    <Badge variant="destructive">{errors?.categories.system_errors || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {errors?.recent_errors?.slice(0, 10).map((error, index) => (
                    <div key={index} className="p-2 rounded border border-red-200 bg-red-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{error.source}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(error.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-red-600">{error.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ============= AUTOMATION TAB ============= */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded border">
                  <div>
                    <h3 className="font-semibold">Scheduled Scraping</h3>
                    <p className="text-sm text-muted-foreground">
                      Runs every {schedule?.interval_hours?.toFixed(1) || 3} hours
                    </p>
                  </div>
                  <Badge variant={schedule?.is_active ? 'default' : 'secondary'}>
                    {schedule?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded border">
                  <div>
                    <h3 className="font-semibold">Auto Cleanup</h3>
                    <p className="text-sm text-muted-foreground">
                      Removes expired jobs automatically
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded border">
                  <div>
                    <h3 className="font-semibold">Quality Monitoring</h3>
                    <p className="text-sm text-muted-foreground">
                      Tracks job quality and sends alerts
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};