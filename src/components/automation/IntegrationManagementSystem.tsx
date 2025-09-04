import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Link, Settings, CheckCircle, AlertCircle, Clock, 
  Database, Globe, Smartphone, Mail, Calendar, Users
} from 'lucide-react';
import { TieredAccessGuard } from '@/components/access/TieredAccessGuard';
import { UsageMeter } from '@/components/ui/usage-meter';

interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'email' | 'calendar' | 'social' | 'ats' | 'analytics';
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: Date;
  syncFrequency: string;
  dataPoints: number;
  icon: string;
  features: string[];
  usage: {
    requests: number;
    limit: number;
    period: string;
  };
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  responseTime: number;
  successRate: number;
  lastUsed: Date;
  rateLimited: boolean;
}

interface WebhookEvent {
  id: string;
  source: string;
  event: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'pending';
  data: any;
  retries: number;
}

const IntegrationManagementSystem: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [integrationStats, setIntegrationStats] = useState({
    totalIntegrations: 0,
    activeIntegrations: 0,
    syncErrors: 0,
    dataPointsSynced: 0
  });

  useEffect(() => {
    loadIntegrations();
    loadAPIEndpoints();
    loadWebhookEvents();
    loadStats();
  }, []);

  const loadIntegrations = () => {
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'LinkedIn',
        type: 'social',
        description: 'Sync professional profile and network data',
        status: 'connected',
        lastSync: new Date(Date.now() - 1800000),
        syncFrequency: 'hourly',
        dataPoints: 1247,
        icon: '💼',
        features: ['Profile Sync', 'Network Import', 'Job Alerts', 'Engagement Tracking'],
        usage: { requests: 850, limit: 1000, period: 'daily' }
      },
      {
        id: '2',
        name: 'Google Calendar',
        type: 'calendar',
        description: 'Schedule interviews and career events',
        status: 'connected',
        lastSync: new Date(Date.now() - 900000),
        syncFrequency: 'real-time',
        dataPoints: 456,
        icon: '📅',
        features: ['Event Scheduling', 'Interview Reminders', 'Availability Sync'],
        usage: { requests: 234, limit: 500, period: 'daily' }
      },
      {
        id: '3',
        name: 'Gmail',
        type: 'email',
        description: 'Automate job application follow-ups',
        status: 'connected',
        lastSync: new Date(Date.now() - 600000),
        syncFrequency: 'real-time',
        dataPoints: 789,
        icon: '📧',
        features: ['Email Templates', 'Auto Follow-up', 'Response Tracking'],
        usage: { requests: 156, limit: 250, period: 'daily' }
      },
      {
        id: '4',
        name: 'Greenhouse ATS',
        type: 'ats',
        description: 'Track application status and feedback',
        status: 'error',
        lastSync: new Date(Date.now() - 86400000),
        syncFrequency: 'daily',
        dataPoints: 0,
        icon: '🌱',
        features: ['Application Tracking', 'Status Updates', 'Interview Scheduling'],
        usage: { requests: 0, limit: 100, period: 'daily' }
      },
      {
        id: '5',
        name: 'HubSpot CRM',
        type: 'crm',
        description: 'Manage professional contacts and relationships',
        status: 'disconnected',
        lastSync: new Date(Date.now() - 172800000),
        syncFrequency: 'daily',
        dataPoints: 0,
        icon: '🏢',
        features: ['Contact Management', 'Deal Tracking', 'Email Integration'],
        usage: { requests: 0, limit: 500, period: 'daily' }
      }
    ];
    setIntegrations(mockIntegrations);
  };

  const loadAPIEndpoints = () => {
    const mockEndpoints: APIEndpoint[] = [
      {
        id: '1',
        name: 'Get Profile Data',
        method: 'GET',
        endpoint: '/api/v1/profile',
        description: 'Fetch user profile information',
        responseTime: 245,
        successRate: 99.2,
        lastUsed: new Date(Date.now() - 300000),
        rateLimited: false
      },
      {
        id: '2',
        name: 'Sync Job Applications',
        method: 'POST',
        endpoint: '/api/v1/applications/sync',
        description: 'Synchronize job application data',
        responseTime: 1250,
        successRate: 97.8,
        lastUsed: new Date(Date.now() - 1800000),
        rateLimited: false
      },
      {
        id: '3',
        name: 'Update Contact Info',
        method: 'PUT',
        endpoint: '/api/v1/contacts/:id',
        description: 'Update professional contact information',
        responseTime: 456,
        successRate: 95.4,
        lastUsed: new Date(Date.now() - 3600000),
        rateLimited: true
      }
    ];
    setApiEndpoints(mockEndpoints);
  };

  const loadWebhookEvents = () => {
    const mockEvents: WebhookEvent[] = [
      {
        id: '1',
        source: 'LinkedIn',
        event: 'profile_updated',
        timestamp: new Date(Date.now() - 1800000),
        status: 'success',
        data: { profileField: 'experience', changes: 2 },
        retries: 0
      },
      {
        id: '2',
        source: 'Gmail',
        event: 'email_received',
        timestamp: new Date(Date.now() - 3600000),
        status: 'success',
        data: { sender: 'recruiter@company.com', subject: 'Interview Invitation' },
        retries: 0
      },
      {
        id: '3',
        source: 'Greenhouse ATS',
        event: 'application_status_changed',
        timestamp: new Date(Date.now() - 7200000),
        status: 'failed',
        data: { applicationId: 'APP-123', newStatus: 'interview_scheduled' },
        retries: 2
      }
    ];
    setWebhookEvents(mockEvents);
  };

  const loadStats = () => {
    setIntegrationStats({
      totalIntegrations: 5,
      activeIntegrations: 3,
      syncErrors: 1,
      dataPointsSynced: 2492
    });
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? {
            ...integration,
            status: integration.status === 'connected' ? 'disconnected' : 'connected'
          }
        : integration
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TieredAccessGuard feature="integration_management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Link className="h-6 w-6 text-primary" />
              Integration Management System
            </h2>
            <p className="text-muted-foreground">Connect and manage all your career tools in one place</p>
          </div>
          <Button>
            <Link className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>

        <UsageMeter type="dailyAIRequests" currentUsage={18} label="API Requests" />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Link className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Integrations</p>
                  <p className="font-bold text-xl">{integrationStats.totalIntegrations}</p>
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
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="font-bold text-xl">{integrationStats.activeIntegrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sync Errors</p>
                  <p className="font-bold text-xl">{integrationStats.syncErrors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="font-bold text-xl">{integrationStats.dataPointsSynced.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="integrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api">API Management</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="outline">{integration.type}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <Switch
                          checked={integration.status === 'connected'}
                          onCheckedChange={() => toggleIntegration(integration.id)}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Sync</p>
                        <p className="font-medium">{integration.lastSync.toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data Points</p>
                        <p className="font-medium">{integration.dataPoints.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>API Usage</span>
                        <span>{integration.usage.requests}/{integration.usage.limit}</span>
                      </div>
                      <Progress 
                        value={(integration.usage.requests / integration.usage.limit) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        Test Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="space-y-4">
              {apiEndpoints.map((endpoint) => (
                <Card key={endpoint.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <h3 className="font-semibold">{endpoint.name}</h3>
                          <p className="text-sm text-muted-foreground">{endpoint.endpoint}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Response Time</p>
                          <p className="font-medium">{endpoint.responseTime}ms</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium text-green-600">{endpoint.successRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Last Used</p>
                          <p className="font-medium">{endpoint.lastUsed.toLocaleTimeString()}</p>
                        </div>
                        {endpoint.rateLimited && (
                          <Badge variant="outline" className="text-orange-600">
                            Rate Limited
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="space-y-3">
              {webhookEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          event.status === 'success' ? 'bg-green-500' :
                          event.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h3 className="font-semibold">{event.source}</h3>
                          <p className="text-sm text-muted-foreground">{event.event}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <span className="text-muted-foreground">
                          {event.timestamp.toLocaleString()}
                        </span>
                        {event.retries > 0 && (
                          <Badge variant="outline">
                            {event.retries} retries
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TieredAccessGuard>
  );
};

export default IntegrationManagementSystem;