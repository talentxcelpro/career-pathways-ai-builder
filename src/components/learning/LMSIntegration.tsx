import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Settings, 
  Download, 
  Upload, 
  RefreshCw, 
  Database,
  Shield,
  BarChart3,
  Globe,
  Zap,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface LMSPlatform {
  id: string;
  name: string;
  logo: string;
  description: string;
  features: string[];
  status: 'connected' | 'available' | 'pending';
  students?: number;
  courses?: number;
}

const lmsPlatforms: LMSPlatform[] = [
  {
    id: 'moodle',
    name: 'Moodle',
    logo: '🎓',
    description: 'Open-source learning platform used by universities worldwide',
    features: ['Course Management', 'Grade Book', 'Forums', 'Quizzes', 'Assignments'],
    status: 'connected',
    students: 2500,
    courses: 150
  },
  {
    id: 'canvas',
    name: 'Canvas LMS',
    logo: '🎨',
    description: 'Modern, user-friendly learning management system',
    features: ['Mobile Learning', 'Video Conferencing', 'Analytics', 'Gradebook'],
    status: 'available',
  },
  {
    id: 'blackboard',
    name: 'Blackboard Learn',
    logo: '⚫',
    description: 'Enterprise-grade LMS for higher education',
    features: ['Collaborative Learning', 'Assessment Tools', 'Content Management'],
    status: 'available',
  },
  {
    id: 'coursera',
    name: 'Coursera for Business',
    logo: '💼',
    description: 'Professional development platform with university partnerships',
    features: ['Industry Certifications', 'Skill Assessments', 'Learning Paths'],
    status: 'pending',
  },
  {
    id: 'scorm',
    name: 'SCORM Packages',
    logo: '📦',
    description: 'Industry standard for e-learning content packaging',
    features: ['Content Tracking', 'Progress Monitoring', 'Cross-Platform'],
    status: 'connected',
    students: 1200,
    courses: 75
  }
];

export const LMSIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('platforms');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete'>('idle');

  const handleConnect = (platformId: string) => {
    toast.info(`Connecting to ${lmsPlatforms.find(p => p.id === platformId)?.name}...`);
    // Simulate connection process
    setTimeout(() => {
      toast.success('Successfully connected to LMS platform!');
    }, 2000);
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    toast.info('Starting LMS synchronization...');
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('complete');
      toast.success('LMS data synchronized successfully!');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 4000);
  };

  const handleExport = (format: string) => {
    toast.info(`Exporting courses in ${format} format...`);
    // Simulate export process
    setTimeout(() => {
      toast.success(`Courses exported successfully in ${format} format!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">LMS Integration</h2>
          <p className="text-muted-foreground mt-2">
            Connect with external Learning Management Systems and sync course data
          </p>
        </div>
        <Button onClick={handleSync} disabled={syncStatus === 'syncing'}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync All'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lmsPlatforms.map((platform) => (
              <Card key={platform.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.logo}</span>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                    </div>
                    <Badge variant={
                      platform.status === 'connected' ? 'default' :
                      platform.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {platform.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {platform.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {platform.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {platform.status === 'connected' && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{platform.students}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{platform.courses}</div>
                        <div className="text-xs text-muted-foreground">Courses</div>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full" 
                    variant={platform.status === 'connected' ? 'outline' : 'default'}
                    onClick={() => handleConnect(platform.id)}
                  >
                    {platform.status === 'connected' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Manage
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import courses from external LMS platforms or file formats
                </p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Import from Moodle
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Import SCORM Package
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Import CSV File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export course data in various formats for backup or migration
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('SCORM')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as SCORM
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('CSV')}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('JSON')}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { platform: 'Moodle', time: '2 hours ago', status: 'success', count: '45 courses' },
                  { platform: 'SCORM Package', time: '1 day ago', status: 'success', count: '12 courses' },
                  { platform: 'Canvas LMS', time: '3 days ago', status: 'error', count: '0 courses' },
                ].map((sync, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                        {sync.status}
                      </Badge>
                      <div>
                        <div className="font-medium">{sync.platform}</div>
                        <div className="text-sm text-muted-foreground">{sync.time}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{sync.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">5</div>
                <p className="text-sm text-muted-foreground">Active LMS connections</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Synced Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">3,700</div>
                <p className="text-sm text-muted-foreground">Across all platforms</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Synced Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">225</div>
                <p className="text-sm text-muted-foreground">From external LMS</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Integration Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-sync</h4>
                    <p className="text-sm text-muted-foreground">Automatically sync data every 24 hours</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Grade passback</h4>
                    <p className="text-sm text-muted-foreground">Send grades back to external LMS</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SSO Integration</h4>
                    <p className="text-sm text-muted-foreground">Single sign-on with LMS platforms</p>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Settings
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Key Rotation</span>
                    <Badge variant="outline">30 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Encryption</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Logging</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};