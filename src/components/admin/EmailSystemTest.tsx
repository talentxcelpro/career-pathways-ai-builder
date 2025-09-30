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
      console.log('Testing direct SES email to:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'test_email',
          recipient_email: testEmail,
          recipient_name: 'Test User',
          platform_name: 'TalentXcel'
        }
      });
      
      if (error) {
        console.error('SES test failed:', error);
        toast.error('SES test failed: ' + error.message);
      } else if (data?.success) {
        console.log('SES test successful:', data);
        toast.success(`✅ Direct SES test successful!`);
      } else {
        console.error('SES test returned error:', data);
        toast.error('SES test failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('SES test error:', error);
      toast.error('SES test failed: ' + error.message);
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
      console.log('Testing welcome email to:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'welcome',
          recipient_email: testEmail,
          recipient_name: 'Test User',
          platform_name: 'TalentXcel'
        }
      });
      
      if (error) {
        console.error('Welcome email test failed:', error);
        toast.error('Welcome email test failed: ' + error.message);
      } else if (data?.success) {
        console.log('Welcome email test successful:', data);
        toast.success(`✅ Welcome email sent successfully!`);
      } else {
        console.error('Welcome email test returned error:', data);
        toast.error('Welcome email test failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Welcome email test error:', error);
      toast.error('Welcome email test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanEmailQueue = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Processing email queue...');
      
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: {}
      });
      
      if (error) {
        console.error('Queue processing failed:', error);
        toast.error('Queue processing failed: ' + error.message);
      } else {
        console.log('Queue processing successful:', data);
        toast.success(`✅ Email queue processed! Sent: ${data.processed || 0}, Failed: ${data.failed || 0}`);
      }
    } catch (error: any) {
      console.error('Queue processing error:', error);
      toast.error('Queue processing failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSESHealth = async (): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Checking SES health and quota...');
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'profile_completion',
          recipient_email: testEmail,
          recipient_name: 'Health Check User',
          platform_name: 'TalentXcel'
        }
      });
      
      if (error) {
        console.error('SES health check failed:', error);
        toast.error('SES health check failed: ' + error.message);
      } else {
        console.log('SES health check successful:', data);
        toast.success(`✅ SES is healthy! Profile completion email sent.`);
      }
    } catch (error: any) {
      console.error('SES health check error:', error);
      toast.error('SES health check failed: ' + error.message);
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
            {isLoading ? 'Testing...' : 'Test SES Direct'}
          </Button>
          
          <Button 
            onClick={testNotificationEmail}
            disabled={isLoading || !testEmail}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Welcome'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={cleanEmailQueue}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Process Queue'}
          </Button>

          <Button 
            onClick={checkSESHealth}
            disabled={isLoading || !testEmail}
            variant="secondary"
            className="w-full"
          >
            {isLoading ? 'Checking...' : 'SES Health Check'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Email System Tests:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>Test SES Direct</strong> - Tests core test_email template with AWS SES</li>
            <li>• <strong>Test Welcome</strong> - Tests welcome email template</li>
            <li>• <strong>Process Queue</strong> - Processes pending emails in queue</li>
            <li>• <strong>SES Health Check</strong> - Tests profile completion template</li>
            <li>• Check your inbox AND spam folder after testing</li>
            <li>• Monitor AWS SES dashboard for delivery statistics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSystemTest;