import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  MessageSquare, 
  Briefcase, 
  Users, 
  Settings,
  CheckCircle,
  Clock,
  Smartphone,
  Mail,
  Calendar
} from 'lucide-react';
import { useNotificationPersonalization } from '@/hooks/useNotificationPersonalization';
import { useToast } from '@/hooks/use-toast';

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  description: string;
  subcategories?: {
    id: string;
    name: string;
    enabled: boolean;
  }[];
}

export const NotificationPreferences: React.FC = () => {
  const { preferences, isLoading, savePreferences } = useNotificationPersonalization();
  const { toast } = useToast();

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'push',
      name: 'Push Notifications',
      icon: <Smartphone className="h-4 w-4" />,
      enabled: true,
      description: 'Instant notifications on your device'
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      enabled: true,
      description: 'Email notifications and digests'
    },
    {
      id: 'in_app',
      name: 'In-App',
      icon: <Bell className="h-4 w-4" />,
      enabled: true,
      description: 'Notifications within the platform'
    }
  ]);

  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'jobs',
      name: 'Job Opportunities',
      icon: <Briefcase className="h-4 w-4" />,
      enabled: true,
      frequency: 'instant',
      description: 'New job matches and application updates',
      subcategories: [
        { id: 'job_match', name: 'Job Matches', enabled: true },
        { id: 'application_status', name: 'Application Status', enabled: true },
        { id: 'job_recommendations', name: 'Job Recommendations', enabled: true }
      ]
    },
    {
      id: 'network',
      name: 'Network & Connections',
      icon: <Users className="h-4 w-4" />,
      enabled: true,
      frequency: 'instant',
      description: 'Connection requests and network updates',
      subcategories: [
        { id: 'connection_request', name: 'Connection Requests', enabled: true },
        { id: 'profile_view', name: 'Profile Views', enabled: false },
        { id: 'network_updates', name: 'Network Updates', enabled: true }
      ]
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: <MessageSquare className="h-4 w-4" />,
      enabled: true,
      frequency: 'instant',
      description: 'Direct messages and communications'
    },
    {
      id: 'system',
      name: 'System Updates',
      icon: <Settings className="h-4 w-4" />,
      enabled: true,
      frequency: 'daily',
      description: 'Account updates and system notifications'
    }
  ]);

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: 22, // 10 PM
    end: 8 // 8 AM
  });

  const [digestSettings, setDigestSettings] = useState({
    enabled: true,
    frequency: 'daily',
    time: '09:00'
  });

  const toggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
  };

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, enabled: !category.enabled }
        : category
    ));
  };

  const updateCategoryFrequency = (categoryId: string, frequency: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, frequency: frequency as any }
        : category
    ));
  };

  const toggleSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId && category.subcategories
        ? {
            ...category,
            subcategories: category.subcategories.map(sub =>
              sub.id === subcategoryId
                ? { ...sub, enabled: !sub.enabled }
                : sub
            )
          }
        : category
    ));
  };

  const handleSave = async () => {
    const preferenceData = {
      email_enabled: channels.find(c => c.id === 'email')?.enabled || false,
      push_enabled: channels.find(c => c.id === 'push')?.enabled || false,
      sms_enabled: false,
      sound_enabled: true,
      frequency_limit: 10,
      priority_filter: 'all' as const,
      ai_optimization: true,
      quiet_hours_start: quietHours.enabled ? `${quietHours.start.toString().padStart(2, '0')}:00` : undefined,
      quiet_hours_end: quietHours.enabled ? `${quietHours.end.toString().padStart(2, '0')}:00` : undefined,
      categories: {
        jobs: categories.find(c => c.id === 'jobs')?.enabled || false,
        network: categories.find(c => c.id === 'network')?.enabled || false,
        learning: categories.find(c => c.id === 'learning')?.enabled || false,
        companies: categories.find(c => c.id === 'companies')?.enabled || false,
        resume: categories.find(c => c.id === 'resume')?.enabled || false,
        tools: categories.find(c => c.id === 'tools')?.enabled || false,
        colleges: categories.find(c => c.id === 'colleges')?.enabled || false,
        career_feed: categories.find(c => c.id === 'career_feed')?.enabled || false,
        discover: categories.find(c => c.id === 'discover')?.enabled || false,
      }
    };

    try {
      await savePreferences(preferenceData);
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Notification Preferences</h2>
          <p className="text-muted-foreground">Customize how and when you receive notifications</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Save Preferences
        </Button>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="digest">Digest</TabsTrigger>
        </TabsList>

        {/* Notification Channels */}
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {channel.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{channel.name}</h4>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={() => toggleChannel(channel.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Categories */}
        <TabsContent value="categories" className="space-y-6">
          <div className="space-y-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={category.enabled}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                  </div>
                </CardHeader>
                {category.enabled && (
                  <CardContent className="space-y-4">
                    {/* Frequency Setting */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Frequency</span>
                      <Select
                        value={category.frequency}
                        onValueChange={(value) => updateCategoryFrequency(category.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subcategories */}
                    {category.subcategories && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-muted-foreground">Specific Types</h5>
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center justify-between pl-4">
                            <span className="text-sm">{subcategory.name}</span>
                            <Switch
                              checked={subcategory.enabled}
                              onCheckedChange={() => toggleSubcategory(category.id, subcategory.id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Timing Settings */}
        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Quiet Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    Pause non-urgent notifications during specified hours
                  </p>
                </div>
                <Switch
                  checked={quietHours.enabled}
                  onCheckedChange={(enabled) => setQuietHours(prev => ({ ...prev, enabled }))}
                />
              </div>

              {quietHours.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <Select
                        value={quietHours.start.toString()}
                        onValueChange={(value) => setQuietHours(prev => ({ ...prev, start: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <Select
                        value={quietHours.end.toString()}
                        onValueChange={(value) => setQuietHours(prev => ({ ...prev, end: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digest Settings */}
        <TabsContent value="digest" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Email Digest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Email Digest</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive a summary of your notifications via email
                  </p>
                </div>
                <Switch
                  checked={digestSettings.enabled}
                  onCheckedChange={(enabled) => setDigestSettings(prev => ({ ...prev, enabled }))}
                />
              </div>

              {digestSettings.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Frequency</label>
                      <Select
                        value={digestSettings.frequency}
                        onValueChange={(value) => setDigestSettings(prev => ({ ...prev, frequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <Select
                        value={digestSettings.time}
                        onValueChange={(value) => setDigestSettings(prev => ({ ...prev, time: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};