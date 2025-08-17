import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Play, RefreshCw, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

interface Agent {
  id: string;
  handle: string;
  display_name: string;
  role: string;
  status: string;
  frequency: string;
  departments: string[];
}

interface Task {
  id: string;
  agent_id: string;
  kind: string;
  status: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  attempts: number;
  error?: string;
}

export const AIAgentOperations: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .order('display_name');
    
    if (error) {
      console.error('Error fetching agents:', error);
      return;
    }
    
    setAgents(data || []);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }
    
    setTasks(data || []);
  };

  const fetchSystemHealth = async () => {
    try {
      console.log('Fetching system health...');
      const { data, error } = await supabase.functions.invoke('ai-adminbot', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (error) {
        console.error('AdminBot error:', error);
        throw new Error(error.message || 'Failed to fetch system health');
      }
      
      console.log('AdminBot response:', data);
      setSystemHealth(data);
    } catch (error: any) {
      console.error('Error fetching system health:', error);
      toast.error(`Failed to fetch system health: ${error.message}`);
    }
  };

  const triggerScheduler = async () => {
    setIsLoading(true);
    try {
      console.log('Triggering scheduler...');
      const { data, error } = await supabase.functions.invoke('ai-agent-scheduler', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (error) {
        console.error('Scheduler error:', error);
        throw new Error(error.message || 'Failed to trigger scheduler');
      }
      
      console.log('Scheduler response:', data);
      toast.success('Scheduler triggered successfully');
      await fetchTasks();
    } catch (error: any) {
      console.error('Error triggering scheduler:', error);
      toast.error(`Failed to trigger scheduler: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerWorker = async () => {
    setIsLoading(true);
    try {
      console.log('Triggering worker...');
      const { data, error } = await supabase.functions.invoke('ai-agent-worker', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (error) {
        console.error('Worker error:', error);
        throw new Error(error.message || 'Failed to trigger worker');
      }
      
      console.log('Worker response:', data);
      toast.success('Worker triggered successfully');
      await fetchTasks();
    } catch (error: any) {
      console.error('Error triggering worker:', error);
      toast.error(`Failed to trigger worker: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestTasks = async () => {
    setIsLoading(true);
    try {
      // Create test tasks for all active agents
      for (const agent of agents.filter(a => a.status === 'active')) {
        const { error } = await supabase
          .from('agent_tasks')
          .insert({
            agent_id: agent.id,
            kind: 'test_task',
            payload: { test: true, trigger: 'manual' },
            priority: 5,
            status: 'pending'
          });
        
        if (error) throw error;
      }
      
      toast.success(`Created test tasks for ${agents.filter(a => a.status === 'active').length} agents`);
      await fetchTasks();
    } catch (error) {
      console.error('Error creating test tasks:', error);
      toast.error('Failed to create test tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    fetchTasks();
    fetchSystemHealth();
    
    // Set up real-time subscription for tasks
    const tasksSubscription = supabase
      .channel('agent_tasks_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agent_tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'running': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-500/10 text-red-700 border-red-200';
      case 'deadletter': return 'bg-red-600/10 text-red-800 border-red-300';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'running': return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': case 'deadletter': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Agent Operations</h1>
          <p className="text-muted-foreground">Manage and monitor AI agent operations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSystemHealth} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Overall AI agent system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{systemHealth.healthScore}%</div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{systemHealth.metrics?.totalTasks || 0}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{systemHealth.metrics?.activeAgents || 0}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{systemHealth.metrics?.failedTasks || 0}</div>
                <div className="text-sm text-muted-foreground">Failed Tasks</div>
              </div>
            </div>
            {systemHealth.recommendations && systemHealth.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {systemHealth.recommendations.map((rec: string, index: number) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Operations Control
          </CardTitle>
          <CardDescription>Trigger AI agent operations manually</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={triggerScheduler} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Run Scheduler
            </Button>
            <Button 
              onClick={triggerWorker} 
              disabled={isLoading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Run Worker
            </Button>
            <Button 
              onClick={createTestTasks} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Create Test Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Agents Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            AI Agents ({agents.length})
          </CardTitle>
          <CardDescription>Current AI agents and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{agent.display_name}</h4>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{agent.role}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {agent.frequency}
                  </Badge>
                  {agent.departments?.map((dept) => (
                    <Badge key={dept} variant="outline" className="text-xs">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Latest AI agent task executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tasks found. Click "Create Test Tasks" to get started.
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <div className="font-medium text-sm text-foreground">{task.kind}</div>
                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(task.created_at).toLocaleString()}
                        {task.started_at && ` • Started: ${new Date(task.started_at).toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    {task.attempts > 1 && (
                      <Badge variant="outline" className="text-xs">
                        Attempt {task.attempts}
                      </Badge>
                    )}
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