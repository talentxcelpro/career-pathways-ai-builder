import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, Plus, Play, Pause, Settings, Clock, CheckCircle, 
  AlertTriangle, BarChart3, Users, Calendar, Mail 
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  steps: WorkflowStep[];
  executions: number;
  successRate: number;
  lastRun: Date;
  createdAt: Date;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  popularity: number;
}

const AutomatedWorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [workflowStats, setWorkflowStats] = useState({
    totalExecutions: 0,
    activeWorkflows: 0,
    avgSuccessRate: 0,
    timeSaved: 0
  });

  useEffect(() => {
    loadWorkflows();
    loadTemplates();
    loadStats();
  }, []);

  const loadWorkflows = () => {
    const mockWorkflows: Workflow[] = [
      {
        id: '1',
        name: 'Auto-Apply to Jobs',
        description: 'Automatically apply to jobs matching your criteria',
        status: 'active',
        trigger: 'new_job_posted',
        steps: [],
        executions: 245,
        successRate: 87,
        lastRun: new Date(Date.now() - 3600000),
        createdAt: new Date(Date.now() - 86400000 * 7)
      },
      {
        id: '2',
        name: 'Follow-up Reminders',
        description: 'Send follow-up emails after job applications',
        status: 'active',
        trigger: 'application_submitted',
        steps: [],
        executions: 156,
        successRate: 94,
        lastRun: new Date(Date.now() - 7200000),
        createdAt: new Date(Date.now() - 86400000 * 14)
      },
      {
        id: '3',
        name: 'Network Engagement',
        description: 'Automatically engage with network connections',
        status: 'paused',
        trigger: 'new_connection',
        steps: [],
        executions: 89,
        successRate: 76,
        lastRun: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 86400000 * 21)
      }
    ];
    setWorkflows(mockWorkflows);
  };

  const loadTemplates = () => {
    const mockTemplates: WorkflowTemplate[] = [
      {
        id: '1',
        name: 'Job Application Automation',
        description: 'Complete job application workflow with follow-ups',
        category: 'Job Search',
        steps: [],
        popularity: 95
      },
      {
        id: '2',
        name: 'Network Growth',
        description: 'Automated networking and relationship building',
        category: 'Networking',
        steps: [],
        popularity: 78
      },
      {
        id: '3',
        name: 'Interview Preparation',
        description: 'Automated interview prep and scheduling',
        category: 'Interview',
        steps: [],
        popularity: 82
      },
      {
        id: '4',
        name: 'Skill Development Tracker',
        description: 'Track and schedule learning activities',
        category: 'Learning',
        steps: [],
        popularity: 71
      }
    ];
    setTemplates(mockTemplates);
  };

  const loadStats = () => {
    setWorkflowStats({
      totalExecutions: 1247,
      activeWorkflows: 8,
      avgSuccessRate: 85,
      timeSaved: 156 // hours
    });
  };

  const createWorkflow = (template?: WorkflowTemplate) => {
    setIsCreating(true);
    // Implementation for workflow creation
  };

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId 
        ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
        : w
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TieredAccessGuard feature="workflow_automation">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Automated Workflow Builder
            </h2>
            <p className="text-muted-foreground">Create and manage intelligent career automation workflows</p>
          </div>
          <Button onClick={() => createWorkflow()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={12} label="Workflow Executions" />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Executions</p>
                  <p className="font-bold text-xl">{workflowStats.totalExecutions.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Workflows</p>
                  <p className="font-bold text-xl">{workflowStats.activeWorkflows}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="font-bold text-xl">{workflowStats.avgSuccessRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Saved</p>
                  <p className="font-bold text-xl">{workflowStats.timeSaved}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="workflows" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(workflow.status)}
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Executions</p>
                        <p className="font-semibold">{workflow.executions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-semibold text-green-600">{workflow.successRate}%</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Performance</span>
                        <span>{workflow.successRate}%</span>
                      </div>
                      <Progress value={workflow.successRate} className="h-2" />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last run: {workflow.lastRun.toLocaleString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={workflow.status === 'active' ? 'outline' : 'default'}
                        onClick={() => toggleWorkflow(workflow.id)}
                        className="flex-1"
                      >
                        {workflow.status === 'active' ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Popularity</span>
                          <span>{template.popularity}%</span>
                        </div>
                        <Progress value={template.popularity} className="h-2" />
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => createWorkflow(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visual Workflow Builder</CardTitle>
                <p className="text-muted-foreground">Drag and drop to create custom automation workflows</p>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Start Building Your Workflow</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a trigger to get started, then add actions and conditions to create your automation.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium">Schedule</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
                      <Mail className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium">Email</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
                      <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-sm font-medium">Network</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer">
                      <BarChart3 className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-sm font-medium">Analytics</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Workflow Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">Auto-Apply to Jobs executed successfully</p>
                    <p className="text-xs text-muted-foreground">Applied to 3 new positions</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2 min ago</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">Follow-up Reminders sent</p>
                    <p className="text-xs text-muted-foreground">5 follow-up emails scheduled</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-medium">Network Engagement workflow paused</p>
                    <p className="text-xs text-muted-foreground">Rate limit reached, will resume tomorrow</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">3 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TieredAccessGuard>
  );
};

export default AutomatedWorkflowBuilder;