import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plug, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Upload, 
  Download, 
  Shield,
  Zap,
  Building,
  Calendar,
  FileText,
  Users,
  BarChart3,
  Clock,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ATSIntegration {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  features: string[];
  lastSync?: string;
  jobsImported?: number;
  applicationsImported?: number;
}

interface SyncJob {
  id: string;
  type: 'import' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed';
  itemsProcessed: number;
  totalItems: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export const ATSIntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  // Mock data - in real app, fetch from API
  const [integrations] = useState<ATSIntegration[]>([
    {
      id: 'workday',
      name: 'Workday',
      logo: '/api/placeholder/40/40',
      description: 'Enterprise-grade HCM platform for large organizations',
      status: 'connected',
      features: ['Job Import', 'Application Export', 'Candidate Sync', 'Real-time Updates'],
      lastSync: '2024-01-15T10:30:00Z',
      jobsImported: 145,
      applicationsImported: 1250
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      logo: '/api/placeholder/40/40',
      description: 'Modern ATS for structured hiring processes',
      status: 'connected',
      features: ['Job Posting', 'Resume Parsing', 'Interview Scheduling', 'Analytics'],
      lastSync: '2024-01-15T08:45:00Z',
      jobsImported: 89,
      applicationsImported: 750
    },
    {
      id: 'lever',
      name: 'Lever',
      logo: '/api/placeholder/40/40',
      description: 'ATS and CRM platform for talent acquisition teams',
      status: 'disconnected',
      features: ['Pipeline Management', 'Team Collaboration', 'Custom Workflows'],
      jobsImported: 0,
      applicationsImported: 0
    },
    {
      id: 'bamboohr',
      name: 'BambooHR',
      logo: '/api/placeholder/40/40',
      description: 'HR software for small and medium businesses',
      status: 'error',
      features: ['Employee Records', 'Applicant Tracking', 'Onboarding'],
      lastSync: '2024-01-14T16:20:00Z',
      jobsImported: 34,
      applicationsImported: 210
    },
    {
      id: 'smartrecruiters',
      name: 'SmartRecruiters',
      logo: '/api/placeholder/40/40',
      description: 'Talent Acquisition Suite for enterprises',
      status: 'disconnected',
      features: ['Global Hiring', 'AI Matching', 'Compliance', 'Reporting'],
      jobsImported: 0,
      applicationsImported: 0
    }
  ]);

  const [syncJobs] = useState<SyncJob[]>([
    {
      id: '1',
      type: 'import',
      status: 'completed',
      itemsProcessed: 145,
      totalItems: 145,
      startedAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:35:00Z'
    },
    {
      id: '2',
      type: 'export',
      status: 'running',
      itemsProcessed: 47,
      totalItems: 120,
      startedAt: '2024-01-15T11:00:00Z'
    },
    {
      id: '3',
      type: 'import',
      status: 'failed',
      itemsProcessed: 0,
      totalItems: 89,
      startedAt: '2024-01-15T09:15:00Z',
      completedAt: '2024-01-15T09:20:00Z',
      error: 'API authentication failed'
    }
  ]);

  const handleConnect = useCallback(async (integrationId: string) => {
    setIsSyncing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully connected to ${integrationId}`);
    } catch (error) {
      toast.error('Connection failed. Please check your credentials.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleDisconnect = useCallback(async (integrationId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Disconnected from ${integrationId}`);
    } catch (error) {
      toast.error('Disconnection failed. Please try again.');
    }
  }, []);

  const handleSync = useCallback(async (integrationId: string) => {
    setIsSyncing(true);
    
    try {
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Sync completed successfully');
    } catch (error) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ATS Integration Hub</h1>
          <p className="text-gray-600">Connect and sync with popular Applicant Tracking Systems</p>
        </div>
        <Button 
          onClick={() => handleSync('all')}
          disabled={isSyncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync All'}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Systems</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'connected').length}</div>
            <p className="text-xs text-muted-foreground">
              Out of {integrations.length} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Imported</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + (i.jobsImported || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Synced</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + (i.applicationsImported || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">
              All systems
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sync-jobs">Sync Jobs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={integration.logo} 
                        alt={integration.name}
                        className="w-10 h-10 rounded-lg border"
                      />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {getStatusIcon(integration.status)}
                        </CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(integration.status) as any}>
                        {integration.status}
                      </Badge>
                      {integration.status === 'connected' ? (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSync(integration.id)}
                            disabled={isSyncing}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                          disabled={isSyncing}
                        >
                          <Plug className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {integration.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    {integration.status === 'connected' && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Jobs Imported</p>
                          <p className="text-lg font-medium">{integration.jobsImported}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Applications</p>
                          <p className="text-lg font-medium">{integration.applicationsImported}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Sync</p>
                          <p className="text-lg font-medium">
                            {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {integration.status === 'error' && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Connection error detected. Please check your credentials and try reconnecting.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sync Jobs Tab */}
        <TabsContent value="sync-jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Jobs</CardTitle>
              <CardDescription>Monitor the status of import and export operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {job.type === 'import' ? (
                          <Download className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Upload className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-medium capitalize">{job.type}</span>
                      </div>
                      <div>
                        <p className="text-sm">
                          {job.itemsProcessed}/{job.totalItems} items processed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Started: {new Date(job.startedAt).toLocaleString()}
                        </p>
                        {job.error && (
                          <p className="text-xs text-red-500">{job.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant={getSyncStatusColor(job.status) as any}>
                          {job.status}
                        </Badge>
                        {job.status === 'running' && (
                          <div className="mt-1 w-24">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(job.itemsProcessed / job.totalItems) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6">
            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  API Configuration
                </CardTitle>
                <CardDescription>
                  Configure API keys and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Global API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input
                    placeholder="https://your-domain.com/webhooks/ats"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button>Save Configuration</Button>
              </CardContent>
            </Card>

            {/* Sync Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Sync Settings
                </CardTitle>
                <CardDescription>
                  Configure how and when data synchronization occurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Sync</p>
                    <p className="text-sm text-muted-foreground">Automatically sync data every hour</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-sm text-muted-foreground">Push updates instantly via webhooks</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Conflict Resolution</p>
                    <p className="text-sm text-muted-foreground">Prefer local changes over remote</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage security and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Encryption</p>
                    <p className="text-sm text-muted-foreground">Encrypt data in transit and at rest</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Log all sync activities for compliance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Anonymization</p>
                    <p className="text-sm text-muted-foreground">Remove PII from sync logs</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sync Performance
                </CardTitle>
                <CardDescription>
                  Monitor sync success rates and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span>94%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[94%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Sync Time</span>
                      <span>2.3 minutes</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[76%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Quality Score</span>
                      <span>87%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full w-[87%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>
                  Status overview of all connected systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integrations.filter(i => i.status === 'connected').map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={integration.logo} 
                          alt={integration.name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-sm">{integration.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">Healthy</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Monthly overview of integration usage and data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">2,340</p>
                  <p className="text-sm text-muted-foreground">Jobs Synced</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">18,500</p>
                  <p className="text-sm text-muted-foreground">Applications Processed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">156</p>
                  <p className="text-sm text-muted-foreground">Sync Operations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">99.2%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};