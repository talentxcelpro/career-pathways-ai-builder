import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Settings, PlayCircle, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export default function EmailSystemGuide() {
  const [isFixing, setIsFixing] = useState(false);

  const handleFixEmails = async () => {
    setIsFixing(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-email-automation', {
        body: { action: 'fix_all' }
      });
      
      if (error) throw error;
      
      toast.success(`Fixed ${data.results.total_processed} email issues`);
    } catch (error: any) {
      toast.error(`Fix failed: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  const triggerEmailCampaign = async (campaignType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { healthCheck: false }
      });
      
      if (error) throw error;
      
      toast.success(`Email campaign triggered: ${data.processed} emails processed`);
    } catch (error: any) {
      toast.error(`Campaign failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Start email campaigns and fix issues
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            onClick={handleFixEmails} 
            disabled={isFixing}
            variant="outline"
          >
            {isFixing ? "Fixing..." : "Fix Email Issues"}
          </Button>
          <Button 
            onClick={() => triggerEmailCampaign('manual')}
            className="bg-primary"
          >
            <Mail className="h-4 w-4 mr-2" />
            Process Email Queue
          </Button>
        </CardContent>
      </Card>

      {/* Email Campaign Types & Timings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Email Campaign Timings
          </CardTitle>
          <CardDescription>
            Automated email schedule and triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Welcome Emails</h4>
                <Badge variant="secondary">Immediate</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sent immediately when user registers (0-5 minutes delay)
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Profile Completion</h4>
                <Badge variant="outline">24 hours</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sent 24 hours after registration if profile incomplete
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Job Recommendations</h4>
                <Badge variant="outline">Weekly</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sent every Monday at 9 AM with personalized job matches
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Inactive User Nudge</h4>
                <Badge variant="outline">7 days</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sent after 7 days of inactivity to re-engage users
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Monthly Digest</h4>
                <Badge variant="outline">Monthly</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                First Monday of each month with platform updates
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Application Updates</h4>
                <Badge variant="secondary">Real-time</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Instant notifications for application status changes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Start Sending Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            How to Start Sending Emails
          </CardTitle>
          <CardDescription>
            Step-by-step guide to configure email automation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-semibold">Configure SMTP Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Set up SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in edge function secrets
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-semibold">Verify Email Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure all templates have valid HTML content and required placeholders
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-semibold">Set Up Cron Jobs</h4>
                <p className="text-sm text-muted-foreground">
                  Configure pg_cron to run process-email-queue every 5 minutes
                </p>
                <code className="text-xs bg-muted p-1 rounded mt-1 block">
                  SELECT cron.schedule('process-emails', '*/5 * * * *', 'SELECT net.http_post(...)')
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <div>
                <h4 className="font-semibold">Test Email Delivery</h4>
                <p className="text-sm text-muted-foreground">
                  Use the test email sender to verify SMTP configuration works
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                5
              </div>
              <div>
                <h4 className="font-semibold">Monitor Queue Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Watch the Communication Command Center for real-time email metrics
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Issues */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            Current System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Edge Function Status:</span>
              <Badge variant="destructive">Syntax Error Detected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Failed Emails (24h):</span>
              <Badge variant="outline">98 failed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Emails:</span>
              <Badge variant="secondary">403 pending</Badge>
            </div>
            <p className="text-sm text-orange-700 mt-3">
              <strong>Fixed:</strong> Removed duplicate variable declaration in send-email-notification function.
              Click "Fix Email Issues" to reset failed emails and "Process Email Queue" to resume sending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}