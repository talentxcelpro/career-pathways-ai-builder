import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, Shield, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MessagingSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sound_notifications: boolean;
  read_receipts: boolean;
  typing_indicators: boolean;
  online_status: boolean;
  auto_accept_connections: boolean;
  filter_requests: boolean;
}

const defaultSettings: MessagingSettings = {
  email_notifications: true,
  push_notifications: true,
  sound_notifications: false,
  read_receipts: true,
  typing_indicators: true,
  online_status: true,
  auto_accept_connections: true,
  filter_requests: false,
};

const MessageSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<MessagingSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_messaging_settings' as any)
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Could not load user messaging settings:', error);
        } else if (data) {
          setSettings({
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            sound_notifications: data.sound_notifications ?? false,
            read_receipts: data.read_receipts ?? true,
            typing_indicators: data.typing_indicators ?? true,
            online_status: data.online_status ?? true,
            auto_accept_connections: data.auto_accept_connections ?? true,
            filter_requests: data.filter_requests ?? false,
          });
        }
      } catch (err) {
        console.error('Error fetching messaging settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleToggle = (key: keyof MessagingSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("Please log in to save messaging preferences");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_messaging_settings' as any)
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Messaging preferences saved successfully");
    } catch (err: any) {
      console.error('Failed to save messaging settings:', err);
      toast.error(err.message || "Failed to save messaging preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/network/messages" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">Message Settings</h1>
            <p className="text-gray-600 dark:text-muted-foreground mt-1">Manage your messaging preferences and privacy</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Receive email alerts for new messages</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={settings.email_notifications}
                    onCheckedChange={() => handleToggle('email_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Get instant notifications for messages</p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={settings.push_notifications}
                    onCheckedChange={() => handleToggle('push_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-notifications">Sound notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Play sound when receiving messages</p>
                  </div>
                  <Switch 
                    id="sound-notifications" 
                    checked={settings.sound_notifications}
                    onCheckedChange={() => handleToggle('sound_notifications')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                  Privacy
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="read-receipts">Read receipts</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Let others know when you've read their messages</p>
                  </div>
                  <Switch 
                    id="read-receipts" 
                    checked={settings.read_receipts}
                    onCheckedChange={() => handleToggle('read_receipts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="typing-indicators">Typing indicators</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Show when you're typing</p>
                  </div>
                  <Switch 
                    id="typing-indicators" 
                    checked={settings.typing_indicators}
                    onCheckedChange={() => handleToggle('typing_indicators')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="online-status">Online status</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Show when you're active on TalentXcel</p>
                  </div>
                  <Switch 
                    id="online-status" 
                    checked={settings.online_status}
                    onCheckedChange={() => handleToggle('online_status')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Message Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Eye className="h-5 w-5 mr-2 text-emerald-600" />
                  Message Requests & Filtering
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-accept">Auto-accept from connections</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Automatically accept messages from verified connections</p>
                  </div>
                  <Switch 
                    id="auto-accept" 
                    checked={settings.auto_accept_connections}
                    onCheckedChange={() => handleToggle('auto_accept_connections')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="filter-requests">Filter message requests</Label>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Hide messages from users with incomplete profiles</p>
                  </div>
                  <Switch 
                    id="filter-requests" 
                    checked={settings.filter_requests}
                    onCheckedChange={() => handleToggle('filter_requests')}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-2">
              <Link to="/network/messages">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSettings;
