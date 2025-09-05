import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Send, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EmailResult {
  email_number: number;
  subject: string;
  template: string;
  status: 'sent' | 'failed';
  message_id?: string;
  provider?: string;
  error?: string;
}

interface BatchTestResponse {
  success: boolean;
  message: string;
  recipient: string;
  total_emails: number;
  successful_emails: number;
  failed_emails: number;
  results: EmailResult[];
  timestamp: string;
}

export const BatchEmailTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<BatchTestResponse | null>(null);

  const sendBatchTestEmails = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      console.log('🎯 Starting batch email test...');
      
      const { data, error } = await supabase.functions.invoke('send-test-emails-batch');

      if (error) {
        throw error;
      }

      if (data?.success) {
        setTestResults(data);
        toast.success(`Batch test completed! ${data.successful_emails}/${data.total_emails} emails sent successfully`);
      } else {
        throw new Error(data?.error || 'Failed to send batch test emails');
      }

    } catch (error: any) {
      console.error('❌ Batch email test failed:', error);
      toast.error(`Failed to send batch test emails: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Batch Email Template Tester
        </CardTitle>
        <CardDescription>
          Send 5 different templated emails to arsh.wani@gmail.com to test the email system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Email Templates to Test:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Welcome Email</li>
                <li>• Profile Completion Reminder</li>
                <li>• Job Recommendation (Senior SWE)</li>
                <li>• Job Recommendation (Full Stack)</li>
                <li>• Welcome Email (Variant)</li>
              </ul>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Test Recipient:</h4>
              <p className="text-muted-foreground">arsh.wani@gmail.com</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Email Provider:</h4>
              <p className="text-muted-foreground">React Email Templates via Unified Service</p>
            </div>
          </div>

          <Button 
            onClick={sendBatchTestEmails}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Emails...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send 5 Test Emails
              </>
            )}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Batch Test Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{testResults.successful_emails}</div>
                  <div className="text-sm text-muted-foreground">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{testResults.failed_emails}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{testResults.total_emails}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((testResults.successful_emails / testResults.total_emails) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Individual Email Results:</h4>
              {testResults.results.map((result) => (
                <div 
                  key={result.email_number}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.status === 'sent' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'sent' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-sm">Email #{result.email_number}</div>
                      <div className="text-xs text-muted-foreground">{result.template}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{result.subject}</div>
                    {result.status === 'sent' && result.message_id && (
                      <div className="text-xs text-green-600">ID: {result.message_id}</div>
                    )}
                    {result.status === 'failed' && result.error && (
                      <div className="text-xs text-red-600">{result.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};