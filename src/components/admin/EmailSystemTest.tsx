import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmailService, emailUtils } from '@/hooks/useEmailService';
import { toast } from 'sonner';

const EmailSystemTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const { sendEmail, isLoading } = useEmailService();

  const testWelcomeEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await sendEmail({
        to: testEmail,
        subject: 'Welcome to TalentXcel! 🎉',
        template: 'welcome',
        data: { name: 'Test User' },
        immediate: true,
      });
    } catch (error) {
      console.error('Test email failed:', error);
    }
  };

  const testJobMatchEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await sendEmail({
        to: testEmail,
        subject: 'New Job Match for You! 💼',
        template: 'job_opening',
        data: {
          name: 'Test User',
          job_title: 'Senior Software Engineer',
          company_name: 'TechCorp',
          job_id: 'test-123',
          location: 'Remote',
          salary_range: '$80,000 - $120,000',
          requirements: ['React', 'TypeScript', '3+ years experience']
        },
        immediate: true,
      });
    } catch (error) {
      console.error('Test email failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email System Test</CardTitle>
        <CardDescription>
          Test your email templates and SendGrid integration
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

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Available Email Templates:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>welcome</strong> - Welcome new users</li>
            <li>• <strong>new_connection</strong> - Connection requests</li>
            <li>• <strong>job_opening</strong> - Job recommendations</li>
            <li>• <strong>application_confirmation</strong> - Application confirmations</li>
            <li>• <strong>invite_member</strong> - Team invitations</li>
            <li>• <strong>password_reset</strong> - Password reset links</li>
            <li>• <strong>interview_scheduled</strong> - Interview notifications</li>
            <li>• <strong>monthly_digest</strong> - Monthly activity summary</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSystemTest;