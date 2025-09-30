import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Pause, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { CampaignDialog } from './CampaignDialog';
import { useToast } from '@/hooks/use-toast';

export const CampaignManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'scheduled': return 'default';
      default: return 'secondary';
    }
  };

  const calculateProgress = (campaign: any) => {
    if (!campaign.total_recipients) return 0;
    return (campaign.emails_sent / campaign.total_recipients) * 100;
  };

  const calculateEngagement = (campaign: any) => {
    if (!campaign.emails_delivered) return { openRate: 0, clickRate: 0 };
    return {
      openRate: ((campaign.emails_opened / campaign.emails_delivered) * 100).toFixed(1),
      clickRate: ((campaign.emails_clicked / campaign.emails_delivered) * 100).toFixed(1),
    };
  };

  const updateCampaignStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('email_campaigns')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      toast({ title: 'Campaign updated', description: 'Campaign status updated successfully' });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading campaigns...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Email Campaigns ({campaigns?.length || 0})</span>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns?.map((campaign) => {
              const progress = calculateProgress(campaign);
              const { openRate, clickRate } = calculateEngagement(campaign);
              
              return (
                <Card key={campaign.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{campaign.campaign_name}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline">{campaign.campaign_type}</Badge>
                            {campaign.module_name && (
                              <Badge variant="secondary">{campaign.module_name}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <BarChart className="h-4 w-4 mr-1" />
                            Analytics
                          </Button>
                          {campaign.status === 'running' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateCampaignStatusMutation.mutate({ id: campaign.id, status: 'paused' })}
                              disabled={updateCampaignStatusMutation.isPending}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          ) : campaign.status === 'paused' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateCampaignStatusMutation.mutate({ id: campaign.id, status: 'running' })}
                              disabled={updateCampaignStatusMutation.isPending}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Recipients</p>
                          <p className="font-semibold">{campaign.total_recipients.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sent</p>
                          <p className="font-semibold">{campaign.emails_sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Delivered</p>
                          <p className="font-semibold">{campaign.emails_delivered.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Open Rate</p>
                          <p className="font-semibold">{openRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Click Rate</p>
                          <p className="font-semibold">{clickRate}%</p>
                        </div>
                      </div>

                      {campaign.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      )}

                      {campaign.scheduled_at && (
                        <p className="text-xs text-muted-foreground">
                          Scheduled for: {new Date(campaign.scheduled_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {campaigns?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No campaigns created yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    
    <CampaignDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
    />
    </>
  );
};
