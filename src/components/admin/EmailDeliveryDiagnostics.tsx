import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Mail, Send, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export const EmailDeliveryDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    const results: DiagnosticResult[] = [];

    // Test 1: Check SendGrid configuration using our test function
    try {
      console.log('Testing SendGrid configuration...');
      const { data, error } = await supabase.functions.invoke('test-sendgrid', {});
      
      console.log('SendGrid test response:', { data, error });

      if (error) {
        console.error('SendGrid test error:', error);
        results.push({
          test: 'SendGrid Configuration',
          status: 'fail',
          message: `SendGrid test failed: ${error.message || 'Unknown error'}`
        });
      } else if (data && data.sendgrid_configured) {
        results.push({
          test: 'SendGrid Configuration',
          status: 'pass',
          message: `SendGrid API key is properly configured (${data.api_key_length} characters)`
        });
      } else {
        results.push({
          test: 'SendGrid Configuration',
          status: 'fail',
          message: data?.status === 'missing' ? 
            'SendGrid API key is not accessible to edge functions' :
            `SendGrid API key configuration test failed: ${JSON.stringify(data)}`
        });
      }
    } catch (error) {
      results.push({
        test: 'SendGrid Configuration',
        status: 'fail',
        message: 'Failed to test SendGrid configuration'
      });
    }

    // Test 2: Check email queue processing
    try {
      const { data: queueData, error } = await supabase
        .from('email_automation_queue')
        .select('status')
        .eq('status', 'pending')
        .limit(1);

      if (error) {
        results.push({
          test: 'Email Queue Health',
          status: 'warning',
          message: 'Could not check email queue status'
        });
      } else if (queueData && queueData.length > 0) {
        results.push({
          test: 'Email Queue Health',
          status: 'warning',
          message: `${queueData.length} emails pending in queue - check queue processor`
        });
      } else {
        results.push({
          test: 'Email Queue Health',
          status: 'pass',
          message: 'No pending emails in queue'
        });
      }
    } catch (error) {
      results.push({
        test: 'Email Queue Health',
        status: 'fail',
        message: 'Failed to check email queue'
      });
    }

    // Test 3: Check recent email delivery stats
    try {
      const { data: recentEmails, error } = await supabase
        .from('email_automation_queue')
        .select('status, sent_at, error_message')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        results.push({
          test: 'Recent Delivery Rate',
          status: 'warning',
          message: 'Could not check recent email delivery stats'
        });
      } else if (recentEmails) {
        const sentCount = recentEmails.filter(e => e.status === 'sent').length;
        const failedCount = recentEmails.filter(e => e.status === 'failed').length;
        const total = recentEmails.length;
        
        if (total === 0) {
          results.push({
            test: 'Recent Delivery Rate',
            status: 'warning',
            message: 'No emails sent in the last 24 hours'
          });
        } else {
          const successRate = (sentCount / total) * 100;
          if (successRate >= 95) {
            results.push({
              test: 'Recent Delivery Rate',
              status: 'pass',
              message: `${successRate.toFixed(1)}% success rate (${sentCount}/${total} emails)`
            });
          } else if (successRate >= 80) {
            results.push({
              test: 'Recent Delivery Rate',
              status: 'warning',
              message: `${successRate.toFixed(1)}% success rate (${sentCount}/${total} emails) - ${failedCount} failed`
            });
          } else {
            results.push({
              test: 'Recent Delivery Rate',
              status: 'fail',
              message: `${successRate.toFixed(1)}% success rate (${sentCount}/${total} emails) - ${failedCount} failed`
            });
          }
        }
      }
    } catch (error) {
      results.push({
        test: 'Recent Delivery Rate',
        status: 'fail',
        message: 'Failed to check recent delivery stats'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const sendTestEmail = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('unified-email-service', {
        body: {
          to: 'talentxcelpro@gmail.com',
          subject: 'TalentXcel Email Test - ' + new Date().toLocaleTimeString(),
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 20px; border-radius: 8px; color: white; text-align: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px;">Email Test Successful! ✅</h2>
              </div>
              <p>This is a test email sent from TalentXcel email diagnostics system.</p>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Test ID:</strong> ${crypto.randomUUID()}</p>
              <p>If you received this email, your email delivery system is working correctly!</p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 0; color: #6c757d; font-size: 14px;">This email was sent to verify the TalentXcel email automation system.</p>
              </div>
            </div>
          `,
          template: 'test',
          templateData: { name: 'Admin' },
          priority: 'high'
        }
      });

      console.log('Test email response:', { data, error });

      if (error) {
        toast.error(`Test email failed: ${error.message || error}`);
      } else if (data && data.error) {
        toast.error(`Test email failed: ${data.error}`);
      } else if (data && data.success) {
        toast.success(`Test email sent via ${data.provider}! Check your inbox.`);
        setTestEmailSent(true);
      } else {
        toast.error('Unexpected response from email service');
      }
    } catch (error: any) {
      toast.error(`Failed to send test email: ${error.message}`);
      console.error('Test email error:', error);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      pass: 'secondary',
      warning: 'secondary',
      fail: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.toUpperCase()}
      </Badge>
    );
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Delivery Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            variant="outline"
          >
            {isRunning ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Diagnostics'
            )}
          </Button>
          <Button
            onClick={() => {
              toast.info('Testing with simplified function...');
              fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/simple-email-test', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                }
              })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  toast.success('🎉 SUCCESS! Email sent to talentxcelpro@gmail.com - Check your inbox!');
                  setTestEmailSent(true);
                } else {
                  toast.error(`Failed: ${data.error}`);
                }
              })
              .catch(error => {
                toast.error(`Network error: ${error.message}`);
              });
            }}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            SIMPLE TEST
          </Button>
        </div>

        {diagnostics.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Diagnostic Results:</h3>
            {diagnostics.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium">{result.test}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {testEmailSent && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Test email sent! Check your inbox at talentxcelpro@gmail.com
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Quick Fix Guide:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>SendGrid Not Configured:</strong> Add SENDGRID_API_KEY to Supabase Edge Function secrets</li>
            <li>• <strong>High Failure Rate:</strong> Check SendGrid dashboard for bounces/spam reports</li>
            <li>• <strong>Pending Queue:</strong> Manually trigger process-email-queue function</li>
            <li>• <strong>No Recent Emails:</strong> Check if email automation triggers are working</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};