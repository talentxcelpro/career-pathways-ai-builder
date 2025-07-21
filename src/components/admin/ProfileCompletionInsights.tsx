import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileInsights {
  total_users: number;
  complete_profiles: number;
  incomplete_profiles: number;
  completion_rate: number;
  avg_completion_score: number;
  users_needing_reminders: number;
}

export const ProfileCompletionInsights = () => {
  const [insights, setInsights] = useState<ProfileInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [queueing, setQueueing] = useState(false);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase.rpc('get_profile_completion_insights');
      
      if (error) {
        console.error('Error fetching insights:', error);
        toast.error('Failed to load profile completion insights');
        return;
      }

      if (data && data.length > 0) {
        setInsights(data[0]);
      }
    } catch (error) {
      console.error('Error in fetchInsights:', error);
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const queueProfileReminders = async () => {
    setQueueing(true);
    try {
      const { data, error } = await supabase.rpc('queue_profile_completion_reminders');
      
      if (error) {
        console.error('Error queueing reminders:', error);
        toast.error('Failed to queue profile completion reminders');
        return;
      }

      toast.success(`Successfully queued ${data || 0} profile completion reminders`);
      await fetchInsights(); // Refresh insights
    } catch (error) {
      console.error('Error in queueProfileReminders:', error);
      toast.error('Failed to queue reminders');
    } finally {
      setQueueing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No insights available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profile Completion Insights
          </CardTitle>
          <CardDescription>
            Monitor user profile completion rates and manage reminder campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{insights.total_users}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{insights.complete_profiles}</div>
              <div className="text-sm text-muted-foreground">Complete Profiles</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{insights.incomplete_profiles}</div>
              <div className="text-sm text-muted-foreground">Incomplete Profiles</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm text-muted-foreground">{insights.completion_rate}%</span>
              </div>
              <Progress value={insights.completion_rate} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Average Completion Score</span>
                <span className="text-sm text-muted-foreground">{insights.avg_completion_score}%</span>
              </div>
              <Progress value={insights.avg_completion_score} className="h-2" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Profile Completion Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    {insights.users_needing_reminders} users eligible for reminders
                  </div>
                </div>
              </div>
              <Button 
                onClick={queueProfileReminders}
                disabled={queueing || insights.users_needing_reminders === 0}
                size="sm"
              >
                {queueing ? 'Queueing...' : 'Send Reminders'}
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Button variant="outline" onClick={fetchInsights} size="sm">
              Refresh Data
            </Button>
            <Badge variant="secondary">
              Last updated: {new Date().toLocaleTimeString()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};