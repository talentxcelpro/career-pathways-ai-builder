import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, 
  Users, 
  Filter, 
  TrendingUp, 
  Brain, 
  Zap,
  BarChart3,
  UserCheck,
  Mail,
  Clock,
  Activity
} from 'lucide-react';

interface UserSegment {
  id: string;
  segment_name: string;
  description: string;
  conditions: any;
  refresh_frequency: string;
  last_calculated: string;
  user_count: number;
  is_active: boolean;
  created_at: string;
}

interface SegmentCondition {
  field: string;
  operator: string;
  value: string | number;
  logic?: 'AND' | 'OR';
}

export const SmartUserSegmentation: React.FC = () => {
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<UserSegment | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newSegment, setNewSegment] = useState({
    segment_name: '',
    description: '',
    refresh_frequency: 'daily',
    conditions: [] as SegmentCondition[]
  });

  const defaultSegments = [
    {
      id: 'new_users',
      segment_name: 'New Users (Last 7 Days)',
      description: 'Users who registered in the last 7 days',
      user_count: 234,
      is_active: true,
      engagement_rate: 78.5,
      conversion_rate: 12.3
    },
    {
      id: 'highly_engaged',
      segment_name: 'Highly Engaged Users',
      description: 'Users with 80%+ profile completion and recent activity',
      user_count: 1567,
      is_active: true,
      engagement_rate: 92.1,
      conversion_rate: 34.7
    },
    {
      id: 'job_seekers_active',
      segment_name: 'Active Job Seekers',
      description: 'Users who applied to jobs in the last 30 days',
      user_count: 892,
      is_active: true,
      engagement_rate: 85.3,
      conversion_rate: 28.9
    },
    {
      id: 'at_risk_churn',
      segment_name: 'At Risk of Churning',
      description: 'Users with declining engagement patterns',
      user_count: 445,
      is_active: true,
      engagement_rate: 23.1,
      conversion_rate: 3.2
    },
    {
      id: 'premium_candidates',
      segment_name: 'Premium Upgrade Candidates',
      description: 'High-value users likely to convert to premium',
      user_count: 312,
      is_active: true,
      engagement_rate: 89.4,
      conversion_rate: 45.6
    },
    {
      id: 'employers',
      segment_name: 'Active Employers',
      description: 'Users posting jobs and hiring actively',
      user_count: 156,
      is_active: true,
      engagement_rate: 76.8,
      conversion_rate: 67.3
    }
  ];

  const segmentFields = [
    { value: 'profile_completion', label: 'Profile Completion %' },
    { value: 'last_login', label: 'Last Login Days' },
    { value: 'job_applications', label: 'Job Applications Count' },
    { value: 'email_opens', label: 'Email Opens (30d)' },
    { value: 'page_views', label: 'Page Views (30d)' },
    { value: 'account_age', label: 'Account Age (days)' },
    { value: 'location', label: 'Location' },
    { value: 'skills_count', label: 'Skills Count' },
    { value: 'connections_count', label: 'Connections Count' },
    { value: 'premium_status', label: 'Premium Status' }
  ];

  const operators = [
    { value: 'gt', label: 'Greater than' },
    { value: 'lt', label: 'Less than' },
    { value: 'eq', label: 'Equals' },
    { value: 'neq', label: 'Not equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'in', label: 'In list' }
  ];

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dynamic_user_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSegments(data || []);

    } catch (error) {
      console.error('Error loading segments:', error);
      toast.error('Failed to load user segments');
    } finally {
      setIsLoading(false);
    }
  };

  const createSegment = async () => {
    if (!newSegment.segment_name || newSegment.conditions.length === 0) {
      toast.error('Please provide segment name and at least one condition');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('dynamic_user_segments')
        .insert([{
          segment_name: newSegment.segment_name,
          description: newSegment.description,
          conditions: newSegment.conditions,
          refresh_frequency: newSegment.refresh_frequency,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('User segment created successfully!');
      setSegments([data, ...segments]);
      resetForm();

    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error('Failed to create user segment');
    } finally {
      setIsCreating(false);
    }
  };

  const addCondition = () => {
    setNewSegment({
      ...newSegment,
      conditions: [
        ...newSegment.conditions,
        { field: 'profile_completion', operator: 'gt', value: '', logic: 'AND' }
      ]
    });
  };

  const updateCondition = (index: number, updates: Partial<SegmentCondition>) => {
    const updatedConditions = newSegment.conditions.map((condition, i) =>
      i === index ? { ...condition, ...updates } : condition
    );
    setNewSegment({ ...newSegment, conditions: updatedConditions });
  };

  const removeCondition = (index: number) => {
    const updatedConditions = newSegment.conditions.filter((_, i) => i !== index);
    setNewSegment({ ...newSegment, conditions: updatedConditions });
  };

  const resetForm = () => {
    setNewSegment({
      segment_name: '',
      description: '',
      refresh_frequency: 'daily',
      conditions: []
    });
  };

  const calculateSegmentSize = async () => {
    // This would use AI to predict segment size based on conditions
    toast.info('Calculating segment size...');
    
    try {
      // Simulate API call to calculate segment size
      setTimeout(() => {
        const estimatedSize = Math.floor(Math.random() * 1000) + 50;
        toast.success(`Estimated segment size: ${estimatedSize} users`);
      }, 2000);
    } catch (error) {
      toast.error('Failed to calculate segment size');
    }
  };

  const createEmailCampaign = (segment: any) => {
    toast.success(`Creating targeted campaign for ${segment.segment_name}`);
    // This would integrate with the email campaign creator
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Smart User Segmentation
          </CardTitle>
          <CardDescription>
            AI-powered user segmentation for targeted email campaigns and personalization
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="segments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="segments">Active Segments</TabsTrigger>
          <TabsTrigger value="create">Create Segment</TabsTrigger>
          <TabsTrigger value="templates">Smart Templates</TabsTrigger>
          <TabsTrigger value="analytics">Segment Analytics</TabsTrigger>
        </TabsList>

        {/* Active Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultSegments.map((segment) => (
              <Card key={segment.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <Badge variant={segment.is_active ? 'default' : 'secondary'}>
                        {segment.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => createEmailCampaign(segment)}
                      className="flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      Campaign
                    </Button>
                  </div>

                  <h3 className="font-semibold mb-2">{segment.segment_name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{segment.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Users</span>
                      <span className="text-lg font-bold">{segment.user_count.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engagement Rate</span>
                      <span className={`text-sm font-medium ${
                        segment.engagement_rate > 70 ? 'text-green-600' : 
                        segment.engagement_rate > 40 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {segment.engagement_rate}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conversion Rate</span>
                      <span className={`text-sm font-medium ${
                        segment.conversion_rate > 20 ? 'text-green-600' : 
                        segment.conversion_rate > 10 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {segment.conversion_rate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Create Segment Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Dynamic User Segment</CardTitle>
              <CardDescription>
                Define conditions to automatically segment users based on their behavior and attributes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Segment Name</Label>
                  <Input
                    placeholder="e.g., High-Value Job Seekers"
                    value={newSegment.segment_name}
                    onChange={(e) => setNewSegment({...newSegment, segment_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Refresh Frequency</Label>
                  <Select 
                    value={newSegment.refresh_frequency} 
                    onValueChange={(value) => setNewSegment({...newSegment, refresh_frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Describe this segment and its purpose"
                  value={newSegment.description}
                  onChange={(e) => setNewSegment({...newSegment, description: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Segment Conditions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCondition}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Add Condition
                  </Button>
                </div>

                {newSegment.conditions.map((condition, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    {index > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm">Logic</Label>
                        <Select 
                          value={condition.logic || 'AND'} 
                          onValueChange={(value) => updateCondition(index, { logic: value as 'AND' | 'OR' })}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label>Field</Label>
                        <Select 
                          value={condition.field} 
                          onValueChange={(value) => updateCondition(index, { field: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {segmentFields.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select 
                          value={condition.operator} 
                          onValueChange={(value) => updateCondition(index, { operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          placeholder="Enter value"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCondition(index)}
                          className="w-full"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {newSegment.conditions.length === 0 && (
                  <div className="p-8 border-2 border-dashed rounded-lg text-center">
                    <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No conditions added yet</p>
                    <p className="text-sm text-muted-foreground">Click "Add Condition" to define your segment</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={createSegment} disabled={isCreating} className="flex-1">
                  {isCreating ? 'Creating...' : 'Create Segment'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={calculateSegmentSize}
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Calculate Size
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'New User Onboarding',
                description: 'Welcome sequence for users who just signed up',
                segments: ['New Users', 'Incomplete Profiles'],
                automation: 'Multi-step sequence'
              },
              {
                name: 'Job Seeker Engagement',
                description: 'Keep active job seekers engaged with relevant opportunities',
                segments: ['Active Job Seekers', 'High Engagement'],
                automation: 'Weekly digest'
              },
              {
                name: 'Churn Prevention',
                description: 'Re-engage users showing signs of declining activity',
                segments: ['At Risk of Churning', 'Inactive Users'],
                automation: 'Behavioral trigger'
              },
              {
                name: 'Premium Upsell',
                description: 'Convert high-value users to premium subscriptions',
                segments: ['Premium Candidates', 'High Engagement'],
                automation: 'Feature highlights'
              },
              {
                name: 'Employer Outreach',
                description: 'Targeted campaigns for hiring managers and employers',
                segments: ['Active Employers', 'Premium Employers'],
                automation: 'Monthly insights'
              },
              {
                name: 'Skill Development',
                description: 'Encourage users to improve their profiles and skills',
                segments: ['Incomplete Profiles', 'Skill Gaps'],
                automation: 'Learning recommendations'
              }
            ].map((template, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Zap className="h-5 w-5 text-orange-500" />
                    <Badge variant="outline">{template.automation}</Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Target Segments:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.segments.map((segment, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {segment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button size="sm" className="w-full mt-3">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Total Segments</span>
                </div>
                <div className="text-2xl font-bold">{defaultSegments.length}</div>
                <p className="text-sm text-muted-foreground">Active segments</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Avg. Segment Size</span>
                </div>
                <div className="text-2xl font-bold">
                  {Math.round(defaultSegments.reduce((acc, s) => acc + s.user_count, 0) / defaultSegments.length).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Users per segment</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Avg. Engagement</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(defaultSegments.reduce((acc, s) => acc + s.engagement_rate, 0) / defaultSegments.length)}%
                </div>
                <p className="text-sm text-muted-foreground">Cross segments</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Avg. Conversion</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(defaultSegments.reduce((acc, s) => acc + s.conversion_rate, 0) / defaultSegments.length)}%
                </div>
                <p className="text-sm text-muted-foreground">Cross segments</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Segment Performance Trends</CardTitle>
              <CardDescription>
                Track how your segments perform over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Segment performance chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};