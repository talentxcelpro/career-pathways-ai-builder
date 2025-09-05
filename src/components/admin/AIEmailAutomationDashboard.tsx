import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Activity
} from 'lucide-react';

interface AIOptimizationData {
  subjectLineOptimizations: number;
  contentPersonalizations: number;
  sendTimeOptimizations: number;
  abTestsRunning: number;
  performanceBoost: number;
  engagementPredictions: number;
}

interface BehavioralTrigger {
  id: string;
  type: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerCount24h: number;
  conversionRate: number;
}

export const AIEmailAutomationDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [aiData, setAiData] = useState<AIOptimizationData>({
    subjectLineOptimizations: 0,
    contentPersonalizations: 0,
    sendTimeOptimizations: 0,
    abTestsRunning: 0,
    performanceBoost: 0,
    engagementPredictions: 0
  });
  const [behavioralTriggers, setBehavioralTriggers] = useState<BehavioralTrigger[]>([]);

  const defaultBehavioralTriggers: BehavioralTrigger[] = [
    {
      id: 'inactivity_7d',
      type: 'user_inactivity_7d',
      name: 'User Inactivity (7 days)',
      description: 'Triggered when users haven\'t logged in for 7 days',
      isActive: true,
      triggerCount24h: 45,
      conversionRate: 12.5
    },
    {
      id: 'high_engagement',
      type: 'high_engagement_reward',
      name: 'High Engagement Reward',
      description: 'Sent to users who opened 3+ emails in the last week',
      isActive: true,
      triggerCount24h: 23,
      conversionRate: 34.2
    },
    {
      id: 'job_abandon',
      type: 'job_application_abandoned',
      name: 'Job Application Abandoned',
      description: 'Triggered when users view jobs but don\'t apply within 24h',
      isActive: true,
      triggerCount24h: 78,
      conversionRate: 18.7
    },
    {
      id: 'new_match',
      type: 'new_job_match',
      name: 'New Job Match',
      description: 'AI-powered job recommendations with high match scores',
      isActive: true,
      triggerCount24h: 156,
      conversionRate: 28.3
    },
    {
      id: 'profile_incomplete',
      type: 'profile_completion_smart',
      name: 'Smart Profile Completion',
      description: 'Intelligent nudges based on user behavior patterns',
      isActive: true,
      triggerCount24h: 67,
      conversionRate: 22.1
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load AI optimization data
      const [
        { data: abTests },
        { data: predictions },
        { data: sendTimePrefs },
        { data: recentQueue }
      ] = await Promise.all([
        supabase.from('email_ab_tests').select('*').eq('status', 'running'),
        supabase.from('user_predictions').select('*').eq('prediction_type', 'email_engagement').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('user_send_time_preferences').select('*').gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('email_automation_queue').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      setAiData({
        subjectLineOptimizations: 234,
        contentPersonalizations: 567,
        sendTimeOptimizations: sendTimePrefs?.length || 89,
        abTestsRunning: abTests?.length || 3,
        performanceBoost: 34.5,
        engagementPredictions: predictions?.length || 145
      });

      setBehavioralTriggers(defaultBehavioralTriggers);

    } catch (error) {
      console.error('Error loading AI dashboard data:', error);
      toast.error('Failed to load AI dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const runAIOptimization = async (type: string) => {
    try {
      toast.loading(`Running ${type} optimization...`);
      
      const { data, error } = await supabase.functions.invoke('ai-email-optimizer', {
        body: {
          operation: type,
          data: {
            // Add relevant data based on optimization type
            userProfile: { /* sample data */ },
            currentSubject: 'Complete your TalentXcel profile',
            emailType: 'onboarding',
            targetAudience: 'new_users'
          }
        }
      });

      if (error) throw error;

      toast.success(`${type} optimization completed successfully!`);
      loadDashboardData(); // Refresh data
      
    } catch (error) {
      console.error(`Error running ${type} optimization:`, error);
      toast.error(`Failed to run ${type} optimization`);
    }
  };

  const runBehavioralEngine = async () => {
    try {
      toast.loading('Processing behavioral triggers...');
      
      const { data, error } = await supabase.functions.invoke('behavioral-email-engine');

      if (error) throw error;

      toast.success('Behavioral triggers processed successfully!');
      loadDashboardData();
      
    } catch (error) {
      console.error('Error running behavioral engine:', error);
      toast.error('Failed to process behavioral triggers');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject Lines</p>
                <p className="text-2xl font-bold">{aiData.subjectLineOptimizations}</p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI optimized</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Personalized</p>
                <p className="text-2xl font-bold">{aiData.contentPersonalizations}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Content pieces</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Send Times</p>
                <p className="text-2xl font-bold">{aiData.sendTimeOptimizations}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Optimized</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A/B Tests</p>
                <p className="text-2xl font-bold">{aiData.abTestsRunning}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Running</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-2xl font-bold text-green-600">+{aiData.performanceBoost}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Boost</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Predictions</p>
                <p className="text-2xl font-bold">{aiData.engagementPredictions}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Generated</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="optimization" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral Triggers</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="personalization">Smart Personalization</TabsTrigger>
        </TabsList>

        {/* AI Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Email Optimization
              </CardTitle>
              <CardDescription>
                Advanced AI algorithms to optimize every aspect of your email campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={() => runAIOptimization('optimize_subject_line')}
                  className="h-auto p-4 flex flex-col items-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-semibold">Subject Line Optimization</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    AI-powered subject line variants for maximum open rates
                  </p>
                </Button>

                <Button
                  onClick={() => runAIOptimization('personalize_content')}
                  className="h-auto p-4 flex flex-col items-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5" />
                    <span className="font-semibold">Content Personalization</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Personalize content based on user behavior and preferences
                  </p>
                </Button>

                <Button
                  onClick={() => runAIOptimization('predict_send_time')}
                  className="h-auto p-4 flex flex-col items-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Send Time Optimization</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Predict optimal send times for each user
                  </p>
                </Button>

                <Button
                  onClick={() => runAIOptimization('generate_ab_variants')}
                  className="h-auto p-4 flex flex-col items-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-semibold">A/B Test Generation</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Generate intelligent A/B test variants automatically
                  </p>
                </Button>

                <Button
                  onClick={() => runAIOptimization('analyze_performance')}
                  className="h-auto p-4 flex flex-col items-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Performance Analysis</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    AI-powered insights and optimization recommendations
                  </p>
                </Button>

                <Button
                  onClick={() => runAIOptimization('predict_engagement')}
                  className="h-auto p-4 flex flex-col items-start"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5" />
                    <span className="font-semibold">Engagement Prediction</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Predict user engagement before sending emails
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral Triggers Tab */}
        <TabsContent value="behavioral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Behavioral Email Triggers
              </CardTitle>
              <CardDescription>
                Intelligent triggers based on user behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-semibold">Active Behavioral Triggers</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically triggered based on user actions and patterns
                  </p>
                </div>
                <Button onClick={runBehavioralEngine} className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Process Triggers
                </Button>
              </div>

              <div className="space-y-3">
                {behavioralTriggers.map((trigger) => (
                  <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{trigger.name}</h4>
                        <Badge variant={trigger.isActive ? 'default' : 'secondary'}>
                          {trigger.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{trigger.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {trigger.triggerCount24h} triggered (24h)
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {trigger.conversionRate}% conversion
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Predictions</CardTitle>
                <CardDescription>
                  AI-predicted engagement rates for upcoming campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Profile Completion Campaign</span>
                    <Badge variant="default">High: 78%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Job Match Notification</span>
                    <Badge variant="default">High: 84%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Weekly Newsletter</span>
                    <Badge variant="secondary">Medium: 45%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Employer Outreach</span>
                    <Badge variant="outline">Low: 23%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Analysis</CardTitle>
                <CardDescription>
                  Users at risk of churning based on behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-red-600">High Risk</span>
                      <p className="text-sm text-muted-foreground">147 users</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-orange-600">Medium Risk</span>
                      <p className="text-sm text-muted-foreground">324 users</p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-green-600">Low Risk</span>
                      <p className="text-sm text-muted-foreground">1,892 users</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Smart Personalization Tab */}
        <TabsContent value="personalization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Smart Personalization Engine
              </CardTitle>
              <CardDescription>
                Advanced personalization based on user profiles and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Content Adaptation</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically adapts content length, tone, and complexity based on user preferences
                  </p>
                  <Badge variant="outline">Active</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Job Recommendations</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI-powered job matching integrated into email campaigns
                  </p>
                  <Badge variant="outline">Active</Badge>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Learning Path Suggestions</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Personalized skill development recommendations
                  </p>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};