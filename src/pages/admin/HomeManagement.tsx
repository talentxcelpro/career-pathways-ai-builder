
import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Activity,
  Calendar,
  Settings
} from 'lucide-react';

const HomeManagement = () => {
  const [banners, setBanners] = useState([
    {
      id: '1',
      title: 'Welcome to TalentXcel',
      content: 'Find your dream job with AI-powered matching and personalized career guidance',
      type: 'hero',
      isActive: true,
      priority: 1,
      cta_text: 'Get Started',
      cta_link: '/register'
    },
    {
      id: '2',
      title: 'New AI Resume Builder',
      content: 'Create professional resumes with our AI-powered builder tool',
      type: 'announcement',
      isActive: true,
      priority: 2,
      cta_text: 'Try Now',
      cta_link: '/tools/resume-builder'
    },
    {
      id: '3',
      title: 'Career Path Planning',
      content: 'Discover your ideal career path with our AI career advisor',
      type: 'feature',
      isActive: false,
      priority: 3,
      cta_text: 'Explore',
      cta_link: '/career-map'
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      title: 'Platform Maintenance',
      message: 'Scheduled maintenance on Sunday 2 AM - 4 AM EST',
      type: 'warning',
      isActive: true,
      expiresAt: '2024-03-15',
      targetAudience: 'all'
    },
    {
      id: '2',
      title: 'New Features Released',
      message: 'Check out our new interview preparation tools and salary calculator',
      type: 'info',
      isActive: true,
      expiresAt: '2024-02-28',
      targetAudience: 'job_seekers'
    }
  ]);

  const platformStats = [
    { label: 'Daily Active Users', value: '8,234', change: '+12%', icon: Users },
    { label: 'Daily Logins', value: '12,456', change: '+8%', icon: Activity },
    { label: 'Page Views', value: '45,678', change: '+15%', icon: Eye },
    { label: 'Conversion Rate', value: '3.2%', change: '+0.5%', icon: BarChart3 }
  ];

  const [newBanner, setNewBanner] = useState({
    title: '',
    content: '',
    type: 'announcement',
    cta_text: '',
    cta_link: ''
  });

  const [showBannerForm, setShowBannerForm] = useState(false);

  const addBanner = () => {
    if (newBanner.title && newBanner.content) {
      setBanners([...banners, {
        ...newBanner,
        id: Date.now().toString(),
        isActive: true,
        priority: banners.length + 1
      }]);
      setNewBanner({ title: '', content: '', type: 'announcement', cta_text: '', cta_link: '' });
      setShowBannerForm(false);
    }
  };

  const toggleBanner = (id: string) => {
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
    ));
  };

  const deleteBanner = (id: string) => {
    setBanners(banners.filter(banner => banner.id !== id));
  };

  return (
    <UnifiedAdminLayout 
      title="Home & Dashboard Management" 
      description="Manage homepage content, announcements, and platform metrics"
    >
      <div className="space-y-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Homepage Banners & Hero Sections</CardTitle>
              <Button onClick={() => setShowBannerForm(!showBannerForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Banner
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showBannerForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-3">Create New Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Banner title"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                  />
                  <Select value={newBanner.type} onValueChange={(value) => setNewBanner({...newBanner, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero Banner</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="feature">Feature Highlight</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="CTA Button Text"
                    value={newBanner.cta_text}
                    onChange={(e) => setNewBanner({...newBanner, cta_text: e.target.value})}
                  />
                  <Input
                    placeholder="CTA Link"
                    value={newBanner.cta_link}
                    onChange={(e) => setNewBanner({...newBanner, cta_link: e.target.value})}
                  />
                </div>
                <Textarea
                  placeholder="Banner content"
                  className="mt-4"
                  value={newBanner.content}
                  onChange={(e) => setNewBanner({...newBanner, content: e.target.value})}
                />
                <div className="flex gap-2 mt-4">
                  <Button onClick={addBanner}>Create Banner</Button>
                  <Button variant="outline" onClick={() => setShowBannerForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{banner.title}</h3>
                      <Badge variant={banner.type === 'hero' ? 'default' : 
                                    banner.type === 'announcement' ? 'secondary' : 'outline'}>
                        {banner.type}
                      </Badge>
                      <Switch 
                        checked={banner.isActive} 
                        onCheckedChange={() => toggleBanner(banner.id)}
                      />
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{banner.content}</p>
                    {banner.cta_text && (
                      <div className="text-xs text-blue-600">
                        CTA: "{banner.cta_text}" → {banner.cta_link}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => deleteBanner(banner.id)}
                    >
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
              <Button>
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
                      <Badge variant={announcement.type === 'warning' ? 'destructive' : 
                                    announcement.type === 'info' ? 'default' : 'secondary'}>
                        {announcement.type}
                      </Badge>
                      <Badge variant="outline">{announcement.targetAudience}</Badge>
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

        {/* Quick Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Maintenance Mode</span>
                <Switch />
              </div>
              <div className="flex justify-between items-center">
                <span>User Registration</span>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <span>Job Posting</span>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <span>AI Features</span>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                SEO Settings
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Content
              </Button>
              <Button className="w-full" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>New banner activated</span>
                  <span className="text-gray-500 ml-auto">2m ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Announcement published</span>
                  <span className="text-gray-500 ml-auto">1h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Content updated</span>
                  <span className="text-gray-500 ml-auto">3h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UnifiedAdminLayout>
  );
};

export default HomeManagement;
