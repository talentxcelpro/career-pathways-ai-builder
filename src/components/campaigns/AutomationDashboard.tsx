import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Zap, 
  Clock, 
  Target,
  TrendingUp,
  Bot,
  Layers,
  Calendar,
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';

export function AutomationDashboard() {
  const [isAutoScaling, setIsAutoScaling] = useState(false);
  const [batchSize, setBatchSize] = useState(50);
  const [automationFrequency, setAutomationFrequency] = useState('daily');
  const queryClient = useQueryClient();

  // Get automation status and metrics
  const { data: automationMetrics, isLoading } = useQuery({
    queryKey: ['automation-metrics'],
    queryFn: async () => {
      // Get recent agent tasks for automation metrics
      const { data: tasks } = await supabase
        .from('agent_tasks')
        .select('*')
        .eq('source', 'campaign_automation')
        .order('created_at', { ascending: false })
        .limit(100);

      // Get active campaigns
      const { data: campaigns } = await supabase
        .from('backlink_campaigns')
        .select('*')
        .eq('status', 'active');

      // Calculate metrics
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const runningTasks = tasks?.filter(t => t.status === 'running').length || 0;
      const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
      const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        totalTasks,
        completedTasks,
        runningTasks,
        pendingTasks,
        successRate,
        activeCampaigns: campaigns?.length || 0,
        recentTasks: tasks?.slice(0, 10) || []
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Scale campaigns automation
  const scaleCampaigns = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('campaign-automation-engine', {
        body: { action: 'scale_campaigns' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Scaled ${data.scaled_campaigns?.length || 0} campaigns`);
      queryClient.invalidateQueries({ queryKey: ['automation-metrics'] });
    },
    onError: (error) => {
      toast.error(`Scaling failed: ${error.message}`);
    },
  });

  // Auto-outreach automation
  const autoOutreach = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('campaign-automation-engine', {
        body: { action: 'auto_outreach' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Processed ${data.processed_count} opportunities`);
      queryClient.invalidateQueries({ queryKey: ['automation-metrics'] });
    },
    onError: (error) => {
      toast.error(`Auto-outreach failed: ${error.message}`);
    },
  });

  // Bulk processing
  const bulkProcess = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('batch-campaign-processor', {
        body: { 
          action: 'process_queue',
          batch_size: batchSize,
          filters: { min_relevance_score: 5 }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Bulk processed ${data.processed_count} items`);
      queryClient.invalidateQueries({ queryKey: ['automation-metrics'] });
    },
    onError: (error) => {
      toast.error(`Bulk processing failed: ${error.message}`);
    },
  });

  // Schedule automation
  const scheduleAutomation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data, error } = await supabase.functions.invoke('campaign-automation-engine', {
        body: { 
          action: 'schedule_campaigns',
          payload: scheduleData
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Scheduled ${data.scheduled_tasks?.length || 0} automations`);
      queryClient.invalidateQueries({ queryKey: ['automation-metrics'] });
    },
    onError: (error) => {
      toast.error(`Scheduling failed: ${error.message}`);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = automationMetrics || {
    totalTasks: 0,
    completedTasks: 0,
    runningTasks: 0,
    pendingTasks: 0,
    successRate: 0,
    activeCampaigns: 0,
    recentTasks: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Automation Dashboard</h2>
          <p className="text-muted-foreground">Scale and automate your campaigns</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-scaling">Auto-scaling</Label>
          <Switch
            id="auto-scaling"
            checked={isAutoScaling}
            onCheckedChange={setIsAutoScaling}
          />
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Automation tasks executed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            <Progress value={metrics.successRate} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Tasks</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.runningTasks}</div>
            <p className="text-xs text-muted-foreground">
              Currently executing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Being automated
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="automation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automation" className="gap-2">
            <Rocket className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="scaling" className="gap-2">
            <Layers className="h-4 w-4" />
            Scaling
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Outreach */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Auto Outreach
                </CardTitle>
                <CardDescription>
                  Automatically process and send outreach emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => autoOutreach.mutate()}
                  disabled={autoOutreach.isPending}
                  className="w-full gap-2"
                >
                  <Play className="h-4 w-4" />
                  {autoOutreach.isPending ? 'Processing...' : 'Start Auto Outreach'}
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Processes pending opportunities with AI-powered personalization
                </div>
              </CardContent>
            </Card>

            {/* Bulk Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Bulk Processing
                </CardTitle>
                <CardDescription>
                  Process multiple campaigns simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value) || 50)}
                    min="10"
                    max="500"
                  />
                </div>
                
                <Button 
                  onClick={() => bulkProcess.mutate()}
                  disabled={bulkProcess.isPending}
                  className="w-full gap-2"
                >
                  <Layers className="h-4 w-4" />
                  {bulkProcess.isPending ? 'Processing...' : 'Start Bulk Process'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Automation
              </CardTitle>
              <CardDescription>
                Set up recurring automation tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={automationFrequency} onValueChange={setAutomationFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={() => scheduleAutomation.mutate({
                      schedule_type: automationFrequency,
                      campaign_ids: [] // Add logic to select campaigns
                    })}
                    disabled={scheduleAutomation.isPending}
                    className="gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    {scheduleAutomation.isPending ? 'Scheduling...' : 'Schedule'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Smart Scaling
              </CardTitle>
              <CardDescription>
                Automatically scale successful campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2x</div>
                  <div className="text-sm text-muted-foreground">High performing (80%+ success)</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1.5x</div>
                  <div className="text-sm text-muted-foreground">Good performing (60%+ success)</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">1.2x</div>
                  <div className="text-sm text-muted-foreground">Decent performing (40%+ success)</div>
                </div>
              </div>
              
              <Button 
                onClick={() => scaleCampaigns.mutate()}
                disabled={scaleCampaigns.isPending}
                className="w-full gap-2"
                size="lg"
              >
                <Rocket className="h-4 w-4" />
                {scaleCampaigns.isPending ? 'Scaling...' : 'Scale Campaigns Now'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Tasks</CardTitle>
              <CardDescription>
                Monitor the status of your automation tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <div>
                        <p className="font-medium">{task.action.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'running' ? 'secondary' :
                      task.status === 'pending' ? 'outline' : 'destructive'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                ))}
                
                {metrics.recentTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No automation tasks yet</p>
                    <p className="text-sm">Start an automation to see tasks here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}