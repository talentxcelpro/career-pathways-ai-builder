import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Home, 
  Plus, 
  Edit, 
  Eye,
  Trash2,
  Users,
  Activity,
  TrendingUp,
  MousePointer,
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const HomeManagement = () => {
  const [selectedSection, setSelectedSection] = useState<'metrics' | 'announcements' | 'content'>('metrics');

  // Real-time dashboard metrics
  const { data: realTimeMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['real-time-metrics'],
    queryFn: async () => {
      // Simulate real-time data
      return {
        dailyActiveUsers: 8234 + Math.floor(Math.random() * 500),
        dailyLogins: 12456 + Math.floor(Math.random() * 800),
        pageViews: 45678 + Math.floor(Math.random() * 2000),
        conversionRate: 3.2 + (Math.random() * 0.5),
        lastUpdated: new Date().toLocaleTimeString()
      };
    },
    refetchInterval: 5000 // Update every 5 seconds
  });

  const { data: announcements } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      return [
        {
          id: '1',
          title: 'Platform Maintenance Scheduled',
          content: 'We will be performing scheduled maintenance on Saturday night.',
          type: 'maintenance',
          is_active: true,
          priority: 'high',
          created_at: new Date().toISOString(),
          views: 1250
        },
        {
          id: '2',
          title: 'New Features Released',
          content: 'Check out our latest AI-powered job matching features.',
          type: 'feature',
          is_active: true,
          priority: 'medium',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          views: 2340
        }
      ];
    }
  });

  const metricsCards = [
    {
      title: 'Daily Active Users',
      value: realTimeMetrics?.dailyActiveUsers?.toLocaleString() || '0',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Daily Logins',
      value: realTimeMetrics?.dailyLogins?.toLocaleString() || '0',
      change: '+8%',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Page Views',
      value: realTimeMetrics?.pageViews?.toLocaleString() || '0',
      change: '+15%',
      icon: MousePointer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Conversion Rate',
      value: `${realTimeMetrics?.conversionRate?.toFixed(1) || '0.0'}%`,
      change: '+0.5%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const renderMetricsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Real-time Platform Metrics</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Last updated: {realTimeMetrics?.lastUpdated || 'Loading...'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className={`absolute inset-0 ${metric.bgColor} opacity-10`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  <Badge variant="outline" className="text-green-600">
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metric Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Auto-refresh Dashboard</h4>
                <p className="text-sm text-muted-foreground">Automatically update metrics every 5 seconds</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Show Growth Indicators</h4>
                <p className="text-sm text-muted-foreground">Display percentage change indicators</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Public Metrics Display</h4>
                <p className="text-sm text-muted-foreground">Show selected metrics on homepage</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnnouncementsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Platform Announcements</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements?.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {announcement.content}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {announcement.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      announcement.priority === 'high' ? 'destructive' :
                      announcement.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {announcement.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{announcement.views?.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderContentSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Homepage Content Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Main Headline</label>
              <Input defaultValue="Find Your Dream Job Today" />
            </div>
            <div>
              <label className="text-sm font-medium">Subheadline</label>
              <Textarea defaultValue="Connect with top employers and discover opportunities that match your skills and aspirations." />
            </div>
            <Button className="w-full">Update Hero Section</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Featured Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Jobs Posted</label>
                <Input defaultValue="10,000+" />
              </div>
              <div>
                <label className="text-sm font-medium">Companies</label>
                <Input defaultValue="500+" />
              </div>
              <div>
                <label className="text-sm font-medium">Success Stories</label>
                <Input defaultValue="5,000+" />
              </div>
              <div>
                <label className="text-sm font-medium">Active Users</label>
                <Input defaultValue="25,000+" />
              </div>
            </div>
            <Button className="w-full">Update Stats</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SEO & Meta Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Page Title</label>
            <Input defaultValue="TalentXcel Pro - Find Your Dream Job" />
          </div>
          <div>
            <label className="text-sm font-medium">Meta Description</label>
            <Textarea defaultValue="Discover your next career opportunity with TalentXcel Pro. Connect with top employers, build your professional network, and advance your career." />
          </div>
          <div>
            <label className="text-sm font-medium">Keywords</label>
            <Input defaultValue="jobs, careers, recruitment, hiring, talent, professional network" />
          </div>
          <Button>Update SEO Settings</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <UnifiedAdminLayout 
      title="Home & Dashboard Management" 
      description="Manage homepage content, announcements, and platform metrics"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          {[
            { key: 'metrics', label: 'Real-time Metrics', icon: TrendingUp },
            { key: 'announcements', label: 'Announcements', icon: Home },
            { key: 'content', label: 'Content Management', icon: Edit }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedSection(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedSection === tab.key
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {selectedSection === 'metrics' && renderMetricsSection()}
        {selectedSection === 'announcements' && renderAnnouncementsSection()}
        {selectedSection === 'content' && renderContentSection()}
      </div>
    </UnifiedAdminLayout>
  );
};

export default HomeManagement;