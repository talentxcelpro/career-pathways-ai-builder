import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Mail, Settings, TestTube } from 'lucide-react';

export const EmailSystemTester = () => {
  const [testing, setTesting] = useState({
    smtp: false,
    templates: false,
    emailSend: false
  });
  const [results, setResults] = useState({
    smtp: null as any,
    templates: null as any,
    emailSend: null as any
  });
  const { toast } = useToast();

  const testSMTPConfig = async () => {
    setTesting(prev => ({ ...prev, smtp: true }));
    try {
      console.log('🧪 Testing SMTP configuration...');
      console.log('🔗 Testing direct URL access...');
      
      // Test with direct fetch to get better error information
      const projectRef = 'dthlgsnakhoftinssokm';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
      
      const url = `https://${projectRef}.supabase.co/functions/v1/test-ses-smtp`;
      console.log('🎯 Testing URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey
        },
        body: JSON.stringify({})
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('📨 SMTP Test Response:', data);
      
      setResults(prev => ({ ...prev, smtp: data }));
      
      if (data?.fully_configured) {
        toast({
          title: "✅ SMTP Configuration Valid",
          description: "All SMTP credentials are properly configured"
        });
      } else {
        toast({
          title: "⚠️ SMTP Configuration Issues", 
          description: `Status: ${data?.status || 'Unknown'}. Check Supabase secrets.`,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('❌ SMTP test error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setResults(prev => ({ ...prev, smtp: { error: errorMessage } }));
      
      let description = errorMessage;
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        description = 'Network error - Edge functions may not be deployed or accessible';
      } else if (errorMessage.includes('404')) {
        description = 'Function not found - May not be deployed yet';
      } else if (errorMessage.includes('403') || errorMessage.includes('401')) {
        description = 'Authentication error - Check API keys';
      }
      
      toast({
        title: "❌ SMTP Test Failed",
        description,
        variant: "destructive"
      });
    } finally {
      setTesting(prev => ({ ...prev, smtp: false }));
    }
  };

  const testEmailTemplates = async () => {
    setTesting(prev => ({ ...prev, templates: true }));
    try {
      const { data, error } = await supabase
        .from('email_automation_settings')
        .select('template_name, is_enabled, subject_template')
        .in('template_name', ['test_email', 'welcome'] as any);
      
      if (error) throw error;
      
      setResults(prev => ({ ...prev, templates: data }));
      
      const hasTestEmail = (data as any)?.find((t: any) => t?.template_name === 'test_email');
      const hasWelcome = (data as any)?.find((t: any) => t?.template_name === 'welcome');
      
      if (hasTestEmail && hasWelcome) {
        toast({
          title: "✅ Email Templates Found",
          description: "Both test_email and welcome templates are available"
        });
      } else {
        toast({
          title: "⚠️ Missing Templates",
          description: "Some required email templates are missing",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Templates test error:', error);
      setResults(prev => ({ ...prev, templates: { error: error.message } }));
      toast({
        title: "❌ Templates Test Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(prev => ({ ...prev, templates: false }));
    }
  };

  const testEmailSending = async () => {
    setTesting(prev => ({ ...prev, emailSend: true }));
    try {
      console.log('🧪 Testing email sending via Amazon SES...');
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'test_email',
          recipient_email: 'talentxcelpro@gmail.com',
          recipient_name: 'Test User'
        }
      });
      
      console.log('📨 Email Send Response:', data, error);
      
      if (error) throw error;
      
      setResults(prev => ({ ...prev, emailSend: data }));
      
      if (data?.success) {
        toast({
          title: "✅ Email Sent Successfully!",
          description: `Test email sent via ${data.region}. Message ID: ${data.messageId || 'N/A'}`
        });
      } else {
        toast({
          title: "❌ Email Sending Failed",
          description: data?.error || 'Unknown error occurred',
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('❌ Email sending test error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setResults(prev => ({ ...prev, emailSend: { error: errorMessage } }));
      
      let description = errorMessage;
      if (errorMessage.includes('not verified')) {
        description = 'Email addresses not verified in AWS SES. Please verify sender and recipient in AWS Console.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        description = 'Network error - Function may not be deployed';
      }
      
      toast({
        title: "❌ Email Sending Test Failed",
        description,
        variant: "destructive"
      });
    } finally {
      setTesting(prev => ({ ...prev, emailSend: false }));
    }
  };

  const runAllTests = async () => {
    await testSMTPConfig();
    await testEmailTemplates();
    await testEmailSending();
  };

  const getStatusIcon = (result: any, isLoading: boolean) => {
    if (isLoading) return <TestTube className="h-4 w-4 animate-spin" />;
    if (!result) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    if (result.error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Amazon SES Email Testing
          </CardTitle>
          <CardDescription>
            Test your Amazon SES integration (Region: Europe Stockholm). Make sure to verify email addresses in AWS SES first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runAllTests} className="w-full">
            Run All Tests
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SMTP Configuration Test */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(results.smtp, testing.smtp)}
                  SMTP Config
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={testSMTPConfig}
                  disabled={testing.smtp}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {testing.smtp ? "Testing..." : "Test SMTP"}
                </Button>
                {results.smtp && (
                  <div className="mt-2 text-xs">
                    {results.smtp.error ? (
                      <span className="text-destructive">{results.smtp.error}</span>
                    ) : (
                      <div className="space-y-1">
                        <div className={results.smtp.fully_configured ? "text-green-600" : "text-yellow-600"}>
                          Status: {results.smtp.status}
                        </div>
                        <div>Host: {results.smtp.smtp_host}</div>
                        <div>User: {results.smtp.smtp_user_configured ? "✅" : "❌"}</div>
                        <div>Pass: {results.smtp.smtp_pass_configured ? "✅" : "❌"}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Templates Test */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(results.templates, testing.templates)}
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={testEmailTemplates}
                  disabled={testing.templates}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {testing.templates ? "Testing..." : "Test Templates"}
                </Button>
                {results.templates && (
                  <div className="mt-2 text-xs">
                    {results.templates.error ? (
                      <span className="text-destructive">{results.templates.error}</span>
                    ) : (
                      <div className="space-y-1">
                        {results.templates.map((template: any) => (
                          <div key={template.template_name} className="flex justify-between">
                            <span>{template.template_name}</span>
                            <span className={template.is_enabled ? "text-green-600" : "text-red-600"}>
                              {template.is_enabled ? "✅" : "❌"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Sending Test */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(results.emailSend, testing.emailSend)}
                  Email Sending
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={testEmailSending}
                  disabled={testing.emailSend}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {testing.emailSend ? "Sending..." : "Test Send"}
                </Button>
                {results.emailSend && (
                  <div className="mt-2 text-xs">
                    {results.emailSend.error ? (
                      <span className="text-destructive">{results.emailSend.error}</span>
                    ) : (
                      <div className="space-y-1">
                        <div className={results.emailSend.success ? "text-green-600" : "text-red-600"}>
                          {results.emailSend.success ? "✅ Success" : "❌ Failed"}
                        </div>
                        {results.emailSend.messageId && (
                          <div>ID: {results.emailSend.messageId}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};