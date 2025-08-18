import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Bot, Calendar, CheckCircle, Clock, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  handle: string;
  display_name: string;
  email: string;
  role: string;
  departments: string[];
  content_domains: string[];
  tone: string;
  frequency: string;
  status: string;
  created_at: string;
}

interface SystemHealth {
  healthScore: number;
  metrics: {
    totalTasks: number;
    pendingTasks: number;
    failedTasks: number;
    deadletterTasks: number;
    activeAgents: number;
    totalAgents: number;
  };
  recommendations: string[];
  timestamp: string;
}

export const AIAgentsManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
    fetchSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setAgents((data as any) || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI agents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-adminbot', {
        body: { action: 'health' }
      });

      if (error) throw error;
      setSystemHealth(data);
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const triggerScheduler = async () => {
    setActionLoading('scheduler');
    try {
      const { error } = await supabase.functions.invoke('ai-agent-scheduler');
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Agent scheduler triggered successfully",
      });
      
      // Refresh health after a moment
      setTimeout(fetchSystemHealth, 2000);
    } catch (error) {
      console.error('Error triggering scheduler:', error);
      toast({
        title: "Error",
        description: "Failed to trigger scheduler",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const runWorker = async () => {
    setActionLoading('worker');
    try {
      const { error } = await supabase.functions.invoke('ai-agent-worker');
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Agent worker executed successfully",
      });
      
      setTimeout(fetchSystemHealth, 2000);
    } catch (error) {
      console.error('Error running worker:', error);
      toast({
        title: "Error",
        description: "Failed to run worker",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const retryDeadletterTasks = async () => {
    setActionLoading('retry');
    try {
      const { data, error } = await supabase.functions.invoke('ai-adminbot', {
        body: { action: 'retry-deadletter' }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Retried ${data.retriedCount} deadletter tasks`,
      });
      
      setTimeout(fetchSystemHealth, 2000);
    } catch (error) {
      console.error('Error retrying deadletter tasks:', error);
      toast({
        title: "Error",
        description: "Failed to retry deadletter tasks",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-success';
    if (score >= 80) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Agents System</h2>
          <p className="text-muted-foreground">
            Manage your autonomous AI agents and monitor system health
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={triggerScheduler}
            disabled={actionLoading === 'scheduler'}
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {actionLoading === 'scheduler' ? 'Running...' : 'Run Scheduler'}
          </Button>
          <Button 
            onClick={runWorker}
            disabled={actionLoading === 'worker'}
            size="sm"
            variant="outline"
          >
            <Play className="w-4 h-4 mr-2" />
            {actionLoading === 'worker' ? 'Running...' : 'Run Worker'}
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              System Health
              <Badge variant="outline" className={getHealthColor(systemHealth.healthScore)}>
                {systemHealth.healthScore}%
              </Badge>
            </CardTitle>
            <CardDescription>
              Last updated: {new Date(systemHealth.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{systemHealth.metrics.totalTasks}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{systemHealth.metrics.pendingTasks}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{systemHealth.metrics.failedTasks}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{systemHealth.metrics.activeAgents}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
            </div>

            {systemHealth.metrics.deadletterTasks > 0 && (
              <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm">
                    {systemHealth.metrics.deadletterTasks} tasks in deadletter queue
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={retryDeadletterTasks}
                  disabled={actionLoading === 'retry'}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {actionLoading === 'retry' ? 'Retrying...' : 'Retry All'}
                </Button>
              </div>
            )}

            <div className="mt-4">
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {systemHealth.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="agents" className="w-full">
        <TabsList>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{agent.display_name}</CardTitle>
                        <CardDescription className="text-sm">@{agent.handle}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">{agent.role}</div>
                    <div className="text-xs text-muted-foreground">{agent.email}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium mb-1">Departments:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.departments.map((dept, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {dept}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium mb-1">Content Domains:</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.content_domains.map((domain, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-medium">{agent.frequency}</span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tone:</span>
                    <span className="font-medium capitalize">{agent.tone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Queue Management</CardTitle>
              <CardDescription>
                Monitor and manage AI agent tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Task management interface coming soon</p>
                <p className="text-sm">Use the system health panel above to monitor task status</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>
                Configure agent behavior and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Agent configuration interface coming soon</p>
                <p className="text-sm">Agents are currently configured via database</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};