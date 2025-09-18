import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertCircle, Mail, Send, Users } from 'lucide-react';

interface EmailResults {
  welcome_emails: number;
  profile_completion_reminders: number;
  job_recommendations: number;
  connection_requests: number;
  monthly_digests: number;
  total_queued: number;
  errors: string[];
}

interface TriggerResponse {
  success: boolean;
  message: string;
  results: EmailResults;
  test_mode: boolean;
}

export default function MassEmailTrigger() {
  const [loading, setLoading] = useState(false);
  const [emailType, setEmailType] = useState('all');
  const [testMode, setTestMode] = useState(true);
  const [lastResult, setLastResult] = useState<TriggerResponse | null>(null);

  const triggerMassEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('trigger-mass-email-automation', {
        body: {
          email_type: emailType,
          test_mode: testMode
        }
      });

      if (error) {
        console.error('Mass email trigger error:', error);
        toast.error(`Failed to trigger emails: ${error.message}`);
        return;
      }

      setLastResult(data);
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to trigger mass emails');
      }
    } catch (error: any) {
      console.error('Mass email trigger error:', error);
      toast.error(error.message || 'Failed to trigger mass emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Mass Email Automation Trigger
          </CardTitle>
          <CardDescription>
            Trigger template-based emails to all eligible users. Use test mode to send to limited users first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-type">Email Type</Label>
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger id="email-type">
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Email Types</SelectItem>
                <SelectItem value="welcome_email">Welcome Emails</SelectItem>
                <SelectItem value="profile_completion_reminder">Profile Completion Reminders</SelectItem>
                <SelectItem value="job_recommendation">Job Recommendations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="test-mode" 
              checked={testMode} 
              onCheckedChange={setTestMode}
            />
            <Label htmlFor="test-mode">
              Test Mode (Send to limited users only)
            </Label>
          </div>

          <Button 
            onClick={triggerMassEmails} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Triggering Emails...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Trigger Mass Emails
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Email Trigger Results
              {lastResult.test_mode && (
                <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  TEST MODE
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {lastResult.results.welcome_emails}
                </div>
                <div className="text-sm text-blue-700">Welcome Emails</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {lastResult.results.profile_completion_reminders}
                </div>
                <div className="text-sm text-green-700">Profile Reminders</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {lastResult.results.job_recommendations}
                </div>
                <div className="text-sm text-purple-700">Job Recommendations</div>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {lastResult.results.connection_requests}
                </div>
                <div className="text-sm text-orange-700">Connection Requests</div>
              </div>
              
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {lastResult.results.monthly_digests}
                </div>
                <div className="text-sm text-indigo-700">Monthly Digests</div>
              </div>
              
              <div className="text-center p-3 bg-gray-900 text-white rounded-lg">
                <div className="text-2xl font-bold">
                  {lastResult.results.total_queued}
                </div>
                <div className="text-sm text-gray-300">Total Queued</div>
              </div>
            </div>

            {lastResult.results.errors && lastResult.results.errors.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Errors ({lastResult.results.errors.length})</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {lastResult.results.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Note:</strong> Emails are queued and will be processed automatically. 
              Check the email automation queue for real-time status updates.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}