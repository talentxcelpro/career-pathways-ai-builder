import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Users, Send, Upload, Loader2, CheckCircle } from 'lucide-react';

interface BulkCampaign {
  name: string;
  template: string;
  recipients: string[];
  subject: string;
  status: 'draft' | 'sending' | 'completed' | 'failed';
  sent: number;
  total: number;
}

export const BulkEmailCampaign: React.FC = () => {
  const [campaign, setCampaign] = useState<BulkCampaign>({
    name: '',
    template: '',
    recipients: [],
    subject: '',
    status: 'draft',
    sent: 0,
    total: 0
  });
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const templates = [
    { value: 'welcome_email', label: 'Welcome Campaign' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'job_alert', label: 'Job Alert' },
    { value: 'platform_update', label: 'Platform Update' }
  ];

  const addEmails = () => {
    const emails = emailInput
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    setCampaign(prev => ({
      ...prev,
      recipients: [...new Set([...prev.recipients, ...emails])],
      total: [...new Set([...prev.recipients, ...emails])].length
    }));
    setEmailInput('');
    toast.success(`Added ${emails.length} email(s) to campaign`);
  };

  const removeEmail = (email: string) => {
    setCampaign(prev => ({
      ...prev,
      recipients: prev.recipients.filter(e => e !== email),
      total: prev.recipients.filter(e => e !== email).length
    }));
  };

  const sendCampaign = async () => {
    if (!campaign.name || !campaign.template || campaign.recipients.length === 0) {
      toast.error('Please fill in all required fields and add recipients');
      return;
    }

    setIsLoading(true);
    setCampaign(prev => ({ ...prev, status: 'sending' }));
    
    try {
      // Send emails in batches of 10
      const batchSize = 10;
      let sent = 0;

      for (let i = 0; i < campaign.recipients.length; i += batchSize) {
        const batch = campaign.recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(email => 
          supabase.functions.invoke('send-bulk-email-campaign', {
            body: {
              campaign_name: campaign.name,
              template_name: campaign.template,
              recipient_email: email,
              subject: campaign.subject,
              template_data: {
                recipient_name: email.split('@')[0],
                campaign_name: campaign.name
              }
            }
          })
        );

        await Promise.allSettled(batchPromises);
        sent += batch.length;
        
        const progressPercent = (sent / campaign.total) * 100;
        setProgress(progressPercent);
        setCampaign(prev => ({ ...prev, sent }));
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < campaign.recipients.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setCampaign(prev => ({ ...prev, status: 'completed' }));
      toast.success(`Campaign completed! Sent ${sent} emails successfully.`);
      
    } catch (error) {
      console.error('Campaign error:', error);
      setCampaign(prev => ({ ...prev, status: 'failed' }));
      toast.error('Campaign failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCampaign = () => {
    setCampaign({
      name: '',
      template: '',
      recipients: [],
      subject: '',
      status: 'draft',
      sent: 0,
      total: 0
    });
    setProgress(0);
    setEmailInput('');
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Bulk Email Campaign
        </CardTitle>
        <CardDescription>
          Create and send email campaigns to multiple recipients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="Summer Newsletter 2024"
              value={campaign.name}
              onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-template">Email Template</Label>
            <Select 
              value={campaign.template} 
              onValueChange={(value) => setCampaign(prev => ({ ...prev, template: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-subject">Subject Line</Label>
          <Input
            id="campaign-subject"
            placeholder="Weekly updates from TalentXcel"
            value={campaign.subject}
            onChange={(e) => setCampaign(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>

        {/* Recipients */}
        <div className="space-y-4">
          <Label>Recipients ({campaign.recipients.length})</Label>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter email addresses (comma or line separated)&#10;user1@example.com, user2@example.com&#10;user3@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="min-h-20"
            />
            <Button 
              onClick={addEmails}
              disabled={!emailInput.trim()}
              className="h-fit"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {campaign.recipients.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {campaign.recipients.map((email, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/10"
                  onClick={() => removeEmail(email)}
                >
                  {email} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        {campaign.status === 'sending' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sending Progress</span>
              <span>{campaign.sent}/{campaign.total}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Status */}
        {campaign.status !== 'draft' && (
          <div className="flex items-center gap-2">
            {campaign.status === 'sending' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending campaign...</span>
              </>
            )}
            {campaign.status === 'completed' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Campaign completed successfully!</span>
              </>
            )}
            {campaign.status === 'failed' && (
              <>
                <span className="text-red-500">Campaign failed</span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={sendCampaign}
            disabled={isLoading || campaign.recipients.length === 0 || !campaign.name || !campaign.template}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </>
            )}
          </Button>
          
          {campaign.status !== 'sending' && (
            <Button
              variant="outline"
              onClick={resetCampaign}
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};