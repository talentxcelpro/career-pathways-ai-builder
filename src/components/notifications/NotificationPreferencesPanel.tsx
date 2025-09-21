import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotificationPersonalization } from '@/hooks/useNotificationPersonalization';
import { NOTIFICATION_PILLARS } from './NotificationsPillars';
import { 
  Settings, 
  Moon, 
  Bell, 
  Mail, 
  MessageSquare, 
  Volume2,
  Clock,
  Filter,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const NotificationPreferencesPanel: React.FC = () => {
  const {
    preferences,
    isLoading,
    isSaving,
    updatePreference,
    updateCategoryPreference,
    savePreferences
  } = useNotificationPersonalization();

  if (isLoading || !preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    const success = await savePreferences(preferences);
    if (success) {
      toast.success('Notification preferences saved!');
    } else {
      toast.error('Failed to save preferences');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
            <Badge variant="outline" className="ml-auto">Smart AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Delivery Methods
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Real-time browser alerts</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.push_enabled}
                  onCheckedChange={(checked) => updatePreference('push_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Weekly digest emails</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Critical alerts only</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.sms_enabled}
                  onCheckedChange={(checked) => updatePreference('sms_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4" />
                  <div>
                    <Label>Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Audio notification sounds</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.sound_enabled}
                  onCheckedChange={(checked) => updatePreference('sound_enabled', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Quiet Hours
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_start || '22:00'}
                  onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_end || '08:00'}
                  onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              During quiet hours, only high-priority notifications will be shown.
            </p>
          </div>

          <Separator />

          {/* Priority Filter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Priority Filter
            </h3>
            <Select
              value={preferences.priority_filter}
              onValueChange={(value) => updatePreference('priority_filter', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="normal_and_high">Normal & High Priority</SelectItem>
                <SelectItem value="high_only">High Priority Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Frequency Limit */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Frequency Limit
            </h3>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="1"
                max="50"
                value={preferences.frequency_limit}
                onChange={(e) => updatePreference('frequency_limit', parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                Maximum notifications per hour
              </span>
            </div>
          </div>

          <Separator />

          {/* AI Optimization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Smart Filtering
                </h3>
                <p className="text-sm text-muted-foreground">
                  Let AI learn your preferences and optimize notification timing
                </p>
              </div>
              <Switch
                checked={preferences.ai_optimization}
                onCheckedChange={(checked) => updatePreference('ai_optimization', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Category Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NOTIFICATION_PILLARS.slice(1).map((pillar) => {
                const isEnabled = preferences.categories[pillar.key as keyof typeof preferences.categories];
                const Icon = pillar.icon;
                
                return (
                  <div
                    key={pillar.key}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      isEnabled ? 'border-primary/20 bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${pillar.bgColor}`}>
                        <Icon className={`h-4 w-4 ${pillar.color}`} />
                      </div>
                      <div>
                        <Label className="font-medium">{pillar.label}</Label>
                        <p className="text-xs text-muted-foreground">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => 
                        updateCategoryPreference(pillar.key as keyof typeof preferences.categories, checked)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};