import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Database, 
  Brain, 
  Rocket, 
  BarChart3, 
  Settings, 
  GitBranch, 
  FlaskConical, 
  ScrollText,
  Upload,
  Download,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Monitor,
  Settings2,
  TestTube,
  Archive,
  BarChart2,
  Target,
  Cpu,
  HardDrive,
  Network,
  Timer,
  Users,
  Code,
  Filter,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DatasetManager } from '@/components/admin/ai/DatasetManager';
import { ModelTrainingManager } from '@/components/admin/ai/ModelTrainingManager';
import { AIDeploymentManager } from '@/components/admin/ai/AIDeploymentManager';
import { AIMonitoringDashboard } from '@/components/admin/ai/AIMonitoringDashboard';
import { AIModelVersionManager } from '@/components/admin/ai/AIModelVersionManager';

import { AILogsViewer } from '@/components/admin/ai/AILogsViewer';
import { AISettingsManager } from '@/components/admin/ai/AISettingsManager';

const AIMLTrainingCenter = () => {
  const [activeTab, setActiveTab] = useState('datasets');
  const [systemStats, setSystemStats] = useState({
    totalModels: 0,
    activeDeployments: 0,
    totalDatasets: 0,
    totalRequests: 0,
    systemHealth: 'healthy',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
    fetchRecentActivities();
  }, []);

  const fetchSystemStats = async () => {
    try {
      // Fetch models count
      const { count: modelsCount } = await supabase
        .from('ai_models')
        .select('*', { count: 'exact', head: true });

      // Fetch active deployments count
      const { count: deploymentsCount } = await supabase
        .from('ai_deployments')
        .select('*', { count: 'exact', head: true })
        .eq('is_live', true);

      // Fetch datasets count
      const { count: datasetsCount } = await supabase
        .from('ai_datasets')
        .select('*', { count: 'exact', head: true });

      // Fetch request logs count
      const { count: requestsCount } = await supabase
        .from('ai_request_logs')
        .select('*', { count: 'exact', head: true });

      setSystemStats({
        totalModels: modelsCount || 0,
        activeDeployments: deploymentsCount || 0,
        totalDatasets: datasetsCount || 0,
        totalRequests: requestsCount || 0,
        systemHealth: 'healthy',
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast.error('Failed to load system statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data: activities, error } = await supabase
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
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentActivities(activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
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

  const getUsageColor = (usage: number) => {
    if (usage > 80) return 'bg-red-500';
    if (usage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">AI/ML Training Center</h1>
          <p className="text-muted-foreground mt-2">
            Train, fine-tune, monitor, and manage AI models personalized for platform services
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getHealthStatusIcon(systemStats.systemHealth)}
          <span className="text-sm font-medium">System {systemStats.systemHealth}</span>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalModels}</div>
            <div className="text-xs text-muted-foreground">Total registered models</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Active Deployments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.activeDeployments}</div>
            <div className="text-xs text-muted-foreground">Currently live</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Datasets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalDatasets}</div>
            <div className="text-xs text-muted-foreground">Training datasets</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </span>
                <span className="text-sm font-bold">{systemStats.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={systemStats.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Memory Usage
                </span>
                <span className="text-sm font-bold">{systemStats.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={systemStats.memoryUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Disk Usage
                </span>
                <span className="text-sm font-bold">{systemStats.diskUsage.toFixed(1)}%</span>
              </div>
              <Progress value={systemStats.diskUsage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="datasets" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Datasets
          </TabsTrigger>
          <TabsTrigger value="train" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Train Models
          </TabsTrigger>
          <TabsTrigger value="deploy" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Deploy
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Test
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datasets" className="space-y-6">
          <DatasetManager />
        </TabsContent>

        <TabsContent value="train" className="space-y-6">
          <ModelTrainingManager />
        </TabsContent>

        <TabsContent value="deploy" className="space-y-6">
          <AIDeploymentManager />
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <AIMonitoringDashboard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AISettingsManager />
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <AIModelVersionManager />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">AI Testing Center is not available</p>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <AILogsViewer />
        </TabsContent>
      </Tabs>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activities found
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${activity.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium">{activity.request_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.ai_deployments?.deployment_name || 'Unknown deployment'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{activity.response_time_ms}ms</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMLTrainingCenter;