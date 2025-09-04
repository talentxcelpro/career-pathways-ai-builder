import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCampaignCreated: () => void;
}

export function CreateCampaignDialog({ open, onOpenChange, onCampaignCreated }: CreateCampaignDialogProps) {
  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_type: '',
    target_count: '',
    budget: '',
    expected_completion: '',
    metadata: {
      description: '',
      keywords: [],
      target_domains: []
    }
  });

  const createCampaign = useMutation({
    mutationFn: async (data: any) => {
      const { data: campaign, error } = await supabase
        .from('backlink_campaigns')
        .insert([{
          campaign_name: data.campaign_name,
          campaign_type: data.campaign_type,
          target_count: parseInt(data.target_count) || 0,
          budget: parseFloat(data.budget) || 0,
          expected_completion: data.expected_completion || null,
          metadata: data.metadata,
          status: 'draft'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return campaign;
    },
    onSuccess: () => {
      toast.success('Campaign created successfully!');
      onCampaignCreated();
      setFormData({
        campaign_name: '',
        campaign_type: '',
        target_count: '',
        budget: '',
        expected_completion: '',
        metadata: {
          description: '',
          keywords: [],
          target_domains: []
        }
      });
    },
    onError: (error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.campaign_name || !formData.campaign_type) {
      toast.error('Please fill in required fields');
      return;
    }
    createCampaign.mutate(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMetadata = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaign_name">Campaign Name *</Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) => updateField('campaign_name', e.target.value)}
                  placeholder="University Outreach Campaign"
                  required
                />
              </div>

              <div>
                <Label htmlFor="campaign_type">Campaign Type *</Label>
                <Select value={formData.campaign_type} onValueChange={(value) => updateField('campaign_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest_post">Guest Post Outreach</SelectItem>
                    <SelectItem value="resource_page">Resource Page Inclusion</SelectItem>
                    <SelectItem value="broken_link">Broken Link Building</SelectItem>
                    <SelectItem value="university_outreach">University Outreach</SelectItem>
                    <SelectItem value="press_release">Press Release</SelectItem>
                    <SelectItem value="directory_listing">Directory Listing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_count">Target Count</Label>
                  <Input
                    id="target_count"
                    type="number"
                    value={formData.target_count}
                    onChange={(e) => updateField('target_count', e.target.value)}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => updateField('budget', e.target.value)}
                    placeholder="1000.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expected_completion">Expected Completion</Label>
                <Input
                  id="expected_completion"
                  type="date"
                  value={formData.expected_completion}
                  onChange={(e) => updateField('expected_completion', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.metadata.description}
                  onChange={(e) => updateMetadata('description', e.target.value)}
                  placeholder="Describe your campaign goals and strategy..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="keywords">Target Keywords (comma-separated)</Label>
                <Input
                  id="keywords"
                  value={formData.metadata.keywords.join(', ')}
                  onChange={(e) => updateMetadata('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                  placeholder="careers, jobs, recruitment, hiring"
                />
              </div>

              <div>
                <Label htmlFor="target_domains">Target Domains (comma-separated)</Label>
                <Input
                  id="target_domains"
                  value={formData.metadata.target_domains.join(', ')}
                  onChange={(e) => updateMetadata('target_domains', e.target.value.split(',').map(d => d.trim()).filter(Boolean))}
                  placeholder="university.edu, career-site.com"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCampaign.isPending}
            >
              {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}