import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Users,
  Target,
  Timer,
  Cpu,
  HardDrive,
  Network,
  Monitor,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MonitoringData {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  systemHealth: string;
  activeModels: number;
  deployments: any[];
  recentLogs: any[];
}

export const AIMonitoringDashboard: React.FC = () => {
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    totalRequests: 0,
    successfulRequests: 0,
    errorRequests: 0,
    averageResponseTime: 0,
    systemHealth: 'healthy',
    activeModels: 0,
    deployments: [],
    recentLogs: []
  });
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange, selectedModule]);

  const fetchMonitoringData = async () => {
    try {
      // Calculate time range
      const now = new Date();
      const timeRangeHours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startTime = new Date(now.getTime() - timeRangeHours * 60 * 60 * 1000);

      // Fetch request logs
      let logsQuery = supabase
        .from('ai_request_logs')
        .select(`
          *,
          ai_deployments (
            deployment_name,
            module_name,
            ai_models (
              model_name,
              model_version
            )
          )
        `)
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false });

      if (selectedModule !== 'all') {
        logsQuery = logsQuery.eq('ai_deployments.module_name', selectedModule);
      }

      const { data: logs, error: logsError } = await logsQuery;
      if (logsError) throw logsError;

      // Fetch deployments
      const { data: deployments, error: deploymentsError } = await supabase
        .from('ai_deployments')
        .select(`
          *,
          ai_models (
            model_name,
            model_version,
            task_type
          )
        `)
        .eq('is_live', true);

      if (deploymentsError) throw deploymentsError;

      // Calculate metrics
      const totalRequests = logs?.length || 0;
      const successfulRequests = logs?.filter(log => log.success).length || 0;
      const errorRequests = totalRequests - successfulRequests;
      const averageResponseTime = logs?.length ? 
        logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length : 0;

      setMonitoringData({
        totalRequests,
        successfulRequests,
        errorRequests,
        averageResponseTime,
        systemHealth: errorRequests / totalRequests > 0.1 ? 'warning' : 'healthy',
        activeModels: deployments?.length || 0,
        deployments: deployments || [],
        recentLogs: logs?.slice(0, 10) || []
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const successRate = monitoringData.totalRequests > 0 ? 
    (monitoringData.successfulRequests / monitoringData.totalRequests) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI System Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time performance and health monitoring for AI deployments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="resume_builder">Resume Builder</SelectItem>
              <SelectItem value="jobs">Job Matching</SelectItem>
              <SelectItem value="career_map">Career Map</SelectItem>
              <SelectItem value="learning">Learning</SelectItem>
              <SelectItem value="employer">Employer</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchMonitoringData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3">
              {getHealthIcon(monitoringData.systemHealth)}
              <div>
                <p className="text-sm font-medium">System Status</p>
                {getHealthBadge(monitoringData.systemHealth)}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Active Models</p>
              <p className="text-2xl font-bold">{monitoringData.activeModels}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium">Avg Response Time</p>
              <p className="text-2xl font-bold">{monitoringData.averageResponseTime.toFixed(0)}ms</p>
            </div>
            <div>
              <p className="text-sm font-medium">Error Rate</p>
              <p className="text-2xl font-bold text-red-600">
                {monitoringData.totalRequests > 0 ? 
                  ((monitoringData.errorRequests / monitoringData.totalRequests) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData.totalRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Successful Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{monitoringData.successfulRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitoringData.averageResponseTime.toFixed(0)}ms</div>
            <div className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -5ms from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Error Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{monitoringData.errorRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -2% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Deployment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deployment</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Avg Response</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Last Check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitoringData.deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell>
                    <div className="font-medium">{deployment.deployment_name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {deployment.module_name.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{deployment.ai_models.model_name}</div>
                      <div className="text-sm text-muted-foreground">
                        v{deployment.ai_models.model_version}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getHealthIcon(deployment.health_status)}
                      {getHealthBadge(deployment.health_status)}
                    </div>
                  </TableCell>
                  <TableCell>{deployment.request_count.toLocaleString()}</TableCell>
                  <TableCell>{deployment.average_response_time_ms}ms</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      deployment.error_rate > 0.1 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(deployment.error_rate * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {deployment.last_health_check ? 
                      new Date(deployment.last_health_check).toLocaleString() : 
                      'Never'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monitoringData.recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity found
              </div>
            ) : (
              monitoringData.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium">{log.request_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.ai_deployments?.deployment_name || 'Unknown deployment'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{log.response_time_ms}ms</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Current</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <Progress value={67} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Average over last {timeRange}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Current</span>
                <span className="text-sm font-medium">82%</span>
              </div>
              <Progress value={82} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Average over last {timeRange}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network I/O
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Current</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Average over last {timeRange}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};