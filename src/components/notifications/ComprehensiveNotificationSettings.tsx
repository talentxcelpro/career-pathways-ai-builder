import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone, 
  Clock, 
  Settings, 
  Sparkles,
  Briefcase,
  Users,
  Trophy,
  BookOpen,
  AlertTriangle,
  Volume2,
  VolumeX,
  Moon,
  Sun
} from 'lucide-react';
import { useComprehensivePushNotifications } from '@/hooks/useComprehensivePushNotifications';

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  priority: 'low' | 'medium' | 'high';
}

const NOTIFICATION_CATEGORIES: CategoryConfig[] = [
  {
    key: 'career_growth',
    label: 'Career Growth',
    description: 'Profile completion, skill assessments, career milestones',
    icon: <Briefcase className="h-4 w-4" />,
    priority: 'high'
  },
  {
    key: 'job_opportunities',
    label: 'Job Opportunities',
    description: 'Job matches, application updates, salary insights',
    icon: <Sparkles className="h-4 w-4" />,
    priority: 'high'
  },
  {
    key: 'social_interactions',
    label: 'Social & Networking',
    description: 'Connection requests, profile views, network updates',
    icon: <Users className="h-4 w-4" />,
    priority: 'medium'
  },
  {
    key: 'tool_engagement',
    label: 'Tool Suggestions',
    description: 'Resume tips, AI assistant recommendations',
    icon: <Settings className="h-4 w-4" />,
    priority: 'medium'
  },
  {
    key: 'skill_development',
    label: 'Skill Development',
    description: 'Learning paths, industry trends, course recommendations',
    icon: <BookOpen className="h-4 w-4" />,
    priority: 'medium'
  },
  {
    key: 'achievement_milestones',
    label: 'Achievements',
    description: 'Milestones, certifications, accomplishments',
    icon: <Trophy className="h-4 w-4" />,
    priority: 'low'
  },
  {
    key: 'urgent_alerts',
    label: 'Urgent Alerts',
    description: 'Deadlines, interview reminders, time-sensitive updates',
    icon: <AlertTriangle className="h-4 w-4" />,
    priority: 'high'
  },
  {
    key: 'system_updates',
    label: 'System Updates',
    description: 'Platform updates, maintenance notifications',
    icon: <Settings className="h-4 w-4" />,
    priority: 'low'
  }
];

