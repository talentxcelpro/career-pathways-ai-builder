import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  RefreshCw, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  FileText,
  Mail,
  Briefcase,
  BarChart3,
  Activity,
  History
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TaskHistoryViewer } from './TaskHistoryViewer';

interface AgentLog {
  id: string;
  agent_id: string | null;
  task_id: string | null;
  message: string;
  level: string;
  metadata: any;
  created_at: string;
}

interface AgentActivity {
  agent_id: string;
  agent_name: string;
  agent_role: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  success_rate: number;
  last_activity: string;
  content_created: number;
  emails_sent: number;
}

export const AgentActivityDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchAgentLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedAgent !== 'all') {
        query = query.eq('agent_id', selectedAgent as any);
      }

      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel as any);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching agent logs:', error);
        toast.error('Failed to fetch agent logs');
        return;
      }

      setLogs((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching agent logs:', error);
      toast.error(`Failed to fetch agent logs: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentActivities = async () => {
    try {
      // Fetch agent performance data
      const { data: agents, error: agentsError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('status', 'active' as any);

      if (agentsError) {
        console.error('Error fetching agents:', agentsError);
        return;
      }

      const activitiesData: AgentActivity[] = [];

      for (const agent of agents || []) {
        // Get task statistics
        const { data: tasks } = await supabase
          .from('agent_tasks')
          .select('status, completed_at')
          .eq('agent_id', agent.id);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter((t: any) => t.status === 'completed').length || 0;
        const failedTasks = tasks?.filter((t: any) => t.status === 'failed').length || 0;
        const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Get content metrics from logs
        const { data: contentLogs } = await supabase
          .from('agent_logs')
          .select('metadata')
          .eq('agent_id', agent.id)
          .contains('metadata', { action_type: 'content_created' });

        const { data: emailLogs } = await supabase
          .from('agent_logs')
          .select('metadata')
          .eq('agent_id', agent.id)
          .contains('metadata', { action_type: 'email_sent' });

        // Get last activity
        const lastCompletedTask = tasks?.find(t => t.completed_at)?.completed_at || agent.updated_at;

        activitiesData.push({
          agent_id: agent.id,
          agent_name: agent.display_name,
          agent_role: agent.role,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          failed_tasks: failedTasks,
          success_rate: successRate,
          last_activity: lastCompletedTask,
          content_created: contentLogs?.length || 0,
          emails_sent: emailLogs?.length || 0
        });
      }

      setActivities(activitiesData);
    } catch (error: any) {
      console.error('Error fetching agent activities:', error);
      toast.error(`Failed to fetch agent activities: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchAgentLogs();
    fetchAgentActivities();

    // Set up real-time subscription for logs
    const logsSubscription = supabase
      .channel('agent_logs_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agent_logs' },
        () => {
          fetchAgentLogs();
        }
      )
      .subscribe();

    return () => {
      logsSubscription.unsubscribe();
    };
  }, [selectedAgent, selectedLevel]);

  const filteredLogs = logs.filter(log => 
    searchTerm === '' || 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.metadata?.action_type && log.metadata.action_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      case 'warn': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getActionTypeIcon = (metadata: Record<string, any>) => {
    const actionType = metadata?.action_type;
    switch (actionType) {
      case 'content_created': return <FileText className="h-4 w-4" />;
      case 'email_sent': return <Mail className="h-4 w-4" />;
      case 'job_posted': return <Briefcase className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agent Activity Dashboard</h2>
          <p className="text-muted-foreground">Monitor detailed AI agent activities and performance</p>
        </div>
        <Button onClick={() => { fetchAgentLogs(); fetchAgentActivities(); }} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="business">Business Tasks</TabsTrigger>
          <TabsTrigger value="performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {activities.map((activity) => (
                      <SelectItem key={activity.agent_id} value={activity.agent_id}>
                        {activity.agent_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs ({filteredLogs.length})</CardTitle>
              <CardDescription>System heartbeats and internal operations (not business tasks)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <React.Fragment key={log.id}>
                        <TableRow>
                          <TableCell className="font-mono text-xs">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{log.agent_id ? `Agent ${log.agent_id.slice(0, 8)}` : 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">{log.metadata?.task_action || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getLevelColor(log.level)}>
                              {getLevelIcon(log.level)}
                              <span className="ml-1">{log.level}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionTypeIcon(log.metadata)}
                              <span className="truncate max-w-48">{log.message}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.metadata?.task_action && (
                              <Badge variant="outline" className="text-xs">
                                {log.metadata.task_action}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedLog === log.id && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-muted/50">
                              <div className="p-4 space-y-2">
                                <h4 className="font-medium">Detailed Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Task ID:</strong> {log.task_id || 'N/A'}
                                  </div>
                                  <div>
                                    <strong>Agent ID:</strong> {log.agent_id || 'N/A'}
                                  </div>
                                  <div>
                                    <strong>Full Message:</strong> {log.message}
                                  </div>
                                  <div>
                                    <strong>Task Action:</strong> {log.metadata?.task_action || 'N/A'}
                                  </div>
                                </div>
                                {Object.keys(log.metadata).length > 0 && (
                                  <div>
                                    <strong>Metadata:</strong>
                                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                                      {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity logs found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <TaskHistoryViewer />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => (
              <Card key={activity.agent_id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{activity.agent_name}</CardTitle>
                  <CardDescription>{activity.agent_role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{activity.total_tasks}</div>
                      <div className="text-muted-foreground">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{activity.success_rate.toFixed(1)}%</div>
                      <div className="text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed:</span>
                      <span className="font-medium">{activity.completed_tasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{activity.failed_tasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Content Created:</span>
                      <span className="font-medium">{activity.content_created}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Emails Sent:</span>
                      <span className="font-medium">{activity.emails_sent}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Last Activity: {formatDistanceToNow(new Date(activity.last_activity), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Analytics
              </CardTitle>
              <CardDescription>Overall system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {activities.reduce((sum, a) => sum + a.total_tasks, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activities.reduce((sum, a) => sum + a.completed_tasks, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {activities.reduce((sum, a) => sum + a.content_created, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Content Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {activities.reduce((sum, a) => sum + a.emails_sent, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Emails Sent</div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Top Performing Agents</h4>
                <div className="space-y-2">
                  {activities
                    .sort((a, b) => b.success_rate - a.success_rate)
                    .slice(0, 5)
                    .map((activity) => (
                      <div key={activity.agent_id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium">{activity.agent_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({activity.agent_role})</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{activity.success_rate.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">{activity.completed_tasks}/{activity.total_tasks} tasks</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};