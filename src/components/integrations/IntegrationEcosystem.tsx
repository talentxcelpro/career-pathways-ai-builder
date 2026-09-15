import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Linkedin, 
  Github, 
  Building2, 
  Shield, 
  Cloud, 
  Database, 
  Link, 
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Integration {
  id: string;
  name: string;
  category: 'social' | 'hr' | 'ats' | 'verification' | 'storage' | 'analytics';
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: React.ReactNode;
  features: string[];
  lastSync?: string;
}

export const IntegrationEcosystem: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'LinkedIn',
      category: 'social',
      description: 'Sync your professional profile and network',
      status: 'connected',
      icon: <Linkedin className="h-5 w-5" />,
      features: ['Profile sync', 'Network import', 'Job recommendations'],
      lastSync: '2024-03-25 14:30'
    },
    {
      id: '2',
      name: 'GitHub',
      category: 'social',
      description: 'Showcase your development portfolio',
      status: 'connected',
      icon: <Github className="h-5 w-5" />,
      features: ['Repository sync', 'Contribution history', 'Skills verification'],
      lastSync: '2024-03-25 12:15'
    },
    {
      id: '3',
      name: 'Workday',
      category: 'hr',
      description: 'Enterprise HR system integration',
      status: 'disconnected',
      icon: <Building2 className="h-5 w-5" />,
      features: ['Employee verification', 'Performance data', 'Training records']
    },
    {
      id: '4',
      name: 'Greenhouse',
      category: 'ats',
      description: 'Applicant tracking system sync',
      status: 'pending',
      icon: <Database className="h-5 w-5" />,
      features: ['Application status', 'Interview scheduling', 'Feedback sync']
    },
    {
      id: '5',
      name: 'Checkr',
      category: 'verification',
      description: 'Background check verification',
      status: 'connected',
      icon: <Shield className="h-5 w-5" />,
      features: ['Background verification', 'Reference checks', 'Identity validation'],
      lastSync: '2024-03-24 09:20'
    },
    {
      id: '6',
      name: 'Google Cloud',
      category: 'storage',
      description: 'Cloud storage for documents and media',
      status: 'error',
      icon: <Cloud className="h-5 w-5" />,
      features: ['Document storage', 'Media hosting', 'Backup & sync']
    }
  ]);

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
        return { ...integration, status: newStatus };
      }
      return integration;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIntegrations = (category: string) => {
    return integrations.filter(integration => integration.category === category);
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="space-y-6">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Integration Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{connectedCount}</div>
              <div className="text-xs text-muted-foreground">Connected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {integrations.filter(i => i.status === 'disconnected').length}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {integrations.filter(i => i.status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {integrations.filter(i => i.status === 'error').length}
              </div>
              <div className="text-xs text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="hr">HR Systems</TabsTrigger>
              <TabsTrigger value="ats">ATS</TabsTrigger>
              <TabsTrigger value="verification">Verify</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {['social', 'hr', 'ats', 'verification', 'storage', 'analytics'].map(category => (
              <TabsContent key={category} value={category} className="space-y-4 mt-4">
                {getCategoryIntegrations(category).map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {integration.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(integration.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(integration.status)}
                            {integration.status}
                          </span>
                        </Badge>
                        <Switch
                          checked={integration.status === 'connected'}
                          onCheckedChange={() => handleToggleIntegration(integration.id)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {integration.lastSync && (
                      <div className="text-xs text-muted-foreground">
                        Last sync: {integration.lastSync}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </div>
                  </div>
                ))}

                {getCategoryIntegrations(category).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No integrations available in this category yet.
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};