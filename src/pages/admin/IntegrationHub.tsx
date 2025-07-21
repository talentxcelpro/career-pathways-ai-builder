import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Database, 
  Webhook, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Plus,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

const IntegrationHub = () => {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Mock data - replace with real data from useAdvancedAdmin hook
  const integrations = [
    {
      id: 'google-analytics',
      name: 'Google Analytics 4',
      description: 'Advanced web analytics and reporting',
      category: 'Analytics',
      status: 'connected',
      icon: BarChart3,
      lastSync: '2 minutes ago',
      config: { trackingId: 'GA4-XXXXXXX', enhanced: true }
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Email delivery and marketing automation',
      category: 'Email',
      status: 'connected',
      icon: Mail,
      lastSync: '5 minutes ago',
      config: { apiKey: 'SG.xxxxx', templates: 12 }
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'Communication',
      status: 'disconnected',
      icon: MessageSquare,
      lastSync: 'Never',
      config: {}
    },
    {
      id: 'webhooks',
      name: 'Custom Webhooks',
      description: 'Custom webhook integrations',
      category: 'Developer',
      status: 'connected',
      icon: Webhook,
      lastSync: '1 hour ago',
      config: { endpoints: 3 }
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      category: 'Automation',
      status: 'available',
      icon: Zap,
      lastSync: 'Not connected',
      config: {}
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'CRM and sales automation',
      category: 'CRM',
      status: 'available',
      icon: Database,
      lastSync: 'Not connected',
      config: {}
    }
  ];

  const webhooks = [
    {
      id: 1,
      name: 'User Registration',
      url: 'https://api.example.com/webhooks/user-signup',
      events: ['user.created', 'user.verified'],
      status: 'active',
      lastTriggered: '2 minutes ago'
    },
    {
      id: 2,
      name: 'Job Application',
      url: 'https://crm.company.com/api/applications',
      events: ['application.submitted', 'application.status_changed'],
      status: 'active',
      lastTriggered: '15 minutes ago'
    },
    {
      id: 3,
      name: 'Payment Processing',
      url: 'https://billing.service.com/webhooks',
      events: ['payment.success', 'payment.failed'],
      status: 'inactive',
      lastTriggered: '2 days ago'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
      case 'available':
        return <Badge variant="outline">Available</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setIsConfiguring(true);
  };

  const categories = ['All', 'Analytics', 'Email', 'Communication', 'Developer', 'Automation', 'CRM'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIntegrations = selectedCategory === 'All' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">Connect and manage third-party integrations</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Integration</DialogTitle>
              <DialogDescription>Configure a custom webhook or API integration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration-name">Integration Name</Label>
                <Input id="integration-name" placeholder="My Custom Integration" />
              </div>
              <div>
                <Label htmlFor="integration-type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select integration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="api">REST API</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endpoint-url">Endpoint URL</Label>
                <Input id="endpoint-url" placeholder="https://api.example.com/webhook" />
              </div>
              <Button className="w-full">Create Integration</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      {getStatusBadge(integration.status)}
                    </div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="outline">{integration.category}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>{integration.lastSync}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1 gap-2">
                            <Settings className="h-3 w-3" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleConnect(integration)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhook Endpoints</CardTitle>
                  <CardDescription>Manage webhook configurations and monitoring</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{webhook.name}</h3>
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{webhook.url}</p>
                      <div className="flex gap-1">
                        {webhook.events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last triggered</p>
                      <p className="text-sm font-medium">{webhook.lastTriggered}</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm">
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage API keys for external integrations</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Production API Key</h3>
                    <p className="text-sm text-muted-foreground">pk_live_••••••••••••••••</p>
                    <p className="text-xs text-muted-foreground mt-1">Created 2 months ago</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Copy</Button>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Development API Key</h3>
                    <p className="text-sm text-muted-foreground">pk_test_••••••••••••••••</p>
                    <p className="text-xs text-muted-foreground mt-1">Created 1 week ago</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Copy</Button>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Activity Logs</CardTitle>
              <CardDescription>Recent integration activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 minutes ago', event: 'SendGrid email sent successfully', status: 'success' },
                  { time: '5 minutes ago', event: 'Google Analytics data synced', status: 'success' },
                  { time: '15 minutes ago', event: 'Webhook endpoint called', status: 'success' },
                  { time: '1 hour ago', event: 'Slack notification failed', status: 'error' },
                  { time: '2 hours ago', event: 'API rate limit exceeded', status: 'warning' }
                ].map((log, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border-l-2 border-l-primary pl-4">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' : 
                      log.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.event}</p>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationHub;