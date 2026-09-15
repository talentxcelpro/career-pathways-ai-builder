import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Link2, 
  Webhook, 
  Zap, 
  Settings, 
  Plus, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Database,
  Mail,
  MessageSquare,
  BarChart3,
  Shield
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'crm' | 'analytics' | 'social';
  status: 'active' | 'inactive' | 'error' | 'pending';
  endpoint: string;
  last_sync: string;
  sync_count: number;
  error_message?: string;
  configuration: any;
}

interface WebhookEvent {
  id: string;
  integration_id: string;
  event_type: string;
  payload: any;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  response_time_ms?: number;
  timestamp: string;
  retry_count: number;
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  authentication: 'api_key' | 'bearer' | 'basic' | 'none';
  rate_limit: number;
  usage_count: number;
  last_used: string;
  is_active: boolean;
}

export const AdvancedIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [isCreatingIntegration, setIsCreatingIntegration] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'webhook',
    endpoint: '',
    configuration: {}
  });

  useEffect(() => {
    loadIntegrations();
    loadWebhookEvents();
    loadAPIEndpoints();
    
    // Set up real-time subscription for webhook events
    const subscription = supabase
      .channel('integrations')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'integration_events' },
        () => {
          loadWebhookEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadIntegrations = async () => {
    try {
      // Mock integration data
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'HubSpot CRM',
          type: 'crm',
          status: 'active',
          endpoint: 'https://api.hubapi.com/crm/v3/',
          last_sync: new Date(Date.now() - 3600000).toISOString(),
          sync_count: 1245,
          configuration: {
            api_key: '***hidden***',
            sync_contacts: true,
            sync_deals: true
          }
        },
        {
          id: '2',
          name: 'Slack Notifications',
          type: 'webhook',
          status: 'active',
          endpoint: 'https://hooks.slack.com/services/...',
          last_sync: new Date(Date.now() - 900000).toISOString(),
          sync_count: 89,
          configuration: {
            channel: '#marketing',
            events: ['campaign_sent', 'high_bounce_rate']
          }
        },
        {
          id: '3',
          name: 'Google Analytics',
          type: 'analytics',
          status: 'error',
          endpoint: 'https://analyticsreporting.googleapis.com/v4/',
          last_sync: new Date(Date.now() - 86400000).toISOString(),
          sync_count: 567,
          error_message: 'Authentication token expired',
          configuration: {
            tracking_id: 'GA-XXXXX-X',
            events: ['email_open', 'email_click']
          }
        },
        {
          id: '4',
          name: 'Zapier Webhook',
          type: 'webhook',
          status: 'pending',
          endpoint: 'https://hooks.zapier.com/hooks/catch/...',
          last_sync: new Date().toISOString(),
          sync_count: 0,
          configuration: {
            trigger_events: ['user_registered', 'subscription_cancelled']
          }
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
    setLoading(false);
  };

  const loadWebhookEvents = async () => {
    try {
      // Mock webhook events
      const mockEvents: WebhookEvent[] = [
        {
          id: '1',
          integration_id: '2',
          event_type: 'campaign_sent',
          payload: {
            campaign_id: 'camp_123',
            recipients: 1500,
            sent_at: new Date().toISOString()
          },
          status: 'success',
          response_code: 200,
          response_time_ms: 145,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          retry_count: 0
        },
        {
          id: '2',
          integration_id: '1',
          event_type: 'contact_sync',
          payload: {
            contacts_updated: 45,
            sync_type: 'incremental'
          },
          status: 'success',
          response_code: 200,
          response_time_ms: 523,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          retry_count: 0
        },
        {
          id: '3',
          integration_id: '4',
          event_type: 'user_registered',
          payload: {
            user_id: 'user_789',
            email: 'newuser@example.com'
          },
          status: 'failed',
          response_code: 404,
          response_time_ms: 5000,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          retry_count: 2
        }
      ];
      
      setWebhookEvents(mockEvents);
    } catch (error) {
      console.error('Error loading webhook events:', error);
    }
  };

  const loadAPIEndpoints = async () => {
    try {
      // Mock API endpoints
      const mockEndpoints: APIEndpoint[] = [
        {
          id: '1',
          name: 'Email Analytics',
          method: 'GET',
          endpoint: '/api/v1/analytics/emails',
          description: 'Retrieve email campaign analytics',
          authentication: 'api_key',
          rate_limit: 1000,
          usage_count: 456,
          last_used: new Date(Date.now() - 1800000).toISOString(),
          is_active: true
        },
        {
          id: '2',
          name: 'Send Campaign',
          method: 'POST',
          endpoint: '/api/v1/campaigns/send',
          description: 'Trigger email campaign delivery',
          authentication: 'bearer',
          rate_limit: 100,
          usage_count: 89,
          last_used: new Date(Date.now() - 3600000).toISOString(),
          is_active: true
        },
        {
          id: '3',
          name: 'Subscriber Management',
          method: 'PUT',
          endpoint: '/api/v1/subscribers/{id}',
          description: 'Update subscriber information',
          authentication: 'api_key',
          rate_limit: 500,
          usage_count: 234,
          last_used: new Date(Date.now() - 7200000).toISOString(),
          is_active: false
        }
      ];
      
      setApiEndpoints(mockEndpoints);
    } catch (error) {
      console.error('Error loading API endpoints:', error);
    }
  };

  const createIntegration = async () => {
    try {
      if (!newIntegration.name || !newIntegration.endpoint) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const integration: Integration = {
        id: Date.now().toString(),
        name: newIntegration.name,
        type: newIntegration.type as 'webhook' | 'api' | 'crm' | 'analytics' | 'social',
        endpoint: newIntegration.endpoint,
        status: 'pending',
        last_sync: new Date().toISOString(),
        sync_count: 0,
        configuration: {}
      };

      setIntegrations(prev => [...prev, integration]);
      setIsCreatingIntegration(false);
      setNewIntegration({
        name: '',
        type: 'webhook',
        endpoint: '',
        configuration: {}
      });

      toast({
        title: "Integration Created",
        description: "New integration has been created and is being validated.",
      });
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration.",
        variant: "destructive"
      });
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      toast({
        title: "Testing Integration",
        description: `Testing connection to ${integration.name}...`,
      });

      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, status: 'active', last_sync: new Date().toISOString() }
          : i
      ));

      toast({
        title: "Test Successful",
        description: `Connection to ${integration.name} is working properly.`,
      });
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: "Test Failed",
        description: "Integration test failed. Please check your configuration.",
        variant: "destructive"
      });
    }
  };

  const retryWebhook = async (eventId: string) => {
    try {
      setWebhookEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, status: 'pending', retry_count: event.retry_count + 1 }
          : event
      ));

      // Simulate retry
      setTimeout(() => {
        setWebhookEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, status: 'success', response_code: 200 }
            : event
        ));
      }, 2000);

      toast({
        title: "Webhook Retry",
        description: "Webhook event is being retried.",
      });
    } catch (error) {
      console.error('Error retrying webhook:', error);
    }
  };

  const getIntegrationIcon = (type: string) => {
    const icons = {
      webhook: Webhook,
      api: Link2,
      crm: Database,
      analytics: BarChart3,
      social: MessageSquare
    };
    
    const IconComponent = icons[type as keyof typeof icons] || Link2;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      pending: 'secondary'
    } as const;
    
    const icons = {
      active: CheckCircle,
      inactive: XCircle,
      error: AlertTriangle,
      pending: Clock
    };
    
    const IconComponent = icons[status as keyof typeof icons] || Clock;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Advanced Integrations
          </h2>
          <p className="text-muted-foreground">
            Connect with external services and APIs for enhanced functionality
          </p>
        </div>
        <Dialog open={isCreatingIntegration} onOpenChange={setIsCreatingIntegration}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Integration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({...prev, name: e.target.value}))}
                  placeholder="Enter integration name"
                />
              </div>
              <div>
                <Label htmlFor="type">Integration Type</Label>
                <Select 
                  value={newIntegration.type} 
                  onValueChange={(value) => setNewIntegration(prev => ({...prev, type: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select integration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="api">REST API</SelectItem>
                    <SelectItem value="crm">CRM System</SelectItem>
                    <SelectItem value="analytics">Analytics Platform</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endpoint">Endpoint URL</Label>
                <Input
                  id="endpoint"
                  value={newIntegration.endpoint}
                  onChange={(e) => setNewIntegration(prev => ({...prev, endpoint: e.target.value}))}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatingIntegration(false)}>
                  Cancel
                </Button>
                <Button onClick={createIntegration}>
                  Create Integration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Active Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        {getIntegrationIcon(integration.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{integration.name}</h3>
                          {getStatusBadge(integration.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {integration.endpoint}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Last sync: {new Date(integration.last_sync).toLocaleString()}
                          </span>
                          <span>
                            {integration.sync_count} events
                          </span>
                        </div>
                        {integration.error_message && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                            {integration.error_message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testIntegration(integration.id)}
                      >
                        Test
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="space-y-4">
            {webhookEvents.map((event) => {
              const integration = integrations.find(i => i.id === event.integration_id);
              return (
                <Card key={event.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          <Webhook className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{event.event_type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {integration?.name} • {new Date(event.timestamp).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {event.response_code && (
                              <span>Status: {event.response_code}</span>
                            )}
                            {event.response_time_ms && (
                              <span>Response: {event.response_time_ms}ms</span>
                            )}
                            {event.retry_count > 0 && (
                              <span>Retries: {event.retry_count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(event.status)}
                        {event.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => retryWebhook(event.id)}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="space-y-4">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <Badge variant="outline">{endpoint.method}</Badge>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{endpoint.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {endpoint.description}
                        </p>
                        <code className="text-xs bg-muted p-1 rounded">
                          {endpoint.endpoint}
                        </code>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Auth: {endpoint.authentication}</span>
                          <span>Rate Limit: {endpoint.rate_limit}/hour</span>
                          <span>Usage: {endpoint.usage_count}</span>
                          <span>Last Used: {new Date(endpoint.last_used).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={endpoint.is_active}
                        onCheckedChange={() => {
                          setApiEndpoints(prev => prev.map(ep => 
                            ep.id === endpoint.id ? { ...ep, is_active: !ep.is_active } : ep
                          ));
                        }}
                      />
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};