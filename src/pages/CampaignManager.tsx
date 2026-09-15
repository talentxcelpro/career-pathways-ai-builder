import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Pause, BarChart3, Users, Target, Mail, Bot, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { CreateCampaignDialog } from '@/components/campaigns/CreateCampaignDialog';
import { CampaignStats } from '@/components/campaigns/CampaignStats';
import { OutreachTargets } from '@/components/campaigns/OutreachTargets';
import { AutomationDashboard } from '@/components/campaigns/AutomationDashboard';

export default function CampaignManager() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['backlink-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backlink_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: opportunities } = useQuery({
    queryKey: ['backlink-opportunities', selectedCampaign],
    queryFn: async () => {
      if (!selectedCampaign) return [];
      
      const { data, error } = await supabase
        .from('backlink_opportunities')
        .select('*')
        .eq('campaign_id', selectedCampaign)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCampaign,
  });

  const launchCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke('backlink-automation', {
        body: { campaign_id: campaignId, action: 'launch' }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Campaign launched successfully!');
      queryClient.invalidateQueries({ queryKey: ['backlink-campaigns'] });
    },
    onError: (error) => {
      toast.error(`Failed to launch campaign: ${error.message}`);
    },
  });

  const executeOutreach = useMutation({
    mutationFn: async (params: { targetIds: string[], contentType: string }) => {
      const { data, error } = await supabase.functions.invoke('backlink-outreach', {
        body: {
          target_ids: params.targetIds,
          content_type: params.contentType,
          send_immediately: true
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Outreach completed: ${data.sent} emails sent`);
      queryClient.invalidateQueries({ queryKey: ['backlink-opportunities'] });
    },
    onError: (error) => {
      toast.error(`Outreach failed: ${error.message}`);
    },
  });

  const getCampaignProgress = (campaign: any) => {
    if (!campaign.target_count) return 0;
    return Math.round((campaign.completed_count / campaign.target_count) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'paused': return 'bg-amber-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaign Manager</h1>
          <p className="text-muted-foreground">Launch and manage content & outreach campaigns</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns" className="gap-2">
            <Target className="h-4 w-4" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="automation" className="gap-2">
            <Bot className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="outreach" className="gap-2">
            <Mail className="h-4 w-4" />
            Outreach
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="internal-links" className="gap-2">
            <Users className="h-4 w-4" />
            Internal Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign) => (
              <Card 
                key={campaign.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCampaign === campaign.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCampaign(campaign.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                    <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardDescription>{campaign.campaign_type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{campaign.completed_count}/{campaign.target_count}</span>
                    </div>
                    <Progress value={getCampaignProgress(campaign)} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-semibold">{Math.round(campaign.success_rate || 0)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold">${campaign.budget || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'active' ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Pause campaign logic
                        }}
                        className="gap-1"
                      >
                        <Pause className="h-3 w-3" />
                        Pause
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          launchCampaign.mutate(campaign.id);
                        }}
                        disabled={launchCampaign.isPending}
                        className="gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Launch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCampaign && opportunities && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Opportunities</CardTitle>
                <CardDescription>
                  Manage outreach opportunities for the selected campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => executeOutreach.mutate({
                        targetIds: opportunities
                          .filter(o => o.status === 'identified')
                          .map(o => o.id),
                        contentType: 'email_pitch'
                      })}
                      disabled={executeOutreach.isPending}
                      className="gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Send Outreach Emails
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {opportunities.map((opportunity) => (
                      <div 
                        key={opportunity.id}
                        className="flex justify-between items-center p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{opportunity.target_domain}</h4>
                          <p className="text-sm text-muted-foreground">
                            {opportunity.contact_name} • {opportunity.contact_email}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{opportunity.opportunity_type}</Badge>
                            <Badge variant={
                              opportunity.status === 'identified' ? 'default' :
                              opportunity.status === 'contacted' ? 'secondary' :
                              opportunity.status === 'responded' ? 'success' : 'destructive'
                            }>
                              {opportunity.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">DA: {opportunity.domain_authority}</p>
                          <p className="text-sm font-semibold">Score: {opportunity.relevance_score}/10</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="automation">
          <AutomationDashboard />
        </TabsContent>

        <TabsContent value="outreach">
          <OutreachTargets />
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignStats />
        </TabsContent>

        <TabsContent value="internal-links">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Internal Linking</h3>
            <p className="text-muted-foreground">Internal linking automation coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      <CreateCampaignDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCampaignCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['backlink-campaigns'] });
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}