import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Briefcase, Compass, Gauge, Loader2, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';

type NotificationSettings = {
  device: boolean;
  jobs: boolean;
  messages: boolean;
  navigator: boolean;
  network: boolean;
  talentScore: boolean;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  device: false,
  jobs: true,
  messages: true,
  navigator: true,
  network: true,
  talentScore: true,
};

const CATEGORY_ROWS = [
  {
    key: 'jobs',
    label: 'Jobs',
    description: 'Precision Match roles and application movement',
    icon: Briefcase,
  },
  {
    key: 'messages',
    label: 'Messages',
    description: 'Direct replies and conversation activity',
    icon: MessageCircle,
  },
  {
    key: 'navigator',
    label: 'Navigator',
    description: 'Career Moves from TalentXcel Navigator',
    icon: Compass,
  },
  {
    key: 'network',
    label: 'connections',
    description: 'Requests, mentions, and Pulse activity',
    icon: Users,
  },
  {
    key: 'talentScore',
    label: 'TalentScore',
    description: 'Score movement and weekly signal changes',
    icon: Gauge,
  },
] as const;

export const NotificationControls: React.FC = () => {
  const { user } = useOptimizedAuth();
  const push = usePushNotifications();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [profilePreferences, setProfilePreferences] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const permissionLabel = useMemo(() => {
    if (!push.isSupported) return 'Unavailable';
    if (push.permission === 'granted' || push.isSubscribed) return 'Enabled';
    if (push.permission === 'denied') return 'Blocked';
    return 'Ready';
  }, [push.isSupported, push.permission, push.isSubscribed]);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        const preferences = (data?.preferences as Record<string, unknown> | null) ?? {};
        const savedSettings = (preferences.notifications as Partial<NotificationSettings> | undefined) ?? {};

        if (!cancelled) {
          setProfilePreferences(preferences);
          setSettings({
            ...DEFAULT_SETTINGS,
            ...savedSettings,
            device: push.isSubscribed || savedSettings.device === true,
          });
        }
      } catch (error) {
        console.error('Notification settings load failed:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [push.isSubscribed, user?.id]);

  const persistSettings = async (nextSettings: NotificationSettings) => {
    if (!user?.id) return;

    setSettings(nextSettings);
    setIsSaving(true);
    try {
      const nextPreferences = {
        ...profilePreferences,
        notifications: nextSettings,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: nextPreferences, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setProfilePreferences(nextPreferences);
      toast.success('Notification settings saved');
    } catch (error) {
      console.error('Notification settings save failed:', error);
      toast.error('Could not save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeviceToggle = async (enabled: boolean) => {
    if (!push.isSupported) return;

    setIsSaving(true);
    try {
      if (enabled) {
        await push.subscribeToPush();
      } else {
        await push.unsubscribeFromPush();
      }

      await persistSettings({ ...settings, device: enabled });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (key: keyof NotificationSettings, enabled: boolean) => {
    persistSettings({ ...settings, [key]: enabled });
  };

  if (isLoading) {
    return (
      <Card className="rounded-[24px] border-slate-100 bg-white shadow-sm">
        <CardContent className="flex items-center gap-3 p-6 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading notification settings
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[24px] border-slate-100 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-xl font-apple-heavy text-slate-950">
          <Bell className="h-5 w-5 text-blue-600" />
          Notification Control
          <Badge variant="outline" className="ml-auto rounded-full text-[10px] uppercase tracking-widest">
            {permissionLabel}
          </Badge>
        </CardTitle>
        <p className="text-sm font-apple-medium leading-6 text-slate-500">
          Choose which TalentXcel signals can reach you outside the app.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div>
            <Label className="font-apple-bold text-slate-900">Device Notifications</Label>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {push.isSupported ? 'Enable real-time device alerts.' : 'Native alerts need Firebase configuration in this build.'}
            </p>
          </div>
          <Switch
            checked={push.isSubscribed || settings.device}
            disabled={!push.isSupported || push.isLoading || isSaving}
            onCheckedChange={handleDeviceToggle}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {CATEGORY_ROWS.map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-blue-50 p-2 text-blue-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label className="font-apple-bold text-slate-900">{label}</Label>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{description}</p>
                </div>
              </div>
              <Switch
                checked={settings[key]}
                disabled={isSaving}
                onCheckedChange={(checked) => handleCategoryToggle(key, checked)}
              />
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full rounded-2xl border-slate-200 font-apple-bold"
          disabled={isSaving}
          onClick={() => persistSettings(settings)}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

