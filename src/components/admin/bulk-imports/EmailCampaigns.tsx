import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Play, Pause, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      name: 'Welcome Series',
      status: 'active',
      total_sent: 1247,
      open_rate: 45.2,
      click_rate: 12.8
    },
    {
      id: '2',
      name: 'Profile Completion Reminder',
      status: 'paused',
      total_sent: 823,
      open_rate: 38.4,
      click_rate: 9.2
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    template: ''
  });

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      // Create campaign in database
      toast.success('Campaign created successfully');
      setNewCampaign({ name: '', subject: '', template: '' });
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Campaign */}
      <Card>
        <CardHeader>
          <CardTitle>Create Email Campaign</CardTitle>
          <CardDescription>
            Set up automated email sequences for imported leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g., Onboarding Series"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                placeholder="Welcome to TalentXcel!"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Textarea
              id="template"
              value={newCampaign.template}
              onChange={(e) => setNewCampaign({ ...newCampaign, template: e.target.value })}
              placeholder="Hi {name}, welcome to TalentXcel..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Use variables: {'{name}'}, {'{email}'}, {'{designation}'}, {'{current_company}'}
            </p>
          </div>

          <Button onClick={createCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">{campaign.name}</h4>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sent: </span>
                    <span className="font-medium">{campaign.total_sent}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Open Rate: </span>
                    <span className="font-medium">{campaign.open_rate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Click Rate: </span>
                    <span className="font-medium">{campaign.click_rate}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'active' ? (
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Clock className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Pre-built templates for different stages of the user journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Welcome', 'Profile Reminder', 'Feature Highlight', 'Re-engagement'].map((template) => (
              <div
                key={template}
                className="p-4 border rounded-lg hover:border-primary cursor-pointer transition-colors"
              >
                <h4 className="font-medium mb-2">{template}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Standard template for {template.toLowerCase()}
                </p>
                <Button size="sm" variant="outline">Use Template</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
