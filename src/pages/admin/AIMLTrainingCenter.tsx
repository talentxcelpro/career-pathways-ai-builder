import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  TrendingUp
} from 'lucide-react';

const AIMLTrainingCenter = () => {
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const models = [
    {
      id: 'resume-scorer',
      name: 'Resume Scorer',
      type: 'GPT-4 Fine-tuned',
      status: 'active',
      accuracy: '94.2%',
      lastTrained: '2 days ago',
      usage: '1.2k requests/day'
    },
    {
      id: 'job-matcher',
      name: 'Job Matcher',
      type: 'Transformer',
      status: 'training',
      accuracy: '91.8%',
      lastTrained: 'Training...',
      usage: '890 requests/day'
    },
    {
      id: 'skill-analyzer',
      name: 'Skill Gap Analyzer',
      type: 'BERT Custom',
      status: 'pending',
      accuracy: '88.5%',
      lastTrained: '1 week ago',
      usage: '650 requests/day'
    }
  ];

  const datasets = [
    {
      id: 'resumes-2024',
      name: 'Resume Dataset 2024',
      size: '45,234 samples',
      type: 'Resumes & Scores',
      lastUpdated: '1 day ago',
      status: 'processed'
    },
    {
      id: 'job-descriptions',
      name: 'Job Descriptions',
      size: '12,890 samples',
      type: 'JD & Requirements',
      lastUpdated: '3 days ago',
      status: 'processing'
    },
    {
      id: 'user-interactions',
      name: 'User Interactions',
      size: '78,234 samples',
      type: 'Clicks & Preferences',
      lastUpdated: '6 hours ago',
      status: 'processed'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
      training: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-500' },
      pending: { variant: 'outline' as const, icon: AlertCircle, color: 'text-orange-500' },
      processed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
      processing: { variant: 'secondary' as const, icon: Clock, color: 'text-blue-500' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI/ML Training Center</h1>
          <p className="text-muted-foreground mt-2">
            Train, fine-tune, monitor, and manage AI models personalized for platform services
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          New Model
        </Button>
      </div>

      <Tabs defaultValue="datasets" className="space-y-6">
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Dataset Management</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Dataset
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Dataset
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {datasets.map((dataset) => (
              <Card key={dataset.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{dataset.name}</CardTitle>
                    <CardDescription>{dataset.type}</CardDescription>
                  </div>
                  {getStatusBadge(dataset.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{dataset.size}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{dataset.lastUpdated}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Clone</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="train" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Model Training</h2>
            <Button className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Training
            </Button>
          </div>

          <div className="grid gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription>{model.type}</CardDescription>
                  </div>
                  {getStatusBadge(model.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Accuracy</p>
                      <p className="font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        {model.accuracy}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Trained</p>
                      <p className="font-medium">{model.lastTrained}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Usage</p>
                      <p className="font-medium">{model.usage}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        {model.status === 'training' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button variant="outline" size="sm">Config</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Model Deployment</h2>
            <Button className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Deploy Model
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Models</CardTitle>
                <CardDescription>Currently live models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-muted-foreground text-sm">Active models</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staging Models</CardTitle>
                <CardDescription>Models ready for testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-muted-foreground text-sm">Ready to deploy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Development</CardTitle>
                <CardDescription>Models in development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-muted-foreground text-sm">In progress</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <h2 className="text-2xl font-semibold">Model Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24,531</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">145ms</div>
                <p className="text-xs text-muted-foreground">-5ms from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.2%</div>
                <p className="text-xs text-muted-foreground">+0.1% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.8%</div>
                <p className="text-xs text-muted-foreground">-0.1% from last week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-semibold">Model Settings</h2>
          <Card>
            <CardHeader>
              <CardTitle>Global Configuration</CardTitle>
              <CardDescription>System-wide AI/ML settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Configure global AI model settings, rate limits, and security policies.</p>
              <Button>Configure Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <h2 className="text-2xl font-semibold">Model Versions</h2>
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Track and manage model versions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">View version history, rollback capabilities, and performance comparisons.</p>
              <Button>View Versions</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <h2 className="text-2xl font-semibold">Test Prompts</h2>
          <Card>
            <CardHeader>
              <CardTitle>Model Testing</CardTitle>
              <CardDescription>Test and validate model responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Create test scenarios, validate model outputs, and perform A/B testing.</p>
              <Button>Create Test</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <h2 className="text-2xl font-semibold">Logs & Usage</h2>
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Monitor AI system activities and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Access detailed logs, error reports, and usage analytics.</p>
              <Button>View Logs</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIMLTrainingCenter;