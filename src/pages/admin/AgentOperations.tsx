import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Users, Activity, Settings, RefreshCw, Play, Pause, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  content_domains: string[];
  tone: string;
  frequency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AgentTask {
  task_id: string;
  agent_name: string;
  agent_role: string;
  department: string;
  task_source: string;
  action: string;
  status: string;
  attempts: number;
  max_attempts: number;
  error_message: string;
  created_at: string;
  run_at: string;
  started_at: string;
  completed_at: string;
  status_emoji: string;
  duration_seconds: number;
}

interface TaskSummary {
  task_source: string;
  status: string;
  total: number;
  last_24h: number;
  last_hour: number;
}

const AgentOperationsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch agents
  const { data: agents, isLoading: agentsLoading, refetch: refetchAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Agent[];
    }
  });

  // Fetch agent tasks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['agent-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('all_agent_tasks')
        .select('*')
        .limit(100);
      
      if (error) throw error;
      return data as AgentTask[];
    }
  });

  // Fetch task summary
  const { data: taskSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['task-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_task_summary')
        .select('*');
      
      if (error) throw error;
      return data as TaskSummary[];
    }
  });

  // Fetch agent performance
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['agent-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_performance')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const handleRunScheduler = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-scheduler');
      if (error) throw error;
      
      toast.success('AI Agent Scheduler executed successfully');
      refetchTasks();
    } catch (error) {
      console.error('Error running scheduler:', error);
      toast.error('Failed to run scheduler');
    }
  };

  const handleRunWorker = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-worker');
      if (error) throw error;
      
      toast.success('AI Agent Worker executed successfully');
      refetchTasks();
    } catch (error) {
      console.error('Error running worker:', error);
      toast.error('Failed to run worker');
    }
  };

  const handleRunAdminBot = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-adminbot', {
        body: { action: 'health_check' }
      });
      if (error) throw error;
      
      toast.success('AI AdminBot health check completed');
    } catch (error) {
      console.error('Error running adminbot:', error);
      toast.error('Failed to run adminbot');
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('agents')
        .update({ status: newStatus })
        .eq('id', agentId);

      if (error) throw error;
      
      toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      refetchAgents();
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast.error('Failed to update agent status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTotalsByStatus = (status: string) => {
    return taskSummary?.reduce((sum, item) => item.status === status ? sum + item.total : sum, 0) || 0;
  };

  return (
    <UnifiedAdminLayout 
      title="AI Agent Operations Engine" 
      description="Monitor and manage AI agents, tasks, and system performance"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agents?.filter(a => a.status === 'active').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total: {agents?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {getTotalsByStatus('pending')}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting execution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getTotalsByStatus('completed')}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Tasks</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {getTotalsByStatus('failed')}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Controls
            </CardTitle>
            <CardDescription>
              Manually trigger AI agent operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleRunScheduler} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Run Scheduler
              </Button>
              <Button onClick={handleRunWorker} variant="outline" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Run Worker
              </Button>
              <Button onClick={handleRunAdminBot} variant="outline" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Run AdminBot
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tasks</CardTitle>
                  <CardDescription>Latest agent task executions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks?.slice(0, 10).map((task) => (
                      <div key={task.task_id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <div className="font-medium">{task.action}</div>
                            <div className="text-sm text-muted-foreground">{task.agent_name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={task.status === 'completed' ? 'default' : task.status === 'failed' ? 'destructive' : 'secondary'}>
                            {task.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(task.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Task Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Summary by Source</CardTitle>
                  <CardDescription>Distribution of tasks by origin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {taskSummary?.map((summary) => (
                      <div key={`${summary.task_source}-${summary.status}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{summary.task_source}</Badge>
                          <span className="text-sm">{summary.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{summary.total}</div>
                          <div className="text-xs text-muted-foreground">
                            {summary.last_24h} in 24h
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Agents Management</CardTitle>
                <CardDescription>Manage and monitor all AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents?.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <Bot className={`h-8 w-8 ${agent.status === 'active' ? 'text-green-500' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-muted-foreground">{agent.role}</div>
                          <div className="text-xs text-muted-foreground">{agent.department}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            Frequency: {agent.frequency}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={agent.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleAgentStatus(agent.id, agent.status)}
                        >
                          {agent.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Agent Tasks</CardTitle>
                <CardDescription>Complete task execution history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Agent</th>
                        <th className="text-left p-2">Action</th>
                        <th className="text-left p-2">Source</th>
                        <th className="text-left p-2">Created</th>
                        <th className="text-left p-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks?.map((task) => (
                        <tr key={task.task_id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span>{task.status}</span>
                            </div>
                          </td>
                          <td className="p-2">{task.agent_name}</td>
                          <td className="p-2">{task.action}</td>
                          <td className="p-2">
                            <Badge variant="outline">{task.task_source}</Badge>
                          </td>
                          <td className="p-2">{new Date(task.created_at).toLocaleString()}</td>
                          <td className="p-2">
                            {task.duration_seconds ? `${task.duration_seconds}s` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Metrics</CardTitle>
                <CardDescription>Success rates and task completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performance?.map((perf: any) => (
                    <div key={perf.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <div className="font-medium">{perf.name}</div>
                        <div className="text-sm text-muted-foreground">{perf.role}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="font-medium">{perf.total_tasks}</div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div>
                          <div className="font-medium text-green-600">{perf.completed_tasks}</div>
                          <div className="text-xs text-muted-foreground">Completed</div>
                        </div>
                        <div>
                          <div className="font-medium text-red-600">{perf.failed_tasks}</div>
                          <div className="text-xs text-muted-foreground">Failed</div>
                        </div>
                        <div>
                          <div className="font-medium">{perf.success_rate}%</div>
                          <div className="text-xs text-muted-foreground">Success Rate</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AgentOperationsPage;