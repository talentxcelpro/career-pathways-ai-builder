import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
}

export const TemplateDialog = ({ open, onOpenChange, template }: TemplateDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    template_name: '',
    subject: '',
    html_content: '',
    text_content: '',
    is_active: true,
  });

  useEffect(() => {
    if (template) {
      setFormData({
        template_name: template.template_name || '',
        subject: template.subject || '',
        html_content: template.html_content || '',
        text_content: template.text_content || '',
        is_active: template.is_active ?? true,
      });
    } else {
      setFormData({
        template_name: '',
        subject: '',
        html_content: '',
        text_content: '',
        is_active: true,
      });
    }
  }, [template, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (template) {
        const { error } = await supabase
          .from('email_templates_v2')
          .update({
            ...data,
            current_version: (template.current_version || 1) + 1,
          })
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates_v2')
          .insert({
            ...data,
            current_version: 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: template ? 'Template updated' : 'Template created',
        description: `Email template ${template ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create New Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name *</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                placeholder="e.g., Welcome Email Template"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Welcome to TalentXcel!"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active Template</Label>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML Content</TabsTrigger>
              <TabsTrigger value="text">Text Content</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="space-y-2">
              <Label htmlFor="html_content">HTML Template *</Label>
              <Textarea
                id="html_content"
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="Enter HTML email content with variables like {{name}}, {{link}}"
                className="min-h-[300px] font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Use variables: {'{{name}}'}, {'{{email}}'}, {'{{link}}'}, {'{{company}}'}, etc.
              </p>
            </TabsContent>
            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="text_content">Plain Text Alternative</Label>
              <Textarea
                id="text_content"
                value={formData.text_content}
                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                placeholder="Plain text version of the email"
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Plain text fallback for email clients that don't support HTML
              </p>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
