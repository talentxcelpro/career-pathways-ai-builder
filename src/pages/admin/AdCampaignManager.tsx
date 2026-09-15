import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, TrendingUp, Eye, DollarSign, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const AdCampaignManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch campaigns from Supabase
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['ad-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: async (campaignData: any) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaignData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      toast.success('Campaign created successfully');
      setNewCampaign({
        campaign_name: '',
        campaign_type: 'search',
        budget_settings: { daily_budget: 0, total_budget: 0 },
        targeting_rules: { locations: [], demographics: {} },
        creative_assets: { headlines: [], descriptions: [] }
      });
    },
    onError: (error) => {
      toast.error('Failed to create campaign');
      console.error(error);
    }
  });

  const [newCampaign, setNewCampaign] = useState({
    campaign_name: '',
    campaign_type: 'search',
    budget_settings: { daily_budget: 0, total_budget: 0 },
    targeting_rules: { locations: [], demographics: {} },
    creative_assets: { headlines: [], descriptions: [] }
  });

  const campaignStats = {
    totalCampaigns: campaigns?.length || 0,
    activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
    totalSpend: campaigns?.reduce((sum, c) => sum + (c.budget_settings?.total_budget || 0), 0) || 0,
    totalImpressions: campaigns?.reduce((sum, c) => sum + (c.performance_metrics?.impressions || 0), 0) || 0
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.campaign_name || !newCampaign.campaign_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    createCampaign.mutate({
      ...newCampaign,
      status: 'draft',
      created_by: user?.id
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ad Campaign Manager</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage advertising campaigns across multiple platforms
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Total Campaigns</h3>
                <p className="text-2xl font-bold text-primary">{campaignStats.totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Active Campaigns</h3>
                <p className="text-2xl font-bold text-primary">{campaignStats.activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Total Spend</h3>
                <p className="text-2xl font-bold text-primary">${campaignStats.totalSpend}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-orange-500">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Impressions</h3>
                <p className="text-2xl font-bold text-primary">{campaignStats.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Manage your current advertising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : campaigns?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No campaigns found. Create your first campaign to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns?.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{campaign.campaign_name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.campaign_type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Set up a new advertising campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaign.campaign_name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, campaign_name: e.target.value }))}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-type">Campaign Type</Label>
                  <Select
                    value={newCampaign.campaign_type}
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, campaign_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="search">Search Ads</SelectItem>
                      <SelectItem value="display">Display Ads</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="video">Video Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="daily-budget">Daily Budget ($)</Label>
                  <Input
                    id="daily-budget"
                    type="number"
                    value={newCampaign.budget_settings.daily_budget}
                    onChange={(e) => setNewCampaign(prev => ({
                      ...prev,
                      budget_settings: { ...prev.budget_settings, daily_budget: Number(e.target.value) }
                    }))}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label htmlFor="total-budget">Total Budget ($)</Label>
                  <Input
                    id="total-budget"
                    type="number"
                    value={newCampaign.budget_settings.total_budget}
                    onChange={(e) => setNewCampaign(prev => ({
                      ...prev,
                      budget_settings: { ...prev.budget_settings, total_budget: Number(e.target.value) }
                    }))}
                    placeholder="3000"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateCampaign} 
                className="w-full"
                disabled={createCampaign.isPending}
              >
                {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard will be available once campaigns are running.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdCampaignManager;