import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailResult {
  email: string;
  status: 'sent' | 'failed';
  message_id?: string;
  error?: string;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
  totalUsers: number;
  emailsSent: number;
  emailsFailed: number;
  results: EmailResult[];
  error?: string;
}

export default function ProfileReminderEmailSender() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<SendEmailResponse | null>(null);
  const { toast } = useToast();

  const sendReminderEmails = async () => {
    try {
      setLoading(true);
      setLastResult(null);

      console.log('Invoking profile reminder email function...');
      
      const { data, error } = await supabase.functions.invoke('send-profile-reminder-emails', {
        body: {}
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      console.log('Function response:', data);
      setLastResult(data);

      if (data.success) {
        toast({
          title: "Emails Sent Successfully!",
          description: `${data.emailsSent} profile reminder emails sent to users with incomplete profiles.`,
        });
      } else {
        toast({
          title: "Email Sending Failed",
          description: data.error || "Failed to send reminder emails",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Error sending reminder emails:', error);
      toast({
        title: "Error",
        description: `Failed to send reminder emails: ${error.message}`,
        variant: "destructive",
      });
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
            Profile Completion Reminder Emails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Send reminder emails to users who haven't completed their profiles. 
              This helps increase profile completion rates and user engagement.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>Targets users with incomplete or missing profile information</span>
            </div>
          </div>

          <Button 
            onClick={sendReminderEmails}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Profile Completion Reminders
              </>
            )}
          </Button>

          {/* Results Display */}
          {lastResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Email Campaign Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{lastResult.totalUsers}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{lastResult.emailsSent}</div>
                    <div className="text-sm text-muted-foreground">Emails Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{lastResult.emailsFailed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {lastResult.totalUsers > 0 ? Math.round((lastResult.emailsSent / lastResult.totalUsers) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                {lastResult.results && lastResult.results.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Detailed Results:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {lastResult.results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <span className="truncate flex-1">{result.email}</span>
                          <div className="flex items-center gap-2">
                            {result.status === 'sent' ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Sent
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lastResult.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Error Details:</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{lastResult.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}