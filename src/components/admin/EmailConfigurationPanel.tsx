import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Mail, Settings } from "lucide-react";

interface EmailConfigSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string;
}

export const EmailConfigurationPanel = () => {
  const [settings, setSettings] = useState<EmailConfigSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const settingLabels: Record<string, { label: string; description: string; type: 'input' | 'textarea' }> = {
    smtp_from_address: {
      label: "From Email Address",
      description: "The email address emails will be sent from (e.g., no-reply@savantis.com)",
      type: 'input'
    },
    smtp_from_name: {
      label: "From Name",
      description: "The name that appears as the sender",
      type: 'input'
    },
    smtp_reply_to: {
      label: "Reply-To Email",
      description: "Where replies should be sent (e.g., support@talentxcel.in)",
      type: 'input'
    },
    support_email: {
      label: "Support Email",
      description: "Support email address for templates",
      type: 'input'
    },
    company_name: {
      label: "Company Name",
      description: "Company name used in email templates",
      type: 'input'
    },
    website_url: {
      label: "Website URL",
      description: "Website URL used in email templates",
      type: 'input'
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast({
        title: "Error",
        description: "Failed to load email configuration settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingKey: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.setting_key === settingKey 
        ? { ...setting, setting_value: value }
        : setting
    ));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const updates = settings.map(setting => ({
        setting_key: setting.setting_key,
        setting_value: setting.setting_value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('email_config_settings')
          .update({ 
            setting_value: update.setting_value,
            updated_at: update.updated_at 
          })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Email configuration saved successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email configuration.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Configuration
        </CardTitle>
        <CardDescription>
          Configure email settings for automated messages. Changes will apply to all future emails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {settings.map((setting) => {
            const config = settingLabels[setting.setting_key];
            if (!config) return null;

            return (
              <div key={setting.setting_key} className="space-y-2">
                <Label htmlFor={setting.setting_key}>{config.label}</Label>
                {config.type === 'textarea' ? (
                  <Textarea
                    id={setting.setting_key}
                    value={setting.setting_value}
                    onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                    placeholder={config.description}
                    rows={3}
                  />
                ) : (
                  <Input
                    id={setting.setting_key}
                    type={setting.setting_key.includes('email') ? 'email' : 'text'}
                    value={setting.setting_value}
                    onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                    placeholder={config.description}
                  />
                )}
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};