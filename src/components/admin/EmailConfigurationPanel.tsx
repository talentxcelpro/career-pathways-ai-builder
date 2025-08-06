import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Mail, Settings, Send, Shield, Cloud } from "lucide-react";

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
  const [selectedProvider, setSelectedProvider] = useState<'aws_ses' | 'resend'>('aws_ses');
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
      console.log('🧪 Testing email system with provider:', selectedProvider);
      
      if (selectedProvider === 'aws_ses') {
        // Use AWS SES function
        const emailPayload = {
          to: testEmail,
          subject: 'TalentXcel Email Configuration Test',
          html: `
            <h2>✅ Email Configuration Test</h2>
            <p>Hello,</p>
            <p>This is a test email from TalentXcel's email configuration panel.</p>
            <p><strong>Provider:</strong> Amazon SES</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p>If you received this email, your Amazon SES configuration is working correctly!</p>
            <hr>
            <p><small>This test was sent from the TalentXcel Admin Panel</small></p>
          `
        };
        
        console.log('📧 AWS SES Email payload:', emailPayload);
        
        const { data, error } = await supabase.functions.invoke('send-email-aws-ses', {
          body: emailPayload
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
            description: `Test email sent successfully via AWS SES to ${testEmail}. Response time: ${data.responseTime}ms`,
          });
        } else {
          console.error('❌ AWS SES function returned error:', data);
          throw new Error(data?.error || 'AWS SES test failed');
        }
      } else {
        // Use Resend function (fallback)
        const { error } = await supabase.functions.invoke('send-automated-email', {
          body: {
            template_name: 'welcome',
            recipient_email: testEmail,
            recipient_name: 'Test User',
            template_data: {
              first_name: 'Test'
            }
          }
        });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `Test email sent successfully via Resend to ${testEmail}`,
        });
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
      {/* Email Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Email Provider Configuration
          </CardTitle>
          <CardDescription>
            Configure your email service provider for sending automated emails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as 'aws_ses' | 'resend')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="aws_ses" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Amazon SES
              </TabsTrigger>
              <TabsTrigger value="resend" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Resend
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="aws_ses" className="mt-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Amazon SES Configuration</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Your Amazon SES is configured via Supabase Edge Function secrets. Current status:
                  </p>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• <strong>Region:</strong> eu-north-1 (Stockholm)</li>
                    <li>• <strong>Service:</strong> Amazon Simple Email Service</li>
                    <li>• <strong>Function:</strong> send-email-aws-ses</li>
                    <li>• <strong>Status:</strong> ✅ Configured and Ready</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> To update AWS SES credentials, go to Supabase Dashboard → 
                      Edge Functions → Secrets and update SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resend" className="mt-6">
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Resend Configuration</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Resend is configured as a fallback email provider. To use Resend:
                  </p>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Set up your Resend API key in Supabase secrets</li>
                    <li>• Verify your domain in Resend dashboard</li>
                    <li>• Configure DNS records for authentication</li>
                  </ul>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-700">
                      <strong>Recommendation:</strong> Use Amazon SES for better deliverability and lower costs 
                      for high-volume email sending.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
            Test Email System
          </CardTitle>
          <CardDescription>
            Send a test email to verify your {selectedProvider === 'aws_ses' ? 'Amazon SES' : 'Resend'} configuration
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
              Send a test email via {selectedProvider === 'aws_ses' ? 'Amazon SES' : 'Resend'} to verify your configuration.
              Check browser console for detailed debugging information.
            </p>
            {selectedProvider === 'aws_ses' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>AWS SES Testing:</strong> This will use your configured AWS SES credentials 
                  and send via the send-email-aws-ses Edge Function.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};