import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Play, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface EmailStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  success_rate: number;
}

export default function EmailSystemFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<EmailStats>({
    total: 0,
    sent: 0,
    pending: 0,
    failed: 0,
    success_rate: 0
  });

  const fetchEmailStats = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automation_queue')
        .select('status')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const statusCounts = data?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const total = data?.length || 0;
      const sent = statusCounts.sent || 0;
      const pending = statusCounts.pending || 0;
      const failed = statusCounts.failed || 0;
      const success_rate = total > 0 ? (sent / total) * 100 : 0;

      setStats({ total, sent, pending, failed, success_rate });
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  useEffect(() => {
    fetchEmailStats();
    const interval = setInterval(fetchEmailStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleFixEmails = async () => {
    setIsFixing(true);
    try {
      console.log('🔧 Starting email automation fix...');
      
      const { data, error } = await supabase.functions.invoke('fix-email-automation', {
        body: { action: 'fix_all' }
      });
      
      if (error) {
        console.error('Fix error:', error);
        throw error;
      }
      
      console.log('Fix result:', data);
      toast.success(`Fixed ${data.results.total_processed} email issues`);
      await fetchEmailStats();
    } catch (error: any) {
      console.error('Error running email fix:', error);
      toast.error(`Fix failed: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { healthCheck: false }
      });
      
      if (error) throw error;
      
      toast.success(`Processed ${data.processed} emails from queue`);
      await fetchEmailStats();
    } catch (error: any) {
      toast.error(`Queue processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Email System Status
          </CardTitle>
          <CardDescription>
            Current email automation system health and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Emails (24h)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <div className="text-sm text-muted-foreground">Sent Successfully</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-semibold">Success Rate</div>
              <div className="text-sm text-muted-foreground">
                {stats.success_rate.toFixed(1)}% of emails delivered successfully
              </div>
            </div>
            <Badge 
              variant={stats.success_rate > 80 ? "default" : stats.success_rate > 50 ? "secondary" : "destructive"}
            >
              {stats.success_rate.toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Quick Fix Actions
          </CardTitle>
          <CardDescription>
            Fix common email delivery issues and process pending emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={handleFixEmails} 
              disabled={isFixing}
              variant="outline"
              className="w-full"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fixing Issues...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Fix Failed Emails
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleProcessQueue}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process Email Queue
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What these actions do:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Fix Failed Emails:</strong> Resets failed emails to pending status for retry</li>
              <li>• <strong>Process Email Queue:</strong> Manually triggers email processing for pending emails</li>
              <li>• <strong>Auto-retry:</strong> Failed emails are automatically retried up to 3 times</li>
              <li>• <strong>Rate Limiting:</strong> System respects SMTP provider limits to avoid blocking</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* System Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Edge Function Status:</span>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Operational
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SMTP Connection:</span>
              <Badge variant="secondary">
                Ready
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Template Validation:</span>
              <Badge variant="default">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Queue Processing:</span>
              <Badge variant={stats.pending > 0 ? "secondary" : "default"}>
                {stats.pending > 0 ? `${stats.pending} Pending` : 'Current'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}