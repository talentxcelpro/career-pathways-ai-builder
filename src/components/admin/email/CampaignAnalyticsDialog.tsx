import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mail, Eye, MousePointer, TrendingUp, Users } from 'lucide-react';

interface CampaignAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: any;
}

export const CampaignAnalyticsDialog = ({ open, onOpenChange, campaign }: CampaignAnalyticsDialogProps) => {
  if (!campaign) return null;

  const openRate = campaign.emails_delivered > 0 
    ? ((campaign.emails_opened / campaign.emails_delivered) * 100).toFixed(1)
    : '0.0';
    
  const clickRate = campaign.emails_delivered > 0 
    ? ((campaign.emails_clicked / campaign.emails_delivered) * 100).toFixed(1)
    : '0.0';
    
  const deliveryRate = campaign.emails_sent > 0
    ? ((campaign.emails_delivered / campaign.emails_sent) * 100).toFixed(1)
    : '0.0';

  const bounceRate = campaign.emails_sent > 0
    ? ((campaign.emails_bounced / campaign.emails_sent) * 100).toFixed(1)
    : '0.0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Analytics: {campaign.campaign_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Recipients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaign.total_recipients.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaign.emails_sent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{deliveryRate}% delivered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  Opened
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaign.emails_opened.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{openRate}% open rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-purple-500" />
                  Clicked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaign.emails_clicked.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{clickRate}% click rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Delivered: {campaign.emails_delivered}</span>
                  <span>{deliveryRate}%</span>
                </div>
                <Progress value={parseFloat(deliveryRate)} className="h-2" />
              </div>

              {campaign.emails_bounced > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-destructive">Bounced: {campaign.emails_bounced}</span>
                    <span>{bounceRate}%</span>
                  </div>
                  <Progress value={parseFloat(bounceRate)} className="h-2 bg-red-100" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Open Rate</span>
                  <span className="font-semibold">{openRate}%</span>
                </div>
                <Progress value={parseFloat(openRate)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Click Rate</span>
                  <span className="font-semibold">{clickRate}%</span>
                </div>
                <Progress value={parseFloat(clickRate)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Click-to-Open Rate</span>
                  <span className="font-semibold">
                    {campaign.emails_opened > 0 
                      ? ((campaign.emails_clicked / campaign.emails_opened) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                <Progress 
                  value={campaign.emails_opened > 0 ? (campaign.emails_clicked / campaign.emails_opened) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{campaign.campaign_type}</span>
              </div>
              {campaign.module_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Module:</span>
                  <span className="font-medium">{campaign.module_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{campaign.status}</span>
              </div>
              {campaign.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(campaign.created_at).toLocaleString()}</span>
                </div>
              )}
              {campaign.started_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-medium">{new Date(campaign.started_at).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};