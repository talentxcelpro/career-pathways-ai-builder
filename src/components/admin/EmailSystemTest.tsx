import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EmailTestResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

const EmailSystemTest: React.FC = () => {
  const [testEmail, setTestEmail] = useState('talentxcelpro@gmail.com');
  const [isLoading, setIsLoading] = useState(false);

  const testDirectSMTP = async (): Promise<void> => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Testing direct SMTP email to:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-email-smtp', {
        body: {
          to: testEmail,
          subject: 'Direct SMTP Test - TalentXcel',
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #333;">Direct SMTP Test Email</h1>
                  <p>This email was sent directly via SMTP using AWS SES.</p>
                  <p><strong>Recipient:</strong> ${testEmail}</p>
                  <p><strong>Date:</strong> ${new Date().toISOString()}</p>
                  <p><strong>Function:</strong> send-email-smtp</p>
                  <hr style="margin: 20px 0;">
                  <p style="color: #666; font-size: 12px;">
                    This is a test message to verify SMTP functionality.
                  </p>
                </div>
              </body>
            </html>
          `
        }
      });
      
      if (error) {
        console.error('SMTP test failed:', error);
        toast.error('SMTP test failed: ' + error.message);
      } else if (data?.success) {
        console.log('SMTP test successful:', data);
        toast.success(`✅ Direct SMTP test successful! Message ID: ${data.messageId}`);
      } else {
        console.error('SMTP test returned error:', data);
        toast.error('SMTP test failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('SMTP test error:', error);
      toast.error('SMTP test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testNotificationEmail = async (): Promise<void> => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Testing notification email to:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'welcome_email',
          recipients: [
            { 
              recipient_email: testEmail, 
              name: 'Test User',
              user_name: 'Test User'
            }
          ],
          platform_name: 'TalentXcel',
          support_email: 'support@talentxcel.in'
        }
      });
      
      if (error) {
        console.error('Notification test failed:', error);
        toast.error('Notification test failed: ' + error.message);
      } else if (data?.success) {
        console.log('Notification test successful:', data);
        toast.success(`✅ Notification email sent! Success: ${data.stats?.successful}, Failed: ${data.stats?.failed}`);
      } else {
        console.error('Notification test returned error:', data);
        toast.error('Notification test failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Notification test error:', error);
      toast.error('Notification test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanEmailQueue = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Cleaning email queue...');
      
      const { data, error } = await supabase.functions.invoke('fix-email-automation', {
        body: {
          action: 'cleanup_old'
        }
      });
      
      if (error) {
        console.error('Queue cleanup failed:', error);
        toast.error('Queue cleanup failed: ' + error.message);
      } else {
        console.log('Queue cleanup successful:', data);
        toast.success(`✅ Email queue cleaned! Processed: ${data.results?.total_processed || 0} emails`);
      }
    } catch (error: any) {
      console.error('Queue cleanup error:', error);
      toast.error('Queue cleanup failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fixSMTPDNS = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Fixing SMTP DNS issues...');
      
      const { data, error } = await supabase.functions.invoke('fix-smtp-dns', {
        body: {
          action: 'fix_all'
        }
      });
      
      if (error) {
        console.error('SMTP DNS fix failed:', error);
        toast.error('SMTP DNS fix failed: ' + error.message);
      } else {
        console.log('SMTP DNS fix successful:', data);
        toast.success(`✅ SMTP DNS issues resolved! Fixed ${data.results?.fixed_failed_emails || 0} failed emails`);
      }
    } catch (error: any) {
      console.error('SMTP DNS fix error:', error);
      toast.error('SMTP DNS fix failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email System Comprehensive Test</CardTitle>
        <CardDescription>
          Test all email functions and diagnose delivery issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="testEmail" className="block text-sm font-medium mb-2">
            Test Email Address
          </label>
          <Input
            id="testEmail"
            type="email"
            placeholder="Enter your email to test"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={testDirectSMTP}
            disabled={isLoading || !testEmail}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Direct SMTP'}
          </Button>
          
          <Button 
            onClick={testNotificationEmail}
            disabled={isLoading || !testEmail}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Notification'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={cleanEmailQueue}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? 'Cleaning...' : 'Clean Queue'}
          </Button>

          <Button 
            onClick={fixSMTPDNS}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Fixing...' : 'Fix SMTP DNS'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Email System Tests:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>Direct SMTP</strong> - Tests core SMTP function with AWS SES</li>
            <li>• <strong>Notification</strong> - Tests template-based notification system</li>
            <li>• <strong>Clean Queue</strong> - Removes stuck/invalid emails from queue</li>
            <li>• <strong>Fix SMTP DNS</strong> - Resolves DNS issues and updates SMTP configuration</li>
            <li>• Check your inbox AND spam folder after testing</li>
            <li>• Monitor AWS SES dashboard for delivery statistics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSystemTest;