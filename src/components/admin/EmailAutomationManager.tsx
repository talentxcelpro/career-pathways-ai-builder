import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Send, 
  Settings, 
  TestTube, 
  Calendar,
  Users,
  UserPlus,
  Briefcase,
  Bell,
  Shield,
  BarChart
} from 'lucide-react';
import { useEmailAutomation } from '@/hooks/useEmailAutomation';
import { toast } from 'sonner';

interface EmailTrigger {
  id: string;
  name: string;
  description: string;
  template: string;
  icon: React.ElementType;
  enabled: boolean;
  color: string;
}

export const EmailAutomationManager = () => {
  const { isProcessing, triggerWelcomeEmail, triggerConnectionEmail, triggerJobRecommendationEmail } = useEmailAutomation();
  const [testEmail, setTestEmail] = useState('');
  const [triggers, setTriggers] = useState<EmailTrigger[]>([
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Sent when a new user signs up',
      template: 'welcome',
      icon: UserPlus,
      enabled: true,
      color: 'text-green-600'
    },
    {
      id: 'connection',
      name: 'Connection Request',
      description: 'Sent when someone sends a connection request',
      template: 'new_connection',
      icon: Users,
      enabled: true,
      color: 'text-blue-600'
    },
    {
      id: 'job_match',
      name: 'Job Recommendations',
      description: 'Sent when new matching jobs are found',
      template: 'job_opening',
      icon: Briefcase,
      enabled: false,
      color: 'text-purple-600'
    },
    {
      id: 'application',
      name: 'Application Confirmation',
      description: 'Sent when user applies for a job',
      template: 'application_confirmation',
      icon: Send,
      enabled: true,
      color: 'text-orange-600'
    },
    {
      id: 'team_invite',
      name: 'Team Invitation',
      description: 'Sent when user is invited to join a team',
      template: 'invite_member',
      icon: Mail,
      enabled: true,
      color: 'text-indigo-600'
    },
    {
      id: 'password_reset',
      name: 'Password Reset',
      description: 'Sent when user requests password reset',
      template: 'password_reset',
      icon: Shield,
      enabled: true,
      color: 'text-red-600'
    },
    {
      id: 'interview',
      name: 'Interview Scheduled',
      description: 'Sent when an interview is scheduled',
      template: 'interview_scheduled',
      icon: Calendar,
      enabled: false,
      color: 'text-teal-600'
    },
    {
      id: 'digest',
      name: 'Monthly Digest',
      description: 'Monthly summary of user activity',
      template: 'monthly_digest',
      icon: BarChart,
      enabled: false,
      color: 'text-yellow-600'
    }
  ]);

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === id ? { ...trigger, enabled: !trigger.enabled } : trigger
    ));
  };

  const testEmailTemplate = async (templateId: string) => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      switch (templateId) {
        case 'welcome':
          await triggerWelcomeEmail(testEmail, 'Test User');
          break;
        case 'connection':
          await triggerConnectionEmail(testEmail, 'Test User', 'John Doe');
          break;
        case 'job_match':
          await triggerJobRecommendationEmail(testEmail, 'Test User', [
            { title: 'Senior Developer', company: 'TechCorp' },
            { title: 'Product Manager', company: 'InnovaCorp' },
            { title: 'Data Scientist', company: 'DataTech' }
          ]);
          break;
        default:
          toast.error('Test not implemented for this template');
          return;
      }
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Failed to send test email');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Automation Settings
          </CardTitle>
          <CardDescription>
            Configure automated emails for various user actions and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <TestTube className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="Enter email to test templates"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Triggers</CardTitle>
          <CardDescription>
            Enable or disable automated email triggers for different events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <trigger.icon className={`h-5 w-5 ${trigger.color}`} />
                    <div>
                      <h3 className="font-semibold">{trigger.name}</h3>
                      <p className="text-sm text-gray-600">{trigger.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={trigger.enabled ? "default" : "secondary"}>
                      {trigger.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Switch
                      checked={trigger.enabled}
                      onCheckedChange={() => toggleTrigger(trigger.id)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testEmailTemplate(trigger.id)}
                    disabled={isProcessing || !testEmail}
                    className="flex-1"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Template
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Statistics</CardTitle>
          <CardDescription>
            Overview of email automation performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">127</div>
              <div className="text-sm text-gray-600">Emails Sent Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">34%</div>
              <div className="text-sm text-gray-600">Open Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">8%</div>
              <div className="text-sm text-gray-600">Click Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};