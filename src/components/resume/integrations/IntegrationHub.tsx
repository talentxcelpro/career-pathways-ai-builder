import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Link2, CheckCircle, AlertCircle, ExternalLink, 
  Briefcase, Users, BarChart3, Bell, Settings,
  Linkedin, Globe, Mail, Calendar, Download
} from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationHubProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'available' | 'premium';
  category: 'job-boards' | 'social' | 'ats' | 'analytics';
  features: string[];
}

export const IntegrationHub: React.FC<IntegrationHubProps> = ({
  isOpen,
  onClose
}) => {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);

  const integrations: Integration[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Sync your profile and import experience data',
      icon: <Linkedin className="h-6 w-6 text-blue-600" />,
      status: 'connected',
      category: 'social',
      features: ['Profile Sync', 'Experience Import', 'Network Analysis']
    },
    {
      id: 'naukri',
      name: 'Naukri.com',
      description: 'Apply directly and track applications',
      icon: <Briefcase className="h-6 w-6 text-blue-500" />,
      status: 'available',
      category: 'job-boards',
      features: ['Direct Apply', 'Application Tracking', 'Job Matching']
    },
    {
      id: 'indeed',
      name: 'Indeed',
      description: 'Search and apply to jobs seamlessly',
      icon: <Globe className="h-6 w-6 text-blue-700" />,
      status: 'available',
      category: 'job-boards',
      features: ['Job Search', 'One-Click Apply', 'Salary Insights']
    },
    {
      id: 'workday',
      name: 'Workday ATS',
      description: 'Preview how your resume appears in Workday',
      icon: <Users className="h-6 w-6 text-orange-600" />,
      status: 'premium',
      category: 'ats',
      features: ['ATS Preview', 'Formatting Check', 'Compatibility Score']
    },
    {
      id: 'greenhouse',
      name: 'Greenhouse ATS',
      description: 'Optimize for Greenhouse applicant tracking',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      status: 'premium',
      category: 'ats',
      features: ['ATS Preview', 'Score Analysis', 'Optimization Tips']
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track resume views and engagement',
      icon: <BarChart3 className="h-6 w-6 text-red-600" />,
      status: 'connected',
      category: 'analytics',
      features: ['View Tracking', 'Engagement Metrics', 'Source Analysis']
    }
  ];

  const handleConnect = async (integrationId: string) => {
    // Would handle OAuth flow or API connection
    toast.success(`Connected to ${integrations.find(i => i.id === integrationId)?.name}!`);
  };

  const handleDisconnect = async (integrationId: string) => {
    // Would revoke access and clean up data
    toast.success(`Disconnected from ${integrations.find(i => i.id === integrationId)?.name}`);
  };

  const handleLinkedInSync = async () => {
    if (!linkedinUrl) {
      toast.error('Please enter your LinkedIn profile URL');
      return;
    }
    // Would sync LinkedIn data
    toast.success('LinkedIn profile data imported successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integration Hub
          </CardTitle>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </CardHeader>
        
        <CardContent className="h-full overflow-y-auto p-6">
          <Tabs defaultValue="job-boards" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="job-boards">Job Boards</TabsTrigger>
              <TabsTrigger value="social">Social & Profile</TabsTrigger>
              <TabsTrigger value="ats">ATS Systems</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="job-boards" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.filter(i => i.category === 'job-boards').map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {integration.icon}
                          <span>{integration.name}</span>
                        </div>
                        <Badge 
                          variant={
                            integration.status === 'connected' ? 'default' : 
                            integration.status === 'premium' ? 'secondary' : 'outline'
                          }
                        >
                          {integration.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      
                      <div>
                        <h4 className="font-medium mb-2">Features</h4>
                        <div className="space-y-1">
                          {integration.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {integration.status === 'connected' ? (
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Connection
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full text-red-600"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleConnect(integration.id)}
                          className="w-full"
                          disabled={integration.status === 'premium'}
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          {integration.status === 'premium' ? 'Upgrade to Connect' : 'Connect'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Job Application Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-sync Applications</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically track applications across connected job boards
                      </p>
                    </div>
                    <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">23</p>
                      <p className="text-sm text-muted-foreground">Applications Sent</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">8</p>
                      <p className="text-sm text-muted-foreground">Responses Received</p>
                    </div>
                    <div className="p-3 border rounded-lg text-center">
                      <p className="text-2xl font-bold text-orange-600">3</p>
                      <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.filter(i => i.category === 'social').map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {integration.icon}
                          <span>{integration.name}</span>
                        </div>
                        <Badge variant="default">Connected</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Import LinkedIn Data</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                          />
                          <Button onClick={handleLinkedInSync}>
                            <Download className="h-4 w-4 mr-2" />
                            Import
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Sync Settings</h4>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between">
                            <span className="text-sm">Auto-sync experience updates</span>
                            <Switch />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-sm">Import skills & endorsements</span>
                            <Switch />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-sm">Sync profile photo</span>
                            <Switch />
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ats" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.filter(i => i.category === 'ats').map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {integration.icon}
                          <span>{integration.name}</span>
                        </div>
                        <Badge variant="secondary">Premium</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      
                      <div className="p-3 border rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-900">ATS Compatibility Score</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-2xl font-bold text-blue-700">85%</span>
                          <Badge variant="outline">Good</Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span>Standard fonts used</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span>Clear section headers</span>
                          </div>
                          <div className="flex items-center gap-2 text-orange-700">
                            <AlertCircle className="h-4 w-4" />
                            <span>Add more industry keywords</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full" disabled>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Upgrade to Preview
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.filter(i => i.category === 'analytics').map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {integration.icon}
                          <span>{integration.name}</span>
                        </div>
                        <Badge variant="default">Connected</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-xl font-bold text-blue-600">1,247</p>
                          <p className="text-xs text-muted-foreground">Total Views</p>
                        </div>
                        <div className="p-3 border rounded-lg text-center">
                          <p className="text-xl font-bold text-green-600">2m 34s</p>
                          <p className="text-xs text-muted-foreground">Avg. Time</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Notification Settings</h4>
                        <div className="space-y-2">
                          <label className="flex items-center justify-between">
                            <span className="text-sm">Weekly analytics report</span>
                            <Switch />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-sm">Real-time view alerts</span>
                            <Switch />
                          </label>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Detailed Analytics
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};