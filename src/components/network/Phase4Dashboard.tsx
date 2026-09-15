import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Workflow, 
  Bot, 
  Globe, 
  Shield, 
  Zap, 
  Settings, 
  Database,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Mail,
  Webhook
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  status: 'active' | 'inactive';
  executions: number;
  successRate: number;
}

interface IntegrationConfig {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'email';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  recordsProcessed: number;
}

interface AutomationMetrics {
  totalWorkflows: number;
  activeAutomations: number;
  dailyExecutions: number;
  successRate: number;
  timeSaved: number;
  costReduction: number;
}

export default function Phase4Dashboard() {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    totalWorkflows: 0,
    activeAutomations: 0,
    dailyExecutions: 0,
    successRate: 0,
    timeSaved: 0,
    costReduction: 0
  });
  const [autoScalingEnabled, setAutoScalingEnabled] = useState(false);
  const [processingLimit, setProcessingLimit] = useState([1000]);
  const [loading, setLoading] = useState(false);

  const createWorkflow = async (template: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enterprise-automation', {
        body: {
          action: 'create_workflow',
          template,
          config: {
            autoScale: autoScalingEnabled,
            maxProcessing: processingLimit[0]
          }
        }
      });

      if (error) throw error;

      toast.success(`Created ${template} workflow successfully`);
      loadWorkflows();
    } catch (error) {
      console.error('Workflow creation failed:', error);
      toast.error('Failed to create workflow');
    }
    setLoading(false);
  };

  const setupIntegration = async (integrationType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enterprise-integrations', {
        body: {
          action: 'setup_integration',
          type: integrationType,
          config: {
            realtime: true,
            batchSize: processingLimit[0]
          }
        }
      });

      if (error) throw error;

      toast.success(`${integrationType} integration configured successfully`);
      loadIntegrations();
    } catch (error) {
      console.error('Integration setup failed:', error);
      toast.error('Failed to setup integration');
    }
    setLoading(false);
  };

  const runSystemOptimization = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-optimizer', {
        body: {
          mode: 'enterprise',
          optimizations: [
            'database_indexing',
            'query_optimization',
            'cache_warming',
            'resource_allocation'
          ]
        }
      });

      if (error) throw error;

      toast.success('System optimization completed successfully');
      loadMetrics();
    } catch (error) {
      console.error('System optimization failed:', error);
      toast.error('Optimization failed');
    }
    setLoading(false);
  };

  const loadWorkflows = async () => {
    // Mock workflow data
    const mockWorkflows: WorkflowTemplate[] = [
      {
        id: '1',
        name: 'Auto CV Processing Pipeline',
        description: 'Automatically processes, enhances, and indexes uploaded CVs',
        triggers: ['CV Upload', 'Bulk Import'],
        actions: ['Parse', 'Enhance', 'Index', 'Notify'],
        status: 'active',
        executions: 2847,
        successRate: 98.5
      },
      {
        id: '2',
        name: 'Smart Candidate Matching',
        description: 'AI-powered matching with automatic notifications',
        triggers: ['Job Posted', 'Candidate Updated'],
        actions: ['Analyze', 'Match', 'Score', 'Notify'],
        status: 'active',
        executions: 1523,
        successRate: 96.2
      },
      {
        id: '3',
        name: 'Quality Assurance Automation',
        description: 'Automated QA checks and data validation',
        triggers: ['Data Import', 'Profile Update'],
        actions: ['Validate', 'Clean', 'Dedupe', 'Report'],
        status: 'active',
        executions: 892,
        successRate: 99.1
      }
    ];
    setWorkflows(mockWorkflows);
  };

  const loadIntegrations = async () => {
    // Mock integration data
    const mockIntegrations: IntegrationConfig[] = [
      {
        id: '1',
        name: 'LinkedIn API',
        type: 'api',
        status: 'connected',
        lastSync: '2025-09-29T18:30:00Z',
        recordsProcessed: 15640
      },
      {
        id: '2',
        name: 'Indeed Webhook',
        type: 'webhook',
        status: 'connected',
        lastSync: '2025-09-29T19:15:00Z',
        recordsProcessed: 8923
      },
      {
        id: '3',
        name: 'Email Notifications',
        type: 'email',
        status: 'connected',
        lastSync: '2025-09-29T19:40:00Z',
        recordsProcessed: 3456
      },
      {
        id: '4',
        name: 'External Database',
        type: 'database',
        status: 'error',
        lastSync: '2025-09-29T15:20:00Z',
        recordsProcessed: 0
      }
    ];
    setIntegrations(mockIntegrations);
  };

  const loadMetrics = async () => {
    const mockMetrics: AutomationMetrics = {
      totalWorkflows: 15,
      activeAutomations: 12,
      dailyExecutions: 5262,
      successRate: 97.8,
      timeSaved: 340,
      costReduction: 85
    };
    setMetrics(mockMetrics);
  };

  useEffect(() => {
    loadWorkflows();
    loadIntegrations();
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Workflow className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Phase 4: Enterprise Automation</h2>
          <p className="text-muted-foreground">Advanced workflows, integrations, and enterprise-grade automation</p>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Workflow className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Workflows</p>
              <p className="text-2xl font-bold">{metrics.totalWorkflows}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Automations</p>
              <p className="text-2xl font-bold">{metrics.activeAutomations}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Daily Executions</p>
              <p className="text-2xl font-bold">{metrics.dailyExecutions.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{metrics.successRate}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Hours Saved</p>
              <p className="text-2xl font-bold">{metrics.timeSaved}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Cost Reduction</p>
              <p className="text-2xl font-bold">{metrics.costReduction}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="scaling">Auto-Scaling</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Enterprise Workflow Templates</h3>
              <Button 
                onClick={() => createWorkflow('custom')} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Custom Workflow
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => createWorkflow('cv_processing')}
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">CV Processing Pipeline</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Automated CV parsing, enhancement, and indexing
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => createWorkflow('matching')}
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Smart Matching</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  AI-powered candidate-job matching with notifications
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => createWorkflow('quality_assurance')}
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Quality Assurance</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Automated data validation and quality checks
                </p>
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Active Workflows</h4>
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h5 className="font-medium">{workflow.name}</h5>
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {workflow.successRate}% success rate
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {workflow.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm">
                      <span>Executions: {workflow.executions.toLocaleString()}</span>
                      <span>Triggers: {workflow.triggers.length}</span>
                      <span>Actions: {workflow.actions.length}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Enterprise Integrations</h3>
              <Button 
                onClick={() => setupIntegration('custom')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                Add Integration
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setupIntegration('linkedin')}
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5" />
                  <span className="font-medium">LinkedIn Integration</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Real-time candidate data sync and profile enrichment
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setupIntegration('webhook')}
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Webhook className="h-5 w-5" />
                  <span className="font-medium">Webhook Endpoints</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Custom webhooks for real-time data processing
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setupIntegration('email')}
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">Email Automation</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Automated email campaigns and notifications
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setupIntegration('database')}
                disabled={loading}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5" />
                  <span className="font-medium">External Databases</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Connect to external HR systems and databases
                </p>
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Connected Integrations</h4>
              {integrations.map((integration) => (
                <div key={integration.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h5 className="font-medium">{integration.name}</h5>
                      <Badge 
                        variant={
                          integration.status === 'connected' ? 'default' : 
                          integration.status === 'error' ? 'destructive' : 'secondary'
                        }
                      >
                        {integration.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {integration.recordsProcessed.toLocaleString()} records
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Type: {integration.type}</span>
                      <span>Last sync: {new Date(integration.lastSync).toLocaleTimeString()}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Auto-Scaling Configuration</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm">Auto-Scaling</span>
                <Switch 
                  checked={autoScalingEnabled} 
                  onCheckedChange={setAutoScalingEnabled}
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Processing Limit (CVs per hour)
                </label>
                <Slider
                  value={processingLimit}
                  onValueChange={setProcessingLimit}
                  max={10000}
                  min={100}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>100</span>
                  <span>Current: {processingLimit[0].toLocaleString()}</span>
                  <span>10,000</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Resource Allocation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CPU Usage:</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <div className="flex justify-between">
                      <span>Memory:</span>
                      <span>32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Queue Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pending Jobs:</span>
                      <span>127</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing:</span>
                      <span>45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>2,847</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Avg Processing:</span>
                      <span>2.3s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Throughput:</span>
                      <span>845/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span>0.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Monitoring & Alerts</h3>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">System Health</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Database Performance</span>
                    </div>
                    <Badge variant="default">Optimal</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>API Response Time</span>
                    </div>
                    <Badge variant="default">45ms avg</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Queue Processing</span>
                    </div>
                    <Badge variant="secondary">High Load</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Storage Usage</span>
                    </div>
                    <Badge variant="default">23% used</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Recent Alerts</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-sm">High Processing Queue</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Queue size exceeded threshold (500+ items)
                    </p>
                    <span className="text-xs text-muted-foreground">2 minutes ago</span>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Auto-scaling Triggered</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Additional resources allocated successfully
                    </p>
                    <span className="text-xs text-muted-foreground">5 minutes ago</span>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Integration Sync Complete</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      LinkedIn API sync processed 1,247 updates
                    </p>
                    <span className="text-xs text-muted-foreground">15 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Optimization</h3>
              <Button 
                onClick={runSystemOptimization}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Run Optimization
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Database Optimization</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Index Optimization</span>
                      <Badge variant="default">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Query Performance</span>
                      <Badge variant="default">98% improvement</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Storage Compression</span>
                      <Badge variant="default">60% reduction</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Search Speed</span>
                      <Badge variant="default">150x faster</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Memory Usage</span>
                      <Badge variant="default">45% reduction</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>CPU Efficiency</span>
                      <Badge variant="default">35% improvement</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Optimization Results</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-green-600">340 Hours Saved</p>
                    <p className="text-muted-foreground">This month through automation</p>
                  </div>
                  <div>
                    <p className="font-medium text-blue-600">85% Cost Reduction</p>
                    <p className="text-muted-foreground">Compared to manual processing</p>
                  </div>
                  <div>
                    <p className="font-medium text-purple-600">97.8% Success Rate</p>
                    <p className="text-muted-foreground">Across all automated workflows</p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-600">Zero Downtime</p>
                    <p className="text-muted-foreground">With auto-scaling enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}