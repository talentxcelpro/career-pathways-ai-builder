import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Settings, 
  Activity, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Timer,
  BarChart3
} from "lucide-react";

interface DeliveryStats {
  totalEmails: number;
  sentToday: number;
  pendingDelivery: number;
  failedDelivery: number;
  deliveryRate: number;
  avgDeliveryTime: number;
}

interface DeliveryJob {
  id: string;
  template_name: string;
  recipient_count: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  progress: number;
  error_message?: string;
}

export const EmailDeliveryEngine = () => {
  const [stats, setStats] = useState<DeliveryStats>({
    totalEmails: 0,
    sentToday: 0,
    pendingDelivery: 0,
    failedDelivery: 0,
    deliveryRate: 0,
    avgDeliveryTime: 0
  });
  
  const [deliveryJobs, setDeliveryJobs] = useState<DeliveryJob[]>([]);
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDeliveryStats();
    loadDeliveryJobs();
    checkEngineStatus();
    
    const interval = setInterval(() => {
      loadDeliveryStats();
      loadDeliveryJobs();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadDeliveryStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get email queue stats
      const { data: queueData } = await supabase
        .from('email_automation_queue')
        .select('status, created_at, sent_at');

      const totalEmails = queueData?.length || 0;
      const sentToday = queueData?.filter(item => 
        item.sent_at && item.sent_at.startsWith(today)
      ).length || 0;
      
      const pendingDelivery = queueData?.filter(item => 
        item.status === 'pending'
      ).length || 0;
      
      const failedDelivery = queueData?.filter(item => 
        item.status === 'failed'
      ).length || 0;

      const sentEmails = queueData?.filter(item => item.status === 'sent').length || 0;
      const deliveryRate = totalEmails > 0 ? (sentEmails / totalEmails) * 100 : 0;

      setStats({
        totalEmails,
        sentToday,
        pendingDelivery,
        failedDelivery,
        deliveryRate,
        avgDeliveryTime: 2.5 // Mock average delivery time in minutes
      });
    } catch (error) {
      console.error('Error loading delivery stats:', error);
    }
  };

  const loadDeliveryJobs = async () => {
    try {
      // Mock delivery jobs data - in real implementation, this would come from a jobs table
      const mockJobs: DeliveryJob[] = [
        {
          id: '1',
          template_name: 'Welcome Email',
          recipient_count: 1250,
          status: 'completed',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 1800000).toISOString(),
          progress: 100
        },
        {
          id: '2',
          template_name: 'Weekly Newsletter',
          recipient_count: 5000,
          status: 'processing',
          created_at: new Date(Date.now() - 900000).toISOString(),
          progress: 68
        },
        {
          id: '3',
          template_name: 'Password Reset',
          recipient_count: 45,
          status: 'queued',
          created_at: new Date().toISOString(),
          progress: 0
        }
      ];
      
      setDeliveryJobs(mockJobs);
    } catch (error) {
      console.error('Error loading delivery jobs:', error);
    }
    setLoading(false);
  };

  const checkEngineStatus = async () => {
    try {
      // Check if the email processing edge function is running
      const { data, error } = await supabase.functions.invoke('process-email-queue', {
        body: { action: 'status' }
      });
      
      if (!error && data?.status === 'active') {
        setIsEngineActive(true);
      }
    } catch (error) {
      console.error('Error checking engine status:', error);
    }
  };

  const toggleEngine = async () => {
    try {
      const action = isEngineActive ? 'stop' : 'start';
      
      const { error } = await supabase.functions.invoke('process-email-queue', {
        body: { action }
      });

      if (error) throw error;

      setIsEngineActive(!isEngineActive);
      toast({
        title: `Delivery Engine ${action === 'start' ? 'Started' : 'Stopped'}`,
        description: `Email delivery engine has been ${action === 'start' ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error toggling engine:', error);
      toast({
        title: "Error",
        description: "Failed to toggle delivery engine.",
        variant: "destructive"
      });
    }
  };

  const retryFailedEmails = async () => {
    try {
      const { error } = await supabase
        .from('email_automation_queue')
        .update({ 
          status: 'pending',
          attempts: 0,
          error_message: null,
          scheduled_at: new Date().toISOString()
        })
        .eq('status', 'failed');

      if (error) throw error;

      toast({
        title: "Failed Emails Queued",
        description: "All failed emails have been requeued for delivery.",
      });
      
      loadDeliveryStats();
    } catch (error) {
      console.error('Error retrying failed emails:', error);
      toast({
        title: "Error",
        description: "Failed to retry failed emails.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      queued: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading delivery engine...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Engine Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Email Delivery Engine
              </CardTitle>
              <CardDescription>
                Automated email processing and delivery system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isEngineActive ? "default" : "secondary"}>
                {isEngineActive ? "Active" : "Inactive"}
              </Badge>
              <Button
                onClick={toggleEngine}
                variant={isEngineActive ? "destructive" : "default"}
                size="sm"
              >
                {isEngineActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Engine
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Engine
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalEmails}</div>
              <div className="text-sm text-muted-foreground">Total Emails</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.sentToday}</div>
              <div className="text-sm text-muted-foreground">Sent Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingDelivery}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failedDelivery}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Delivery Rate</span>
              <span>{stats.deliveryRate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.deliveryRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Delivery Jobs</h3>
            <Button onClick={retryFailedEmails} variant="outline" size="sm">
              Retry Failed
            </Button>
          </div>
          
          <div className="space-y-4">
            {deliveryJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{job.template_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {job.recipient_count} recipients
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      <span className="text-sm text-muted-foreground">
                        {job.progress}%
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={job.progress} className="mb-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Started: {new Date(job.created_at).toLocaleString()}</span>
                    {job.completed_at && (
                      <span>Completed: {new Date(job.completed_at).toLocaleString()}</span>
                    )}
                  </div>
                  
                  {job.error_message && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                      {job.error_message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Delivery Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">24h average</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Avg Delivery Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgDeliveryTime}min</div>
                <p className="text-xs text-muted-foreground">Per email</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Recipients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,450</div>
                <p className="text-xs text-muted-foreground">Subscribed users</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Delivery Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Successful Deliveries</span>
                  <span className="text-sm font-medium text-green-600">94.5%</span>
                </div>
                <Progress value={94.5} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="text-sm font-medium text-yellow-600">3.2%</span>
                </div>
                <Progress value={3.2} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Failed Deliveries</span>
                  <span className="text-sm font-medium text-red-600">2.3%</span>
                </div>
                <Progress value={2.3} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Delivery Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Emails per Hour</label>
                  <input 
                    type="number" 
                    defaultValue="1000" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Retry Attempts</label>
                  <input 
                    type="number" 
                    defaultValue="3" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Retry Delay (minutes)</label>
                  <input 
                    type="number" 
                    defaultValue="15" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Batch Size</label>
                  <input 
                    type="number" 
                    defaultValue="100" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <Button className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};