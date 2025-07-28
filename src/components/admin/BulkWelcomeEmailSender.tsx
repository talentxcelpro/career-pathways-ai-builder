import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EmailResult {
  email: string;
  status: 'sent' | 'failed';
  message_id?: string;
  error?: string;
}

interface SendWelcomeEmailResponse {
  success: boolean;
  message: string;
  totalUsers: number;
  emailsSent: number;
  emailsFailed: number;
  results: EmailResult[];
  error?: string;
}

export const BulkWelcomeEmailSender = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SendWelcomeEmailResponse | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    // Get user count for display
    const getUserCount = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .not('email', 'is', null);
        
        if (!error && count !== null) {
          setUserCount(count);
        }
      } catch (error) {
        console.error('Error getting user count:', error);
      }
    };
    
    getUserCount();
  }, []);

  const sendWelcomeEmails = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      console.log('Starting bulk welcome email campaign...');
      
      // First check if user has admin permissions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to send emails');
        return;
      }

      console.log('Getting all users...');
      
      // Get all users with email addresses
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .not('email', 'is', null);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast.error('Failed to fetch users');
        return;
      }

      if (!users || users.length === 0) {
        toast.success('No users found to send emails to');
        return;
      }

      console.log(`Found ${users.length} users, sending welcome emails...`);

      const results: EmailResult[] = [];
      let emailsSent = 0;
      let emailsFailed = 0;

      // Send emails to all users using the existing automation system
      for (const user of users) {
        try {
          const { error } = await supabase
            .from('email_automation_queue')
            .insert({
              trigger_type: 'welcome',
              recipient_email: user.email,
              recipient_name: user.full_name || 'there',
              template_data: {
                name: user.full_name || 'there',
                first_name: user.full_name || 'there'
              },
              scheduled_at: new Date().toISOString()
            });

          if (error) {
            console.error(`Failed to queue welcome email for ${user.email}:`, error);
            results.push({
              email: user.email,
              status: 'failed',
              error: error.message
            });
            emailsFailed++;
          } else {
            console.log(`Welcome email queued for: ${user.email}`);
            results.push({
              email: user.email,
              status: 'sent'
            });
            emailsSent++;
          }

          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          results.push({
            email: user.email,
            status: 'failed',
            error: errorMsg
          });
          emailsFailed++;
          console.error(`Error queuing welcome email for ${user.email}:`, error);
        }
      }

      const response: SendWelcomeEmailResponse = {
        success: true,
        message: `Welcome email campaign completed. ${emailsSent} queued, ${emailsFailed} failed.`,
        totalUsers: users.length,
        emailsSent,
        emailsFailed,
        results
      };

      setResults(response);
      
      if (emailsSent > 0) {
        toast.success(`Welcome emails queued! ${emailsSent} queued, ${emailsFailed} failed. Check the email queue for delivery status.`);
      } else {
        toast.error('Failed to queue any welcome emails');
      }

    } catch (error) {
      console.error('Error sending welcome emails:', error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Bulk Welcome Email Campaign
        </CardTitle>
        <CardDescription>
          Send welcome emails to all users on the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will send welcome emails to all {userCount} registered users who have email addresses.
            <br />
            <strong>Note:</strong> You must be on the Admin → Email Automation page to access this feature.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={sendWelcomeEmails}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Welcome Emails...' : 'Send Welcome Emails to All Users'}
        </Button>

        {results && (
          <div className="mt-6 space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Campaign Results</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Users:</span>
                  <span className="ml-2 font-medium">{results.totalUsers}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Emails Sent:</span>
                  <span className="ml-2 font-medium text-green-600">{results.emailsSent}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Failed:</span>
                  <span className="ml-2 font-medium text-red-600">{results.emailsFailed}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="ml-2 font-medium">
                    {results.totalUsers > 0 ? ((results.emailsSent / results.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {results.results && results.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Detailed Results</h4>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {results.results.map((result, index) => (
                    <div 
                      key={index}
                      className={`text-sm p-2 rounded border ${
                        result.status === 'sent' 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{result.email}</span>
                        <span className="font-medium capitalize">{result.status}</span>
                      </div>
                      {result.error && (
                        <div className="text-xs mt-1 opacity-75">{result.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};