import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

interface EmailTrigger {
  id: string;
  trigger_type: string;
  is_enabled: boolean;
  template_name: string;
  subject_template: string;
  html_template?: string;
  delay_minutes: number;
  name: string;
  description: string;
}

interface EmailTriggerSettingsModalProps {
  trigger: EmailTrigger | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTrigger: EmailTrigger) => void;
}

export const EmailTriggerSettingsModal: React.FC<EmailTriggerSettingsModalProps> = ({
  trigger,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    is_enabled: false,
    template_name: '',
    subject_template: '',
    html_template: '',
    delay_minutes: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (trigger) {
      setFormData({
        is_enabled: trigger.is_enabled,
        template_name: trigger.template_name || '',
        subject_template: trigger.subject_template || '',
        html_template: trigger.html_template || '',
        delay_minutes: trigger.delay_minutes || 0,
      });
    }
  }, [trigger]);

  const handleSave = async () => {
    if (!trigger) return;

    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('email_automation_settings')
        .update({
          is_enabled: formData.is_enabled,
          template_name: formData.template_name,
          subject_template: formData.subject_template,
          html_template: formData.html_template,
          delay_minutes: formData.delay_minutes,
        })
        .eq('id', trigger.id);

      if (error) throw error;

      const updatedTrigger = {
        ...trigger,
        ...formData,
      };

      onSave(updatedTrigger);
      toast.success('Email trigger settings updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating trigger settings:', error);
      toast.error('Failed to update email trigger settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!trigger) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Settings for {trigger.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled">Enable Trigger</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send emails for this event
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.is_enabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_enabled: checked }))
              }
            />
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name</Label>
            <Input
              id="template_name"
              value={formData.template_name}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, template_name: e.target.value }))
              }
              placeholder="e.g., welcome_email_v1"
            />
            <p className="text-sm text-muted-foreground">
              Internal template identifier
            </p>
          </div>

          {/* Subject Template */}
          <div className="space-y-2">
            <Label htmlFor="subject_template">Email Subject</Label>
            <Input
              id="subject_template"
              value={formData.subject_template}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, subject_template: e.target.value }))
              }
              placeholder="e.g., Welcome to TalentXcel, {{name}}!"
            />
            <p className="text-sm text-muted-foreground">
              Use {'{{name}}'}, {'{{company}}'}, etc. for dynamic content
            </p>
          </div>

          {/* Delay */}
          <div className="space-y-2">
            <Label htmlFor="delay_minutes">Delay (Minutes)</Label>
            <Input
              id="delay_minutes"
              type="number"
              min="0"
              max="1440"
              value={formData.delay_minutes}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, delay_minutes: parseInt(e.target.value) || 0 }))
              }
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">
              Delay before sending email (0 = immediate)
            </p>
          </div>

          {/* HTML Template */}
          <div className="space-y-2">
            <Label htmlFor="html_template">Email Template (HTML)</Label>
            <Textarea
              id="html_template"
              value={formData.html_template}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, html_template: e.target.value }))
              }
              placeholder="HTML email template with {{variables}}"
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Use HTML with inline CSS for styling. Variables: {'{{name}}'}, {'{{company}}'}, {'{{job_title}}'}, etc.
            </p>
          </div>

          {/* Description */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Available Variables</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><code>{'{{name}}'}</code> - Recipient's name</p>
              <p><code>{'{{email}}'}</code> - Recipient's email</p>
              <p><code>{'{{company_name}}'}</code> - Company name</p>
              <p><code>{'{{job_title}}'}</code> - Job title</p>
              <p><code>{'{{requester_name}}'}</code> - Person making request</p>
              <p><code>{'{{salary_range}}'}</code> - Salary information</p>
              <p><code>{'{{location}}'}</code> - Job/Company location</p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Trigger Description</h4>
            <p className="text-sm text-muted-foreground">
              {trigger.description}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};