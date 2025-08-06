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
      console.log('🧪 Testing Amazon SES welcome email to:', testEmail);
      
      const emailPayload = {
        to: testEmail,
        subject: 'Welcome to TalentXcel! 🎉',
        html: `
          <h2>Welcome to TalentXcel!</h2>
          <p>Hello Test User,</p>
          <p>Welcome to TalentXcel platform! We're excited to have you on board.</p>
          <p>This is a test email sent via AWS SES.</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        `
      };
      
      console.log('🧪 Testing Amazon SES welcome email to:', testEmail);
      console.log('📧 Email payload:', emailPayload);
      console.log('📏 Payload size:', JSON.stringify(emailPayload).length, 'bytes');
      
      const { data, error } = await supabase.functions.invoke('send-email-aws-ses', {
        body: emailPayload
      });
      
      console.log('📨 Raw response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase invoke error:', error);
        toast.error('Failed to send welcome email: ' + error.message);
      } else if (data?.success) {
        console.log('✅ Welcome email sent successfully:', data);
        toast.success(`✅ Welcome email sent via ${data.provider}! Response time: ${data.responseTime}ms`);
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
      console.log('🧪 Testing Amazon SES job match email to:', testEmail);
      
      const emailPayload = {
        to: testEmail,
        subject: 'New Job Match for You! 💼',
        html: `
          <h2>New Job Match Found!</h2>
          <p>Hello Test User,</p>
          <p>We found a great job match for you:</p>
          <ul>
            <li><strong>Position:</strong> Senior Software Engineer</li>
            <li><strong>Company:</strong> TechCorp</li>
            <li><strong>Location:</strong> Remote</li>
            <li><strong>Salary:</strong> $80,000 - $120,000</li>
          </ul>
          <p><strong>Requirements:</strong> React, TypeScript, 3+ years experience</p>
          <p>This is a test email sent via AWS SES.</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        `
      };
      
      console.log('🧪 Testing Amazon SES job match email to:', testEmail);
      console.log('📧 Email payload:', emailPayload);
      console.log('📏 Payload size:', JSON.stringify(emailPayload).length, 'bytes');
      
      const { data, error } = await supabase.functions.invoke('send-email-aws-ses', {
        body: emailPayload
      });
      
      console.log('📨 Raw response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase invoke error:', error);
        toast.error('Failed to send job match email: ' + error.message);
      } else if (data?.success) {
        console.log('✅ Job match email sent successfully:', data);
        toast.success(`✅ Job match email sent via ${data.provider}! Response time: ${data.responseTime}ms`);
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
        <CardTitle>Amazon SES Email System Test</CardTitle>
        <CardDescription>
          Test your Amazon SES email integration with detailed debugging
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

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Amazon SES Email Testing:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>Welcome Email</strong> - Test user welcome message</li>
            <li>• <strong>Job Match Email</strong> - Test job recommendation format</li>
            <li>• Uses Amazon SES exclusively for reliable email delivery</li>
            <li>• Check console logs for detailed debugging info</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSystemTest;