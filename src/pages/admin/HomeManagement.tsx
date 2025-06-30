
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Megaphone,
  BarChart3,
  Users,
  Activity
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

const HomeManagement = () => {
  const [banners, setBanners] = useState([
    {
      id: '1',
      title: 'Welcome to TalentXcel',
      content: 'Find your dream job with AI-powered matching',
      type: 'hero',
      isActive: true,
      priority: 1
    },
    {
      id: '2',
      title: 'New Feature Alert',
      content: 'Try our new resume builder tool',
      type: 'announcement',
      isActive: true,
      priority: 2
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      title: 'Platform Maintenance',
      message: 'Scheduled maintenance on Sunday 2 AM - 4 AM',
      type: 'warning',
      isActive: true,
      expiresAt: '2024-02-15'
    }
  ]);

  const platformStats = [
    { label: 'Daily Active Users', value: '8,234', change: '+12%', icon: Users },
    { label: 'Daily Logins', value: '12,456', change: '+8%', icon: Activity },
    { label: 'Page Views', value: '45,678', change: '+15%', icon: Eye },
    { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', icon: BarChart3 }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Home & Dashboard Management</h1>
              <p className="text-gray-600">Manage homepage content, announcements, and platform metrics</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Content
            </Button>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {platformStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <stat.icon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Homepage Banners */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Homepage Banners & Hero Sections</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Banner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{banner.title}</h3>
                        <Badge variant={banner.type === 'hero' ? 'default' : 'secondary'}>
                          {banner.type}
                        </Badge>
                        <Switch checked={banner.isActive} />
                      </div>
                      <p className="text-gray-600 text-sm">{banner.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Announcements & Alerts</CardTitle>
                <Button size="sm">
                  <Megaphone className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <Badge variant={announcement.type === 'warning' ? 'destructive' : 'default'}>
                          {announcement.type}
                        </Badge>
                        <Switch checked={announcement.isActive} />
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{announcement.message}</p>
                      <p className="text-xs text-gray-500">Expires: {announcement.expiresAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomeManagement;
