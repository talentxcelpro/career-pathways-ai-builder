import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Mail, Settings, Send, Shield } from "lucide-react";

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
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testingConnectivity, setTestingConnectivity] = useState(false);
  const { toast } = useToast();

  const settingLabels: Record<string, { label: string; description: string; type: 'input' | 'textarea' }> = {
    smtp_from_address: {
      label: "From Email Address",
      description: "The email address emails will be sent from (e.g., no-reply@talentxcel.in)",
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
      setSettings((data as any) || []);
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
          } as any)
          .eq('setting_key', update.setting_key as any);

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

  const testSESConnectivity = async () => {
    setTestingConnectivity(true);
    try {
      console.log('🔧 Testing SES connectivity...');
      
      const { data, error } = await supabase.functions.invoke('test-ses-connectivity');
      
      console.log('📨 SES connectivity response:', { data, error });
      
      if (error) {
        console.error('❌ SES connectivity error:', error);
        toast({
          title: "SES Test Failed",
          description: `Failed to test SES connectivity: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.success) {
        console.log('✅ SES connectivity successful:', data);
        toast({
          title: "SES Connectivity Test Passed",
          description: "Amazon SES credentials and configuration are working correctly!",
        });
      } else {
        console.error('❌ SES configuration issues:', data);
        toast({
          title: "SES Configuration Issues",
          description: data?.error || "SES connectivity test failed",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('SES connectivity test error:', error);
      toast({
        title: "Error",
        description: `Failed to test SES connectivity: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestingConnectivity(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address.",
        variant: "destructive",
      });
      return;
    }

    setTestEmailSending(true);
    try {
      console.log('🧪 Testing Amazon SES email system');
      
      console.log('📧 Sending test email via Amazon SES...');
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'test_email',
          recipient_email: testEmail,
          recipient_name: 'Test User',
          platform_name: 'TalentXcel'
        }
      });
      
      console.log('📨 AWS SES Response:', { data, error });
      
      if (error) {
        console.error('❌ AWS SES Error:', error);
        throw error;
      }
      
      if (data?.success) {
        console.log('✅ AWS SES Email sent successfully:', data);
        toast({
          title: "Success",
          description: `Test email sent successfully via Amazon SES to ${testEmail}. Response time: ${data.responseTime}ms`,
        });
      } else {
        console.error('❌ AWS SES function returned error:', data);
        throw new Error(data?.error || 'Amazon SES test failed');
      }
      
      setTestEmail('');
    } catch (error: any) {
      console.error('Email test error:', error);
      toast({
        title: "Error",
        description: `Failed to send test email: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestEmailSending(false);
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
    <div className="space-y-6">
      {/* Amazon SES Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Amazon SES Configuration
          </CardTitle>
          <CardDescription>
            TalentXcel uses Amazon SES for reliable email delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Amazon SES Active</h4>
              <p className="text-sm text-green-700 mb-3">
                Your Amazon SES is configured and ready for email delivery. Configuration details:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• <strong>Region:</strong> eu-north-1 (Stockholm)</li>
                <li>• <strong>Service:</strong> Amazon Simple Email Service</li>
                <li>• <strong>Function:</strong> send-email-aws-ses</li>
                <li>• <strong>Status:</strong> ✅ Active and Ready</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Credentials:</strong> Amazon SES credentials are securely stored in Supabase Edge Function secrets.
                  To update: Supabase Dashboard → Edge Functions → Secrets → Update SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY.
                </p>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={testSESConnectivity} 
                  disabled={testingConnectivity}
                  variant="outline"
                  size="sm"
                >
                  {testingConnectivity ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test SES Connectivity'
                  )}
                </Button>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Email Configuration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration Settings
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

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Amazon SES
          </CardTitle>
          <CardDescription>
            Send a test email to verify your Amazon SES configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={sendTestEmail} disabled={testEmailSending || !testEmail}>
                {testEmailSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Send a test email via Amazon SES to verify your configuration.
              Check browser console for detailed debugging information.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Amazon SES Testing:</strong> This will use your configured AWS SES credentials 
                and send via the send-email-aws-ses Edge Function with full debugging enabled.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};