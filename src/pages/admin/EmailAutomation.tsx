import { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Mail, Send, Activity, Settings, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

const EmailAutomationPage = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    name: ''
  });

  // Fetch real queue data
  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['email-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch email stats
  const { data: stats } = useQuery({
    queryKey: ['email-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_queue')
        .select('status');
      
      if (error) throw error;
      
      const sent = data.filter(e => e.status === 'sent').length;
      const pending = data.filter(e => e.status === 'pending').length;
      const failed = data.filter(e => e.status === 'failed').length;
      
      return { total: data.length, sent, pending, failed };
    }
  });

  const sendTestEmail = async () => {
    if (!emailForm.to || !emailForm.subject) {
      toast({
        title: "Missing fields",
        description: "Please fill in email and subject",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: {
          event_name: 'test_email',
          recipient_email: emailForm.to,
          recipient_name: emailForm.name || 'User',
          data: {
            subject: emailForm.subject
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "✅ Email Sent!",
          description: `Message ID: ${data.messageId}`
        });
        setEmailForm({ to: '', subject: '', name: '' });
        refetchQueue();
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (error: any) {
      toast({
        title: "❌ Failed to send",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const processQueue = async () => {
    try {
      await supabase.functions.invoke('process-email-queue');
      toast({
        title: "✅ Queue Processing",
        description: "Email queue processing started"
      });
      setTimeout(() => refetchQueue(), 2000);
    } catch (error: any) {
      toast({
        title: "❌ Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <UnifiedAdminLayout 
      title="Email System"
      description="Send emails and monitor delivery status"
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Email
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats?.sent || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats?.failed || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Emails */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Emails</CardTitle>
              <CardDescription>Last 10 emails from the queue</CardDescription>
            </CardHeader>
            <CardContent>
              {!queueData || queueData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No emails in queue yet
                </div>
              ) : (
                <div className="space-y-2">
                  {queueData.slice(0, 10).map((email: any) => (
                    <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{email.to_email}</div>
                        <div className="text-sm text-muted-foreground">{email.subject}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {email.status === 'sent' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {email.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                        {email.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="text-sm capitalize">{email.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>Send a test email via Amazon SES</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">Recipient Email *</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="user@example.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Recipient Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={emailForm.name}
                  onChange={(e) => setEmailForm({ ...emailForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Test Email"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                />
              </div>

              <Button 
                onClick={sendTestEmail} 
                disabled={sending}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>

              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">📧 Email System Info:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>From: TalentXcel &lt;noreply@talentxcel.in&gt;</li>
                  <li>Region: Europe (Stockholm)</li>
                  <li>Provider: Amazon SES</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Email Queue</CardTitle>
                  <CardDescription>Manage pending and failed emails</CardDescription>
                </div>
                <Button onClick={processQueue} variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Process Queue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!queueData || queueData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Email queue is empty</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queueData.map((email: any) => (
                    <div key={email.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{email.to_email}</span>
                          {email.priority === 'high' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">High Priority</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{email.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(email.created_at).toLocaleString()}
                        </div>
                        {email.sent_at && (
                          <div className="text-xs text-muted-foreground">
                            Sent: {new Date(email.sent_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {email.status === 'sent' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {email.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                          {email.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                          <span className="text-sm font-medium capitalize">{email.status}</span>
                        </div>
                        {email.attempts && (
                          <span className="text-xs text-muted-foreground">Attempts: {email.attempts}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AWS SES Configuration</CardTitle>
              <CardDescription>Your email delivery is configured and working</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value="eu-north-1 (Europe Stockholm)" disabled />
              </div>

              <div className="space-y-2">
                <Label>From Email</Label>
                <Input value="noreply@talentxcel.in" disabled />
              </div>

              <div className="space-y-2">
                <Label>Domain</Label>
                <Input value="talentxcel.in" disabled />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">Verified & Active</span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">📋 Configuration Details:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>DKIM: Enabled</li>
                  <li>SPF: Configured</li>
                  <li>DMARC: Active</li>
                  <li>Fallback: us-east-1</li>
                </ul>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a 
                  href="https://eu-north-1.console.aws.amazon.com/ses/home?region=eu-north-1#/verified-identities" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Open AWS SES Console
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </UnifiedAdminLayout>
  );
};

export default EmailAutomationPage;