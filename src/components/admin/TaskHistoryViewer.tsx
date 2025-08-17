import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  Users,
  Brain,
  Zap
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BusinessTask {
  id: string;
  agent_id: string | null;
  action: string;
  status: string;
  payload: any;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  source: string;
  attempts: number;
  ai_agents?: {
    handle: string;
    display_name: string;
    role: string;
  } | null;
}

interface TaskOutput {
  type: string;
  title: string;
  details: any;
  metrics?: any;
}

export const TaskHistoryViewer: React.FC = () => {
  const [tasks, setTasks] = useState<BusinessTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const fetchBusinessTasks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('agent_tasks')
        .select('*')
        .not('action', 'eq', 'scheduled_task')  // Exclude heartbeat tasks
        .not('source', 'eq', 'admin_fallback')  // Exclude admin fallback tasks
        .not('source', 'eq', 'admin_test_fallback')  // Exclude test tasks
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (selectedAgent !== 'all') {
        query = query.eq('agent_id', selectedAgent);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching business tasks:', error);
        toast.error('Failed to fetch task history');
        return;
      }

      setTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching business tasks:', error);
      toast.error(`Failed to fetch task history: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessTasks();
  }, [selectedStatus, selectedAgent]);

  const filteredTasks = tasks.filter(task => 
    searchTerm === '' || 
    task.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.payload && JSON.stringify(task.payload).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTaskIcon = (action: string) => {
    switch (action) {
      case 'content_generation':
      case 'learning_path':
      case 'career_advice':
        return <FileText className="h-4 w-4" />;
      case 'email_campaign':
      case 'email_notification':
        return <Mail className="h-4 w-4" />;
      case 'job_matching':
      case 'job_recommendation':
        return <Briefcase className="h-4 w-4" />;
      case 'resume_parsing':
      case 'profile_analysis':
        return <Users className="h-4 w-4" />;
      case 'ai_processing':
        return <Brain className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'running': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'running': return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatTaskOutput = (task: BusinessTask): TaskOutput | null => {
    if (!task.payload) return null;

    switch (task.action) {
      case 'content_generation':
      case 'learning_path':
      case 'career_advice':
        return {
          type: 'Content',
          title: task.payload.title || 'Content Generated',
          details: {
            topic: task.payload.skillTarget || task.payload.roleOrDomain,
            audience: task.payload.audience,
            wordCount: task.payload.wordCount || 'N/A'
          }
        };
      
      case 'email_campaign':
        return {
          type: 'Email',
          title: 'Email Campaign',
          details: {
            recipients: task.payload.recipients || 'N/A',
            subject: task.payload.subject || 'N/A',
            type: task.payload.type || 'notification'
          },
          metrics: {
            sent: task.payload.emailsSent || 0,
            openRate: task.payload.openRate || 0,
            clickRate: task.payload.clickRate || 0
          }
        };
      
      case 'job_matching':
        return {
          type: 'Job Matching',
          title: 'Job Recommendations',
          details: {
            profilesAnalyzed: task.payload.profilesAnalyzed || 0,
            matchesFound: task.payload.matchesFound || 0,
            avgMatchScore: task.payload.avgMatchScore || 0
          }
        };
      
      case 'resume_parsing':
        return {
          type: 'Resume Analysis',
          title: 'Resume Processed',
          details: {
            skills: task.payload.skillsExtracted || [],
            experience: task.payload.experienceYears || 'N/A',
            education: task.payload.education || 'N/A'
          }
        };
      
      default:
        return {
          type: 'Task',
          title: task.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          details: task.payload
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Business Task History</h3>
          <p className="text-muted-foreground">Real AI agent work and outcomes (excluding system heartbeats)</p>
        </div>
        <Button onClick={fetchBusinessTasks} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, agents, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {/* Add agent options dynamically */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Execution History ({filteredTasks.length})</CardTitle>
          <CardDescription>Detailed history of actual AI agent business tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Output</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const output = formatTaskOutput(task);
                  return (
                    <React.Fragment key={task.id}>
                      <TableRow>
                        <TableCell className="font-mono text-xs">
                          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{task.agent_id ? `Agent ${task.agent_id.slice(0, 8)}` : 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">AI Agent</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTaskIcon(task.action)}
                            <span className="font-medium">{task.action.replace(/_/g, ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{task.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {output && (
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{output.title}</span>
                              <span className="text-xs text-muted-foreground">{output.type}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedTask === task.id && output && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/50">
                            <div className="p-4 space-y-3">
                              <h4 className="font-medium">Task Details</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Task ID:</strong> {task.id}
                                </div>
                                <div>
                                  <strong>Source:</strong> {task.source}
                                </div>
                                <div>
                                  <strong>Attempts:</strong> {task.attempts}
                                </div>
                                <div>
                                  <strong>Duration:</strong> {
                                    task.started_at && task.completed_at
                                      ? `${Math.round((new Date(task.completed_at).getTime() - new Date(task.started_at).getTime()) / 1000)}s`
                                      : 'N/A'
                                  }
                                </div>
                              </div>
                              
                              <div>
                                <strong>Output Details:</strong>
                                <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                                  {JSON.stringify(output.details, null, 2)}
                                </pre>
                              </div>

                              {output.metrics && (
                                <div>
                                  <strong>Performance Metrics:</strong>
                                  <pre className="mt-1 p-2 bg-background rounded text-xs overflow-x-auto">
                                    {JSON.stringify(output.metrics, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {task.error_message && (
                                <div>
                                  <strong>Error:</strong>
                                  <p className="mt-1 p-2 bg-red-50 text-red-700 rounded text-sm">
                                    {task.error_message}
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {isLoading ? 'Loading business tasks...' : 'No business tasks found. Only system heartbeat tasks detected.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {filteredTasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTasks.filter(t => t.status === 'running').length}
            </div>
            <div className="text-sm text-muted-foreground">Running Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredTasks.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredTasks.filter(t => t.status === 'failed').length}
            </div>
            <div className="text-sm text-muted-foreground">Failed Tasks</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};