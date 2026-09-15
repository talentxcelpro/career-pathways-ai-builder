import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Target, 
  BarChart, 
  Settings, 
  Zap,
  Calendar,
  MessageSquare,
  Heart,
  UserPlus,
  Repeat,
  Trophy
} from 'lucide-react';

interface GrowthCampaign {
  id?: string;
  name: string;
  type: 'onboarding' | 'retention' | 'referral' | 'engagement' | 'winback';
  status: 'draft' | 'active' | 'paused';
  trigger_conditions: any;
  email_sequence: any[];
  target_audience: string;
  success_metrics: string[];
  created_at?: string;
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  conditions: any;
  user_count: number;
}

export const GrowthCommunicationSystem: React.FC = () => {
  const [campaigns, setCampaigns] = useState<GrowthCampaign[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<GrowthCampaign | null>(null);

  const campaignTypes = [
    { value: 'onboarding', label: 'User Onboarding', icon: UserPlus, color: 'bg-blue-500' },
    { value: 'retention', label: 'User Retention', icon: Heart, color: 'bg-green-500' },
    { value: 'referral', label: 'Referral Program', icon: Repeat, color: 'bg-purple-500' },
    { value: 'engagement', label: 'Re-engagement', icon: Zap, color: 'bg-orange-500' },
    { value: 'winback', label: 'Win-back', icon: Trophy, color: 'bg-red-500' }
  ];

  const [newCampaign, setNewCampaign] = useState<GrowthCampaign>({
    name: '',
    type: 'onboarding',
    status: 'draft',
    trigger_conditions: {},
    email_sequence: [],
    target_audience: '',
    success_metrics: []
  });

  useEffect(() => {
    fetchCampaigns();
    fetchSegments();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_segments')
        .select('*')
        .order('name');

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  };

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.type) {
      toast.error('Please fill in campaign name and type');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('growth_email_campaigns')
        .insert([newCampaign])
        .select()
        .single();

      if (error) throw error;
      
      setCampaigns([data, ...campaigns]);
      setNewCampaign({
        name: '',
        type: 'onboarding',
        status: 'draft',
        trigger_conditions: {},
        email_sequence: [],
        target_audience: '',
        success_metrics: []
      });
      
      toast.success('Growth campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const activateCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('growth_email_campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) throw error;
      
      await fetchCampaigns();
      toast.success('Campaign activated!');
    } catch (error) {
      console.error('Error activating campaign:', error);
      toast.error('Failed to activate campaign');
    }
  };

  const getGrowthTemplates = (type: string) => {
    const templates: Record<string, any[]> = {
      onboarding: [
        { name: 'Welcome Email', delay: 0, subject: 'Welcome to TalentXcel!' },
        { name: 'Profile Setup Guide', delay: 1, subject: 'Complete your profile in 5 minutes' },
        { name: 'First Job Application Tips', delay: 3, subject: 'Your first application awaits!' },
        { name: 'Network Building Guide', delay: 7, subject: 'Build your professional network' }
      ],
      retention: [
        { name: 'Weekly Job Matches', delay: 0, subject: 'New jobs perfect for you' },
        { name: 'Skill Development Tips', delay: 3, subject: 'Level up your skills' },
        { name: 'Success Stories', delay: 7, subject: 'How others found their dream job' }
      ],
      referral: [
        { name: 'Referral Invitation', delay: 0, subject: 'Earn rewards by referring friends' },
        { name: 'Referral Reminder', delay: 7, subject: 'Your friends need TalentXcel too!' }
      ],
      engagement: [
        { name: 'We Miss You', delay: 0, subject: 'Come back and see what\'s new' },
        { name: 'New Features Update', delay: 3, subject: 'Exciting new features just for you' }
      ],
      winback: [
        { name: 'Special Offer', delay: 0, subject: 'Exclusive offer to welcome you back' },
        { name: 'Success Updates', delay: 5, subject: 'See how the platform has grown' }
      ]
    };
    return templates[type] || [];
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Growth Communication System
          </CardTitle>
          <CardDescription>
            Advanced email automation for platform growth, user engagement, and retention
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Growth Campaigns</TabsTrigger>
          <TabsTrigger value="segments">User Segments</TabsTrigger>
          <TabsTrigger value="analytics">Growth Analytics</TabsTrigger>
          <TabsTrigger value="automation">Smart Automation</TabsTrigger>
        </TabsList>

        {/* Growth Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          {/* Create New Campaign */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Create Growth Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input
                    placeholder="New User Onboarding"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Campaign Type</Label>
                  <Select 
                    value={newCampaign.type} 
                    onValueChange={(value: any) => setNewCampaign({...newCampaign, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select 
                    value={newCampaign.target_audience} 
                    onValueChange={(value) => setNewCampaign({...newCampaign, target_audience: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new_users">New Users</SelectItem>
                      <SelectItem value="active_users">Active Users</SelectItem>
                      <SelectItem value="inactive_users">Inactive Users</SelectItem>
                      <SelectItem value="job_seekers">Job Seekers</SelectItem>
                      <SelectItem value="employers">Employers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email Sequence Preview */}
              {newCampaign.type && (
                <div className="space-y-3">
                  <Label>Email Sequence Preview</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getGrowthTemplates(newCampaign.type).map((template, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{template.name}</span>
                          <Badge variant="outline">Day {template.delay}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={createCampaign} disabled={isLoading} className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Create Growth Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Existing Campaigns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => {
              const campaignType = campaignTypes.find(t => t.value === campaign.type);
              return (
                <Card key={campaign.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {campaignType && <campaignType.icon className="h-5 w-5" />}
                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                      </div>
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                        className={campaign.status === 'active' ? 'bg-green-500' : ''}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <CardDescription>{campaignType?.label}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>Target: {campaign.target_audience || 'All users'}</span>
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === 'draft' && (
                        <Button 
                          size="sm" 
                          onClick={() => activateCampaign(campaign.id!)}
                          className="flex-1"
                        >
                          Activate
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* User Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                User Segmentation for Targeted Growth
              </CardTitle>
              <CardDescription>
                Create targeted user segments for personalized communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'New Signups', count: '1,234', description: 'Users who joined in the last 7 days' },
                  { name: 'Active Job Seekers', count: '5,678', description: 'Users who applied to jobs recently' },
                  { name: 'Inactive Users', count: '2,345', description: 'Users who haven\'t logged in for 30+ days' },
                  { name: 'Employers', count: '456', description: 'Users with employer accounts' },
                  { name: 'High Engagement', count: '3,456', description: 'Users with 80%+ profile completion' },
                  { name: 'Mobile Users', count: '4,567', description: 'Users primarily using mobile app' }
                ].map((segment, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{segment.name}</h4>
                        <Badge>{segment.count}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{segment.description}</p>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        Create Campaign
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Email Open Rate', value: '24.5%', change: '+2.1%', icon: Mail },
              { title: 'Click-through Rate', value: '4.2%', change: '+0.8%', icon: MessageSquare },
              { title: 'User Retention', value: '67%', change: '+5.3%', icon: Heart },
              { title: 'Conversion Rate', value: '8.9%', change: '+1.2%', icon: TrendingUp }
            ].map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <metric.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-green-600">{metric.change}</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.title}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Growth Communication Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Growth analytics chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Smart Growth Automation
              </CardTitle>
              <CardDescription>
                AI-powered automation rules for maximum growth impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: 'Welcome Series Optimization',
                  description: 'Automatically adjust welcome email timing based on user engagement',
                  enabled: true
                },
                {
                  name: 'Smart Send Time',
                  description: 'Send emails when users are most likely to open them',
                  enabled: true
                },
                {
                  name: 'Content Personalization',
                  description: 'Customize email content based on user behavior and preferences',
                  enabled: false
                },
                {
                  name: 'Re-engagement Triggers',
                  description: 'Automatically send re-engagement campaigns to inactive users',
                  enabled: true
                },
                {
                  name: 'A/B Test Automation',
                  description: 'Automatically test different email variations for better performance',
                  enabled: false
                }
              ].map((rule, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                  <Switch checked={rule.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
