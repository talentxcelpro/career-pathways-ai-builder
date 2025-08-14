import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle, XCircle, Mail, Send, Clock, Users } from 'lucide-react';
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
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);

    const results: DiagnosticResult[] = [];

    // Test 1: Check Amazon SES SMTP configuration by checking successful email deliveries
    try {
      console.log('Checking Amazon SES SMTP configuration...');
      
      // Check for recent successful email deliveries
      const { data: recentDeliveries, error: deliveryError } = await supabase
        .from('email_automation_queue')
        .select('status, sent_at, error_message')
        .eq('status', 'sent' as any)
        .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (deliveryError) {
        results.push({
          test: 'Amazon SES SMTP Configuration',
          status: 'warning',
          message: 'Could not verify SMTP configuration - database error'
        });
      } else if (recentDeliveries && recentDeliveries.length > 0) {
        results.push({
          test: 'Amazon SES SMTP Configuration',
          status: 'pass',
          message: 'Amazon SES SMTP working - recent emails delivered successfully'
        });
      } else {
        // Check if there are any emails processed at all
        const { count: totalEmails } = await supabase
          .from('email_automation_queue')
          .select('*', { count: 'exact', head: true });
          
        if (totalEmails && totalEmails > 0) {
          results.push({
            test: 'Amazon SES SMTP Configuration',
            status: 'warning',
            message: 'SMTP configured but no recent deliveries (check logs for issues)'
          });
        } else {
          results.push({
            test: 'Amazon SES SMTP Configuration',
            status: 'warning',
            message: 'SMTP configuration needs verification - no email activity found'
          });
        }
      }
    } catch (error) {
      results.push({
        test: 'Amazon SES SMTP Configuration',
        status: 'fail',
        message: 'Failed to check Amazon SES SMTP configuration'
      });
    }

    // Test 2: Check email queue processing
    try {
      const { count: pendingCount, error: pendingError } = await supabase
        .from('email_automation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending' as any);

      const { count: totalCount, error: totalError } = await supabase
        .from('email_automation_queue')
        .select('*', { count: 'exact', head: true });

      if (pendingError || totalError) {
        results.push({
          test: 'Email Queue Health',
          status: 'warning',
          message: 'Could not check email queue status'
        });
      } else {
        const pending = pendingCount || 0;
        const total = totalCount || 0;
        
        if (pending === 0) {
          results.push({
            test: 'Email Queue Health',
            status: 'pass',
            message: `Queue healthy - ${pending} pending emails (${total} total)`
          });
        } else if (pending < 10) {
          results.push({
            test: 'Email Queue Health',
            status: 'warning',
            message: `${pending} emails pending in queue - processing normally`
          });
        } else {
          results.push({
            test: 'Email Queue Health',
            status: 'fail',
            message: `${pending} emails pending in queue - check queue processor`
          });
        }
      }
    } catch (error) {
      results.push({
        test: 'Email Queue Health',
        status: 'fail',
        message: 'Failed to check email queue'
      });
    }

    // Test 3: Check recent email delivery stats using both queue and delivery events
    try {
      // Check queue data
      const { data: queueEmails, error: queueError } = await supabase
        .from('email_automation_queue')
        .select('status, sent_at, error_message')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Check delivery events
      const { data: deliveryEvents, error: eventsError } = await supabase
        .from('email_delivery_events')
        .select('event_type, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (queueError && eventsError) {
        results.push({
          test: 'Recent Delivery Rate',
          status: 'warning',
          message: 'Could not check recent email delivery stats'
        });
      } else {
        // Combine data from both sources with safe access
        const safeQueueEmails = (queueEmails as any) || [];
        const safeDeliveryEvents = (deliveryEvents as any) || [];
        
        const queueSent = safeQueueEmails.filter((e: any) => e && e.status === 'sent').length || 0;
        const queueFailed = safeQueueEmails.filter((e: any) => e && e.status === 'failed').length || 0;
        const queueTotal = safeQueueEmails.length || 0;
        
        const eventsSent = safeDeliveryEvents.filter((e: any) => e && e.event_type === 'sent').length || 0;
        const eventsDelivered = safeDeliveryEvents.filter((e: any) => e && e.event_type === 'delivered').length || 0;
        const eventsBounced = safeDeliveryEvents.filter((e: any) => e && e.event_type === 'bounced').length || 0;
        const eventsFailed = safeDeliveryEvents.filter((e: any) => e && e.event_type === 'failed').length || 0;
        
        // Use the more comprehensive data source
        const totalSent = Math.max(queueSent, eventsSent);
        const totalFailed = Math.max(queueFailed, eventsFailed + eventsBounced);
        const totalProcessed = Math.max(queueTotal, totalSent + totalFailed);
        
        if (totalProcessed === 0) {
          results.push({
            test: 'Recent Delivery Rate',
            status: 'warning',
            message: 'No emails processed in the last 24 hours'
          });
        } else {
          const successRate = (totalSent / totalProcessed) * 100;
          const deliveryBonus = eventsDelivered > 0 ? ` (${eventsDelivered} delivered)` : '';
          
          if (successRate >= 95) {
            results.push({
              test: 'Recent Delivery Rate',
              status: 'pass',
              message: `${successRate.toFixed(1)}% success rate (${totalSent}/${totalProcessed} emails)${deliveryBonus}`
            });
          } else if (successRate >= 80) {
            results.push({
              test: 'Recent Delivery Rate',
              status: 'warning',
              message: `${successRate.toFixed(1)}% success rate (${totalSent}/${totalProcessed} emails) - ${totalFailed} failed${deliveryBonus}`
            });
          } else {
            results.push({
              test: 'Recent Delivery Rate',
              status: 'fail',
              message: `${successRate.toFixed(1)}% success rate (${totalSent}/${totalProcessed} emails) - ${totalFailed} failed${deliveryBonus}`
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
      console.log('Attempting to send test email...');
      
      // Use Supabase client instead of direct fetch to avoid FunctionsHttpError
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {},
      });

      console.log('Test email response:', { data, error });

      if (error) {
        console.error('Supabase functions error:', error);
        toast.error(`Test email failed: ${error.message || 'Unknown error'}`);
        return;
      }

      if (data?.success) {
        toast.success(`Test email sent successfully! Message ID: ${data.messageId}`);
        setTestEmailSent(true);
      } else {
        toast.error(`Test email failed: ${data?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      toast.error(`Failed to send test email: ${error.message}`);
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
            onClick={sendTestEmail}
            variant="default"
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
          
          <Button
            onClick={async () => {
              toast.info('Checking SES configuration...');
              try {
                // Check recent email activity as proxy for SES health
                const { data: recentEmails, error } = await supabase
                  .from('email_automation_queue')
                  .select('status, sent_at')
                  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
                  .limit(10);
                
                if (error) {
                  toast.error(`❌ Configuration check failed: ${error.message}`);
                  return;
                }
                
                const safeRecentEmails = (recentEmails as any) || [];
                const sentEmails = safeRecentEmails.filter((e: any) => e && e.status === 'sent').length || 0;
                const totalEmails = safeRecentEmails.length || 0;
                
                if (sentEmails > 0) {
                  toast.success(`✅ SES working! ${sentEmails}/${totalEmails} emails sent successfully`);
                } else if (totalEmails > 0) {
                  toast.warning(`⚠️ SES configuration issues - ${totalEmails} emails processed but none sent`);
                } else {
                  toast.info(`ℹ️ SES status unknown - no recent email activity`);
                }
              } catch (error: any) {
                toast.error(`Configuration check failed: ${error.message}`);
              }
            }}
            variant="outline"
          >
            <Clock className="h-4 w-4 mr-2" />
            Test SES Config
          </Button>
          
          <Button
            onClick={async () => {
              toast.info('Processing email queue manually...');
              try {
                // Get pending emails
                const { data: pendingEmails, error: fetchError } = await supabase
                  .from('email_automation_queue')
                  .select('*')
                  .eq('status', 'pending' as any)
                  .limit(10);
                
                if (fetchError) {
                  toast.error(`Failed to fetch pending emails: ${fetchError.message}`);
                  return;
                }
                
                if (!pendingEmails || pendingEmails.length === 0) {
                  toast.info('No pending emails to process');
                  return;
                }
                
                let processed = 0;
                let failed = 0;
                
                // Process each email by calling unified-email-service
                for (const email of pendingEmails) {
                  try {
                    // Mark as processing
                    await supabase
                      .from('email_automation_queue')
                      .update({ 
                        status: 'processing', 
                        updated_at: new Date().toISOString() 
                      } as any)
                      .eq('id', (email as any).id as any);
                    
                    // Try to send via unified service
                    const { data: sendData, error: sendError } = await supabase.functions.invoke('unified-email-service', {
                      body: {
                        to: (email as any).recipient_email,
                        subject: `Welcome to TalentXcel - ${(email as any).recipient_name}!`,
                        template: (email as any).trigger_type,
                        templateData: (email as any).template_data,
                        priority: 'normal'
                      }
                    });
                    
                    if (sendError || !sendData?.success) {
                      // Mark as failed
                      await supabase
                        .from('email_automation_queue')
                        .update({ 
                          status: 'failed', 
                          error_message: sendError?.message || 'Send failed',
                          updated_at: new Date().toISOString()
                        } as any)
                        .eq('id', (email as any).id as any);
                      failed++;
                    } else {
                      // Mark as sent
                      await supabase
                        .from('email_automation_queue')
                        .update({ 
                          status: 'sent', 
                          sent_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        } as any)
                        .eq('id', (email as any).id as any);
                      processed++;
                    }
                  } catch (err: any) {
                    // Mark as failed
                    await supabase
                      .from('email_automation_queue')
                      .update({ 
                        status: 'failed', 
                        error_message: err.message,
                        updated_at: new Date().toISOString()
                      } as any)
                      .eq('id', (email as any).id as any);
                    failed++;
                  }
                }
                
                toast.success(`✅ Processed ${processed} emails! ${failed} failed.`);
                // Refresh diagnostics to show updated queue status
                setTimeout(() => runDiagnostics(), 1000);
              } catch (error: any) {
                toast.error(`Failed to process queue: ${error.message}`);
              }
            }}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Process Queue
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

        {/* Custom Email Testing Section */}
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Test with Any Email Address
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="border-purple-200"
              />
              <Input
                type="text"
                placeholder="Test User Name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="border-purple-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!testEmail) {
                    toast.error('Please enter an email address');
                    return;
                  }
                  
                  toast.info(`Sending test email to ${testEmail}...`);
                  
                  try {
                    // Insert directly into queue
                    const { error } = await supabase
                      .from('email_automation_queue')
                      .insert({
                        trigger_type: 'test_email',
                        recipient_email: testEmail,
                        recipient_name: testName || 'User',
                        template_data: { name: testName || 'User', custom_test: true },
                        status: 'pending',
                        scheduled_at: new Date().toISOString()
                      } as any);
                      
                    if (error) {
                      toast.error(`Database error: ${error.message}`);
                    } else {
                      toast.success(`Test email queued for ${testEmail}! Click "Process Queue" to send.`);
                    }
                  } catch (error: any) {
                    toast.error(`Failed to queue email: ${error.message}`);
                  }
                }}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Send className="h-4 w-4 mr-2" />
                Queue Test Email
              </Button>
              
              <Button
                onClick={async () => {
                  const emails = [
                    'test1@gmail.com',
                    'test2@yahoo.com', 
                    'test3@outlook.com',
                    'test4@hotmail.com'
                  ];
                  
                  toast.info('Adding batch test emails to queue...');
                  
                  try {
                    for (let i = 0; i < emails.length; i++) {
                      const email = emails[i];
                      await supabase
                        .from('email_automation_queue')
                        .insert({
                          trigger_type: 'test_email',
                          recipient_email: email,
                          recipient_name: `Test User ${i + 1}`,
                          template_data: { name: `Test User ${i + 1}`, batch_test: true },
                          status: 'pending',
                          scheduled_at: new Date().toISOString()
                        } as any);
                    }
                    
                    toast.success('Batch test emails queued! Click "Process Queue" to send to multiple providers.');
                  } catch (error: any) {
                    toast.error(`Failed to queue batch emails: ${error.message}`);
                  }
                }}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Users className="h-4 w-4 mr-2" />
                Test Multiple Providers
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Quick Fix Guide:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>SES Not Configured:</strong> Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to Supabase Edge Function secrets</li>
            <li>• <strong>High Failure Rate:</strong> Check AWS SES reputation and bounce/complaint rates</li>
            <li>• <strong>Pending Queue:</strong> Check Amazon SES sending limits and verify domain</li>
            <li>• <strong>No Recent Emails:</strong> Verify Amazon SES is out of sandbox mode</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};