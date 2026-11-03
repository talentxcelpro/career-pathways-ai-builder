import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Clock, 
  Settings, 
  Sparkles,
  Briefcase,
  Users,
  Trophy,
  BookOpen,
  AlertTriangle,
  Moon,
  Save,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';

export interface UserPreferencesState {
  // Channels
  in_app_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  // Categories
  career_growth_enabled: boolean;
  job_opportunities_enabled: boolean;
  social_interactions_enabled: boolean;
  messages_enabled: boolean;
  applications_enabled: boolean;
  tool_engagement_enabled: boolean;
  system_updates_enabled: boolean;
  // Timing
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  frequency: 'instant' | 'digest_daily' | 'digest_weekly';
}

const DEFAULT_PREFERENCES: UserPreferencesState = {
  in_app_enabled: true,
  push_enabled: true,
  email_enabled: true,
  sms_enabled: false,
  career_growth_enabled: true,
  job_opportunities_enabled: true,
  social_interactions_enabled: true,
  messages_enabled: true,
  applications_enabled: true,
  tool_engagement_enabled: true,
  system_updates_enabled: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  timezone: 'Asia/Kolkata',
  frequency: 'instant'
};

export const ComprehensiveNotificationSettings: React.FC = () => {
  const { user } = useOptimizedAuth();
  const [prefs, setPrefs] = useState<UserPreferencesState>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('channels');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadUserPreferences = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Preferences load notice:', error.message);
        }

        if (data) {
          setPrefs({
            in_app_enabled: data.in_app_enabled ?? true,
            push_enabled: data.push_enabled ?? true,
            email_enabled: data.email_enabled ?? true,
            sms_enabled: data.sms_enabled ?? false,
            career_growth_enabled: data.career_growth_enabled ?? true,
            job_opportunities_enabled: data.job_opportunities_enabled ?? true,
            social_interactions_enabled: data.social_interactions_enabled ?? true,
            messages_enabled: data.messages_enabled ?? true,
            applications_enabled: data.applications_enabled ?? true,
            tool_engagement_enabled: data.tool_engagement_enabled ?? true,
            system_updates_enabled: data.system_updates_enabled ?? true,
            quiet_hours_enabled: data.quiet_hours_enabled ?? false,
            quiet_hours_start: data.quiet_hours_start || '22:00',
            quiet_hours_end: data.quiet_hours_end || '08:00',
            timezone: data.timezone || 'Asia/Kolkata',
            frequency: (data.frequency as any) || 'instant'
          });
        }
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) {
      toast.error('Please log in to save preferences');
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      toast.success('Notification preferences updated successfully');
    } catch (err: any) {
      console.error('Error saving notification preferences:', err);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof UserPreferencesState>(key: K, value: UserPreferencesState[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card className="w-full border-border/60 rounded-2xl p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading notification preferences...</span>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/60 shadow-lg rounded-2xl overflow-hidden bg-card/60 backdrop-blur-md">
      <CardHeader className="p-4 sm:p-6 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Notification Preferences</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Manage how and when TalentXcel delivers activities, recommendations, and direct updates.
            </CardDescription>
          </div>

          <Button
            size="sm"
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl text-xs gap-1.5 font-semibold shadow-sm"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Settings</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="channels" className="text-xs rounded-lg">Delivery Channels</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs rounded-lg">Categories</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs rounded-lg">Quiet Hours</TabsTrigger>
          </TabsList>

          {/* Tab 1: Channels */}
          <TabsContent value="channels" className="space-y-4">
            <div className="space-y-3">
              {/* In-App Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">In-App Notification Stream</Label>
                    <p className="text-xs text-muted-foreground">Notification bell, real-time alerts, and notification dropdown.</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.in_app_enabled}
                  onCheckedChange={(checked) => updateField('in_app_enabled', checked)}
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">Instant desktop browser and mobile device alerts.</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.push_enabled}
                  onCheckedChange={(checked) => updateField('push_enabled', checked)}
                />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Email Alerts & Digests</Label>
                    <p className="text-xs text-muted-foreground">Important updates delivered to your registered email.</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.email_enabled}
                  onCheckedChange={(checked) => updateField('email_enabled', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Categories */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Job Opportunities */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Job Matches & Opportunities</Label>
                    <p className="text-[11px] text-muted-foreground">Recommended roles & closing jobs</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.job_opportunities_enabled}
                  onCheckedChange={(checked) => updateField('job_opportunities_enabled', checked)}
                />
              </div>

              {/* Job Applications */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Application Status</Label>
                    <p className="text-[11px] text-muted-foreground">Interviews, shortlists, offers</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.applications_enabled}
                  onCheckedChange={(checked) => updateField('applications_enabled', checked)}
                />
              </div>

              {/* Professional Networking */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Social & Connections</Label>
                    <p className="text-[11px] text-muted-foreground">Requests, likes, comments, shares</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.social_interactions_enabled}
                  onCheckedChange={(checked) => updateField('social_interactions_enabled', checked)}
                />
              </div>

              {/* Direct Messages */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Direct Messages</Label>
                    <p className="text-[11px] text-muted-foreground">Incoming chats & group messages</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.messages_enabled}
                  onCheckedChange={(checked) => updateField('messages_enabled', checked)}
                />
              </div>

              {/* Career Growth & Learning */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Career Growth & Scores</Label>
                    <p className="text-[11px] text-muted-foreground">Assessments, milestones, badges</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.career_growth_enabled}
                  onCheckedChange={(checked) => updateField('career_growth_enabled', checked)}
                />
              </div>

              {/* System & Security */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Platform Announcements</Label>
                    <p className="text-[11px] text-muted-foreground">Essential maintenance & updates</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.system_updates_enabled}
                  onCheckedChange={(checked) => updateField('system_updates_enabled', checked)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Quiet Hours & Frequency */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="p-4 rounded-xl border border-border/60 bg-background/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Enable Quiet Hours</Label>
                    <p className="text-xs text-muted-foreground">Mute push and sound notifications during specified hours.</p>
                  </div>
                </div>
                <Switch
                  checked={prefs.quiet_hours_enabled}
                  onCheckedChange={(checked) => updateField('quiet_hours_enabled', checked)}
                />
              </div>

              {prefs.quiet_hours_enabled && (
                <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Time</Label>
                    <Input
                      type="time"
                      value={prefs.quiet_hours_start}
                      onChange={(e) => updateField('quiet_hours_start', e.target.value)}
                      className="h-8 text-xs mt-1 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Time</Label>
                    <Input
                      type="time"
                      value={prefs.quiet_hours_end}
                      onChange={(e) => updateField('quiet_hours_end', e.target.value)}
                      className="h-8 text-xs mt-1 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <Label className="text-sm font-semibold">Delivery Frequency</Label>
                <p className="text-xs text-muted-foreground">Choose immediate delivery or batched digest.</p>
              </div>
              <Select
                value={prefs.frequency}
                onValueChange={(val: any) => updateField('frequency', val)}
              >
                <SelectTrigger className="w-40 h-8 text-xs rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Immediate</SelectItem>
                  <SelectItem value="digest_daily">Daily Digest</SelectItem>
                  <SelectItem value="digest_weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
