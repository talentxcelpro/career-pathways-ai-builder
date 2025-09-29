import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, Loader2 } from 'lucide-react';

export const EmailNotificationTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testTemplates = [
    { value: 'welcome_email', label: 'Welcome Email' },
    { value: 'profile_completion', label: 'Profile Completion Reminder' },
    { value: 'job_match', label: 'Job Match Notification' },
    { value: 'application_confirmation', label: 'Application Confirmation' }
  ];

  const handleSendTestEmail = async () => {
    if (!email || !name) {
      toast.error('Please fill in email and name');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: template || 'test_email',
          recipient_email: email,
          recipient_name: name,
          name: name,
          platform_name: 'TalentXcel',
          support_email: 'support@talentxcel.in',
          current_year: '2025',
          current_date: new Date().toLocaleDateString()
        }
      });

      if (error) {
        console.error('Email test error:', error);
        toast.error('Failed to send test email: ' + error.message);
      } else {
        toast.success('Test email sent successfully!');
        console.log('Email result:', data);
        // Reset form
        setEmail('');
        setName('');
        setTemplate('');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Mail className="h-5 w-5" />
          Email Test
        </CardTitle>
        <CardDescription>
          Test email notifications and templates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email Address</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-name">Name</Label>
          <Input
            id="test-name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-template">Email Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {testTemplates.map((temp) => (
                <SelectItem key={temp.value} value={temp.value}>
                  {temp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSendTestEmail}
          disabled={isLoading || !email || !name}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};