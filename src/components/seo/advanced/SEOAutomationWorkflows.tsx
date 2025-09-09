import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  AlertTriangle,
  Target,
  BarChart3,
  Mail
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  actions: string[];
  frequency: string;
  lastRun: string;
  nextRun: string;
  success: number;
}

interface AutomationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export const SEOAutomationWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Daily Keyword Rank Monitoring',
      description: 'Track ranking changes for top 50 keywords daily',
      status: 'active',
      trigger: 'Daily at 6:00 AM',
      actions: ['Check rankings', 'Update database', 'Send alerts if rank drops >3'],
      frequency: 'Daily',
      lastRun: '2024-01-15 06:00:00',
      nextRun: '2024-01-16 06:00:00',
      success: 98
    },
    {
      id: '2',
      name: 'Weekly Content Optimization',
      description: 'Automatically optimize existing content based on new keyword opportunities',
      status: 'active',
      trigger: 'Weekly on Sunday',
      actions: ['Scan content', 'Identify optimization opportunities', 'Generate suggestions'],
      frequency: 'Weekly',
      lastRun: '2024-01-14 10:00:00',
      nextRun: '2024-01-21 10:00:00',
      success: 87
    },
    {
      id: '3',
      name: 'Competitor Analysis',
      description: 'Monitor competitor backlinks and keyword changes',
      status: 'paused',
      trigger: 'Weekly on Friday',
      actions: ['Crawl competitor sites', 'Analyze backlinks', 'Report new opportunities'],
      frequency: 'Weekly',
      lastRun: '2024-01-12 14:00:00',
      nextRun: 'Paused',
      success: 92
    }
  ]);

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Rank Drop Alert',
      condition: 'When keyword rank drops by 3+ positions',
      action: 'Send email alert + Create optimization task',
      enabled: true
    },
    {
      id: '2',
      name: 'New Keyword Opportunity',
      condition: 'When new high-volume keyword found in search console',
      action: 'Add to keyword tracking + Generate content suggestion',
      enabled: true
    },
    {
      id: '3',
      name: 'Page Speed Alert',
      condition: 'When page load time increases by 2+ seconds',
      action: 'Send alert + Auto-optimize images',
      enabled: false
    }
  ]);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: '',
    frequency: 'daily'
  });

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === id 
        ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
        : workflow
    ));
  };

  const toggleRule = (id: string) => {
    setAutomationRules(automationRules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            SEO Automation Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workflows" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="rules">Automation Rules</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workflows" className="space-y-4">
              <div className="grid gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(workflow.status)}
                          <h3 className="font-medium">{workflow.name}</h3>
                          <Badge className={getStatusColor(workflow.status)} variant="secondary">
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleWorkflow(workflow.id)}
                          >
                            {workflow.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {workflow.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Frequency</div>
                          <div className="font-medium">{workflow.frequency}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Last Run</div>
                          <div className="font-medium text-sm">{workflow.lastRun}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Next Run</div>
                          <div className="font-medium text-sm">{workflow.nextRun}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                          <div className="font-medium text-green-600">{workflow.success}%</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Actions</div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.actions.map((action, index) => (
                            <Badge key={index} variant="outline" size="sm">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="rules" className="space-y-4">
              <div className="grid gap-4">
                {automationRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{rule.name}</h3>
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => toggleRule(rule.id)}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="text-muted-foreground">When:</span>
                              <span>{rule.condition}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="h-4 w-4 text-blue-500" />
                              <span className="text-muted-foreground">Then:</span>
                              <span>{rule.action}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Workflow Name</label>
                    <Input
                      placeholder="e.g., Monthly Technical SEO Audit"
                      value={newWorkflow.name}
                      onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe what this workflow does..."
                      value={newWorkflow.description}
                      onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Frequency</label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={newWorkflow.frequency}
                      onChange={(e) => setNewWorkflow({...newWorkflow, frequency: e.target.value})}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Trigger Condition</label>
                    <Input
                      placeholder="e.g., Every Monday at 9:00 AM"
                      value={newWorkflow.trigger}
                      onChange={(e) => setNewWorkflow({...newWorkflow, trigger: e.target.value})}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium mb-3">Workflow Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Card className="p-3 cursor-pointer hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="text-sm">Check keyword rankings</span>
                        </div>
                      </Card>
                      <Card className="p-3 cursor-pointer hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-sm">Analyze competitor changes</span>
                        </div>
                      </Card>
                      <Card className="p-3 cursor-pointer hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span className="text-sm">Run technical SEO audit</span>
                        </div>
                      </Card>
                      <Card className="p-3 cursor-pointer hover:bg-accent">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm">Send performance report</span>
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workflow
                    </Button>
                    <Button variant="outline">Save as Draft</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};