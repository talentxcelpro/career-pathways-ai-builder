import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignDialog = ({ open, onOpenChange }: CampaignDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [sendImmediately, setSendImmediately] = useState(true);
  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_type: 'broadcast',
    module_name: '',
    template_id: '',
    target_audience: 'all_users',
  });

  const { data: templates } = useQuery({
    queryKey: ['email-templates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates_v2')
        .select('id, template_name')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof formData & { scheduled_at?: string }) => {
      const { data: campaignData, error } = await supabase.from('email_campaigns').insert({
        ...data,
        status: scheduledDate ? 'scheduled' : 'draft',
        total_recipients: 0,
        emails_sent: 0,
        emails_delivered: 0,
        emails_opened: 0,
        emails_clicked: 0,
      }).select().single();
      
      if (error) throw error;
      return campaignData;
    },
    onSuccess: async (campaignData) => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
      
      // If send immediately is checked, trigger the campaign
      if (sendImmediately && !scheduledDate) {
        try {
          const { data, error } = await supabase.functions.invoke('send-campaign', {
            body: { campaign_id: campaignData.id }
          });
          
          if (error) throw error;
          
          toast({
            title: 'Campaign launched!',
            description: `${data.queued} emails queued successfully`,
          });
        } catch (error: any) {
          toast({
            title: 'Campaign created but sending failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Campaign created',
          description: scheduledDate ? 'Campaign scheduled successfully' : 'Campaign saved as draft',
        });
      }
      
      onOpenChange(false);
      setFormData({
        campaign_name: '',
        campaign_type: 'broadcast',
        module_name: '',
        template_id: '',
        target_audience: 'all_users',
      });
      setScheduledDate(undefined);
      setSendImmediately(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create campaign',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaignMutation.mutate({
      ...formData,
      scheduled_at: scheduledDate?.toISOString(),
    });
  };

  const modules = [
    'Authentication', 'Profile', 'Resume Builder', 'Job Search', 'AI Career Coach',
    'Learning', 'Networking', 'Collaboration', 'Analytics', 'Company Portal',
    'Content', 'Gamification', 'System'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign_name">Campaign Name *</Label>
            <Input
              id="campaign_name"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              placeholder="e.g., Spring 2024 Job Alerts"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_type">Campaign Type *</Label>
              <Select
                value={formData.campaign_type}
                onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                  <SelectItem value="triggered">Triggered</SelectItem>
                  <SelectItem value="drip">Drip Campaign</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="module_name">Module</Label>
              <Select
                value={formData.module_name}
                onValueChange={(value) => setFormData({ ...formData, module_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_id">Email Template *</Label>
              <Select
                value={formData.template_id}
                onValueChange={(value) => setFormData({ ...formData, template_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience *</Label>
              <Select
                value={formData.target_audience}
                onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="job_seekers">Job Seekers</SelectItem>
                  <SelectItem value="employers">Employers</SelectItem>
                  <SelectItem value="active_users">Active Users</SelectItem>
                  <SelectItem value="inactive_users">Inactive Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-accent/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Immediately
                </Label>
                <p className="text-sm text-muted-foreground">
                  Launch campaign right away and send emails to all recipients
                </p>
              </div>
              <Switch
                checked={sendImmediately && !scheduledDate}
                onCheckedChange={setSendImmediately}
                disabled={!!scheduledDate}
              />
            </div>

            <div className="space-y-2">
              <Label>Or Schedule for Later</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                    onClick={() => {
                      if (scheduledDate) {
                        setScheduledDate(undefined);
                        setSendImmediately(true);
                      }
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP p') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      setScheduledDate(date);
                      if (date) setSendImmediately(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCampaignMutation.isPending}>
              {createCampaignMutation.isPending 
                ? 'Processing...' 
                : sendImmediately && !scheduledDate 
                  ? 'Create & Send Now' 
                  : scheduledDate 
                    ? 'Schedule Campaign' 
                    : 'Save as Draft'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
