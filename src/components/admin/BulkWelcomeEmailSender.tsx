import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, Users } from 'lucide-react';
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

  const sendWelcomeEmails = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      console.log('Starting bulk welcome email campaign...');
      
      const { data, error } = await supabase.functions.invoke('send-bulk-welcome-emails');
      
      if (error) {
        console.error('Error invoking welcome email function:', error);
        toast.error('Failed to send welcome emails');
        return;
      }

      console.log('Welcome email campaign response:', data);
      setResults(data);
      
      if (data.success) {
        toast.success(`Welcome emails sent! ${data.emailsSent} sent, ${data.emailsFailed} failed`);
      } else {
        toast.error(data.message || 'Failed to send welcome emails');
      }
    } catch (error) {
      console.error('Error sending welcome emails:', error);
      toast.error('An unexpected error occurred');
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
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            This will send welcome emails to all registered users who haven't received one yet.
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