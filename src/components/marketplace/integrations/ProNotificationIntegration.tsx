import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  BellRing, 
  Star, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Briefcase,
  Settings,
  Smartphone,
  Mail,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreference {
  id: string;
  type: 'service_inquiry' | 'new_review' | 'payment_received' | 'service_completion' | 'promotion_opportunity';
  title: string;
  description: string;
  enabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  channels: ('push' | 'email' | 'sms')[];
  icon: React.ReactNode;
}

interface ProNotificationStats {
  totalNotifications: number;
  unreadCount: number;
  recentActivity: number;
  engagementRate: number;
}

interface ProNotificationIntegrationProps {
  userProfile?: any;
  isProUser?: boolean;
}

export const ProNotificationIntegration: React.FC<ProNotificationIntegrationProps> = ({
  userProfile,
  isProUser = false
}) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [stats, setStats] = useState<ProNotificationStats>({
    totalNotifications: 0,
    unreadCount: 0,
    recentActivity: 0,
    engagementRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      initializeNotificationPreferences();
      loadNotificationStats();
    }
  }, [userProfile, isProUser]);

  const initializeNotificationPreferences = async () => {
    try {
      setLoading(true);

      // Default Pro notification preferences
      const defaultPreferences: NotificationPreference[] = [
        {
          id: 'service_inquiry',
          type: 'service_inquiry',
          title: 'New Service Inquiries',
          description: 'Get notified when someone inquires about your Pro services',
          enabled: true,
          frequency: 'instant',
          channels: ['push', 'email'],
          icon: <Briefcase className="h-4 w-4" />
        },
        {
          id: 'new_review',
          type: 'new_review',
          title: 'New Reviews & Ratings',
          description: 'Be alerted when clients leave reviews for your services',
          enabled: true,
          frequency: 'instant',
          channels: ['push', 'email'],
          icon: <Star className="h-4 w-4" />
        },
        {
          id: 'payment_received',
          type: 'payment_received',
          title: 'Payment Notifications',
          description: 'Get notified when payments are received for your services',
          enabled: true,
          frequency: 'instant',
          channels: ['push', 'email', 'sms'],
          icon: <TrendingUp className="h-4 w-4" />
        },
        {
          id: 'service_completion',
          type: 'service_completion',
          title: 'Service Milestones',
          description: 'Track service completion and milestone achievements',
          enabled: true,
          frequency: 'daily',
          channels: ['push', 'email'],
          icon: <Users className="h-4 w-4" />
        },
        {
          id: 'promotion_opportunity',
          type: 'promotion_opportunity',
          title: 'Promotion Opportunities',
          description: 'Get alerts about opportunities to promote your services',
          enabled: false,
          frequency: 'weekly',
          channels: ['push', 'email'],
          icon: <Zap className="h-4 w-4" />
        }
      ];

      // Use defaults for now (would implement proper storage later)
      setPreferences(defaultPreferences);

    } catch (error) {
      console.error('Error loading notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationStats = async () => {
    try {
      // Mock stats - in real app, fetch from notifications table
      const mockStats: ProNotificationStats = {
        totalNotifications: Math.floor(Math.random() * 100) + 20,
        unreadCount: Math.floor(Math.random() * 10) + 1,
        recentActivity: Math.floor(Math.random() * 15) + 5,
        engagementRate: Math.random() * 40 + 60 // 60-100%
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const updatePreference = async (preferenceId: string, updates: Partial<NotificationPreference>) => {
    try {
      setSaving(true);

      // Update local state
      setPreferences(prev => 
        prev.map(pref => 
          pref.id === preferenceId ? { ...pref, ...updates } : pref
        )
      );

      // Store preferences locally (would implement database storage later)
      console.log('Saving notification preferences:', preferenceId, updates);

      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notification preference:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'instant': return 'bg-green-100 text-green-800';
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isProUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pro Notification Features
          </CardTitle>
          <CardDescription>
            Upgrade to Pro to access advanced notification management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BellRing className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pro Notification System
            </h3>
            <p className="text-gray-600 mb-4">
              Get real-time notifications for service inquiries, reviews, payments, and more.
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pro Notification System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Pro Notification System
          </CardTitle>
          <CardDescription>
            Advanced notification management for your Pro services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.totalNotifications}</div>
              <div className="text-sm text-gray-600">Total Notifications</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <BellRing className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{stats.unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.recentActivity}</div>
              <div className="text-sm text-gray-600">Recent Activity</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.engagementRate)}%
              </div>
              <div className="text-sm text-gray-600">Engagement Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize how and when you receive notifications about your Pro services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {preferences.map((preference) => (
            <div key={preference.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {preference.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{preference.title}</h4>
                    <p className="text-sm text-gray-600">{preference.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preference.enabled}
                  onCheckedChange={(enabled) => 
                    updatePreference(preference.id, { enabled })
                  }
                  disabled={saving}
                />
              </div>

              {preference.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                  {/* Frequency Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Frequency</Label>
                    <Select
                      value={preference.frequency}
                      onValueChange={(frequency: any) => 
                        updatePreference(preference.id, { frequency })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Summary</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={getFrequencyColor(preference.frequency)}>
                      {preference.frequency}
                    </Badge>
                  </div>

                  {/* Channel Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Channels</Label>
                    <div className="flex flex-wrap gap-2">
                      {['push', 'email', 'sms'].map((channel) => (
                        <Button
                          key={channel}
                          variant={preference.channels.includes(channel as any) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            const newChannels = preference.channels.includes(channel as any)
                              ? preference.channels.filter(c => c !== channel)
                              : [...preference.channels, channel as any];
                            updatePreference(preference.id, { channels: newChannels });
                          }}
                          className="flex items-center gap-1"
                        >
                          {getChannelIcon(channel)}
                          {channel.charAt(0).toUpperCase() + channel.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Test Notifications
            </Button>
            <Button variant="outline" size="sm">
              <BellRing className="h-4 w-4 mr-2" />
              Notification History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};