export const ComprehensiveNotificationSettings: React.FC = () => {
  const {
    preferences,
    savePreferences,
    subscribeToPush,
    permission,
    isLoading
  } = useComprehensivePushNotifications();

  const [localPreferences, setLocalPreferences] = useState(preferences);

  const updateCategoryPreference = (category: string, enabled: boolean) => {
    if (!localPreferences) return;
    
    const updated = {
      ...localPreferences,
      categories: {
        ...localPreferences.categories,
        [category]: enabled
      }
    };
    setLocalPreferences(updated);
  };

  const updateChannelPreference = (channel: string, enabled: boolean) => {
    if (!localPreferences) return;
    
    const updated = {
      ...localPreferences,
      channels: {
        ...localPreferences.channels,
        [channel]: enabled
      }
    };
    setLocalPreferences(updated);
  };

  const updateTimingPreference = (key: string, value: string | boolean) => {
    if (!localPreferences) return;
    
    const updated = {
      ...localPreferences,
      timing: {
        ...localPreferences.timing,
        [key]: value
      }
    };
    setLocalPreferences(updated);
  };

  const updateFrequencyPreference = (key: string, value: string | number | boolean) => {
    if (!localPreferences) return;
    
    const updated = {
      ...localPreferences,
      frequency: {
        ...localPreferences.frequency,
        [key]: value
      }
    };
    setLocalPreferences(updated);
  };

  const updatePersonalizationPreference = (key: string, enabled: boolean) => {
    if (!localPreferences) return;
    
    const updated = {
      ...localPreferences,
      personalization: {
        ...localPreferences.personalization,
        [key]: enabled
      }
    };
    setLocalPreferences(updated);
  };

  const handleSave = async () => {
    if (!localPreferences) return;
    await savePreferences(localPreferences);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'push_notifications': return <Bell className="h-4 w-4" />;
      case 'email_notifications': return <Mail className="h-4 w-4" />;
      case 'in_app_notifications': return <MessageSquare className="h-4 w-4" />;
      case 'sms_notifications': return <Phone className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (!localPreferences) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notification preferences...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Comprehensive Notification Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Control how and when you receive notifications across all TalentXcel features
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="personalization">AI & Personal</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Notification Categories
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose which types of notifications you want to receive
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATION_CATEGORIES.map((category) => (
                <div
                  key={category.key}
                  className={`p-4 rounded-lg border ${getPriorityColor(category.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label className="font-medium">{category.label}</Label>
                          <Badge variant="outline" className="text-xs">
                            {category.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={localPreferences.categories[category.key as keyof typeof localPreferences.categories]}
                      onCheckedChange={(checked) => updateCategoryPreference(category.key, checked)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Delivery Channels
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose how you want to receive notifications
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(localPreferences.channels).map(([channel, enabled]) => (
                <div key={channel} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getChannelIcon(channel)}
                    <div>
                      <Label className="font-medium">
                        {channel.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {channel === 'push_notifications' && 'Browser and mobile push notifications'}
                        {channel === 'email_notifications' && 'Email notifications to your registered email'}
                        {channel === 'in_app_notifications' && 'Notifications within the TalentXcel app'}
                        {channel === 'sms_notifications' && 'SMS notifications to your phone'}
                      </p>
                      {channel === 'push_notifications' && permission !== 'granted' && (
                        <div className="mt-2">
                          <Button size="sm" onClick={subscribeToPush} disabled={isLoading}>
                            Enable Push Notifications
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={enabled as boolean}
                    onCheckedChange={(checked) => updateChannelPreference(channel, checked)}
                    disabled={channel === 'push_notifications' && permission !== 'granted'}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timing & Schedule
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control when you receive notifications
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quiet Hours Start</Label>
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={localPreferences.timing.quiet_hours_start}
                      onChange={(e) => updateTimingPreference('quiet_hours_start', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quiet Hours End</Label>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={localPreferences.timing.quiet_hours_end}
                      onChange={(e) => updateTimingPreference('quiet_hours_end', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={localPreferences.timing.timezone}
                  onValueChange={(value) => updateTimingPreference('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Optimal Time Delivery</Label>
                  <p className="text-sm text-muted-foreground">
                    AI will choose the best time to send notifications based on your activity
                  </p>
                </div>
                <Switch
                  checked={localPreferences.timing.optimal_time_enabled}
                  onCheckedChange={(checked) => updateTimingPreference('optimal_time_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Frequency & Limits
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control how often you receive notifications
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Maximum Daily Notifications</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={localPreferences.frequency.max_daily_notifications}
                  onChange={(e) => updateFrequencyPreference('max_daily_notifications', parseInt(e.target.value) || 10)}
                />
                <p className="text-xs text-muted-foreground">
                  Limit the total number of notifications per day (urgent alerts always come through)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Digest Frequency</Label>
                <Select
                  value={localPreferences.frequency.digest_frequency}
                  onValueChange={(value) => updateFrequencyPreference('digest_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Receive a summary of low-priority notifications
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Instant Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications immediately as they happen
                  </p>
                </div>
                <Switch
                  checked={localPreferences.frequency.instant_notifications}
                  onCheckedChange={(checked) => updateFrequencyPreference('instant_notifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI & Personalization
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Let AI optimize your notification experience
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(localPreferences.personalization).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'use_ai_optimization' && 'AI learns your preferences and optimizes delivery timing'}
                      {key === 'location_based' && 'Customize notifications based on your location and timezone'}
                      {key === 'skill_based' && 'Personalize content based on your skills and interests'}
                      {key === 'activity_based' && 'Adapt frequency based on your app usage patterns'}
                    </p>
                  </div>
                  <Switch
                    checked={enabled as boolean}
                    onCheckedChange={(checked) => updatePersonalizationPreference(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Save Changes</h3>
              <p className="text-sm text-muted-foreground">
                Apply your notification preferences across all channels
              </p>
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};