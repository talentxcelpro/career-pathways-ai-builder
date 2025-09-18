import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const EmailSystemTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔧 EmailSystemTest component rendered');
  console.log('📧 Current test email state:', testEmail);
  console.log('⏳ Current loading state:', isLoading);

  const testWelcomeEmail = async () => {
    console.log('🚀 Welcome email test function called');
    console.log('📧 Test email:', testEmail);
    
    if (!testEmail) {
      console.log('❌ No email provided');
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🧪 Testing deliverable welcome email to:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'welcome_email',
          recipients: [
            { 
              recipient_email: testEmail, 
              user_name: 'Test User' 
            }
          ]
        }
      });
      
      console.log('📨 Raw response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase invoke error:', error);
        toast.error('Failed to send welcome email: ' + error.message);
      } else if (data?.success) {
        console.log('✅ Welcome email sent successfully:', data);
        toast.success(`✅ Welcome email sent! Check Email Delivery Tracker for status.`);
      } else {
        console.error('❌ Email function returned error:', data);
        toast.error('Email test failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Welcome email test error:', error);
      toast.error('Failed to send welcome email: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testJobMatchEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🧪 Testing deliverable job match email to:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'job_recommendation',
          recipients: [
            { 
              recipient_email: testEmail, 
              user_name: 'Test User' 
            }
          ]
        }
      });
      
      console.log('📨 Raw response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase invoke error:', error);
        toast.error('Failed to send job match email: ' + error.message);
      } else if (data?.success) {
        console.log('✅ Job match email sent successfully:', data);
        toast.success(`✅ Job recommendation email sent! Check Email Delivery Tracker for status.`);
      } else {
        console.error('❌ Email function returned error:', data);
        toast.error('Email test failed: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Job match email test error:', error);
      toast.error('Failed to send job match email: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>SMTP Email System Test</CardTitle>
        <CardDescription>
          Test your SMTP email integration using AWS SES with detailed debugging
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
            defaultValue="talentxcelpro@gmail.com"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={testWelcomeEmail}
            disabled={isLoading || !testEmail}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Test Welcome Email'}
          </Button>
          
          <Button 
            onClick={testJobMatchEmail}
            disabled={isLoading || !testEmail}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Test Job Match Email'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Deliverable Email Testing:</h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• <strong>Welcome Email</strong> - Test user welcome message with tracking</li>
            <li>• <strong>Job Recommendation</strong> - Test job match format with tracking</li>
            <li>• Uses improved SES configuration for better deliverability</li>
            <li>• Monitor delivery status in Email Delivery Tracker below</li>
            <li>• Check your inbox AND spam folder for test emails</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSystemTest;