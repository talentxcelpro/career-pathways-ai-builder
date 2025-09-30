import React, { useState, useEffect, useRef } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Code } from 'lucide-react';
import { VariableInsertHelper } from './VariableInsertHelper';
import { TemplateBaseSelector } from './TemplateBaseSelector';
import { TEMPLATE_CATEGORIES, renderTemplate, extractVariables } from '@/utils/emailTemplates';

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
    category: 'notification',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        template_name: template.template_name || '',
        subject: template.subject || '',
        html_content: template.html_content || '',
        text_content: template.text_content || '',
        is_active: template.is_active ?? true,
        category: template.category || 'notification',
      });
    } else {
      setFormData({
        template_name: '',
        subject: '',
        html_content: '',
        text_content: '',
        is_active: true,
        category: 'notification',
      });
    }
    setShowPreview(false);
  }, [template, open]);

  // Generate preview with sample data
  useEffect(() => {
    if (showPreview && formData.html_content) {
      const sampleData = {
        username: 'John Doe',
        email: 'john@example.com',
        first_name: 'John',
        last_name: 'Doe',
        company: 'TechCorp Inc.',
        job_title: 'Senior Software Engineer',
        link: 'https://talentxcel.in',
        title: 'Welcome to TalentXcel',
        description: 'Your career journey starts here',
        cta_text: 'Get Started',
        year: new Date().getFullYear().toString(),
      };
      setPreviewHtml(renderTemplate(formData.html_content, sampleData));
    }
  }, [showPreview, formData.html_content]);

  const handleInsertVariable = (variable: string) => {
    if (htmlTextareaRef.current) {
      const start = htmlTextareaRef.current.selectionStart;
      const end = htmlTextareaRef.current.selectionEnd;
      const text = formData.html_content;
      const newText = text.substring(0, start) + variable + text.substring(end);
      setFormData({ ...formData, html_content: newText });
      
      // Restore cursor position
      setTimeout(() => {
        if (htmlTextareaRef.current) {
          htmlTextareaRef.current.focus();
          htmlTextareaRef.current.setSelectionRange(start + variable.length, start + variable.length);
        }
      }, 0);
    } else {
      setFormData({ ...formData, html_content: formData.html_content + variable });
    }
  };

  const handleSelectBaseTemplate = (template: string, name: string) => {
    setFormData({
      ...formData,
      html_content: template,
      template_name: formData.template_name || name,
    });
  };

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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create New Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!template && (
            <TemplateBaseSelector
              onSelect={handleSelectBaseTemplate}
              selectedTemplate={formData.html_content}
            />
          )}

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
                placeholder="e.g., Welcome to TalentXcel! {{username}}"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="mr-2">{cat.icon}</span>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active Template</Label>
            </div>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="html">
                <Code className="h-4 w-4 mr-2" />
                HTML Content
              </TabsTrigger>
              <TabsTrigger value="preview" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Live Preview
              </TabsTrigger>
              <TabsTrigger value="text">Text Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="html_content">HTML Template *</Label>
                <VariableInsertHelper onInsert={handleInsertVariable} />
              </div>
              <Textarea
                ref={htmlTextareaRef}
                id="html_content"
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="Enter HTML email content with variables like {{username}}, {{link}}"
                className="min-h-[400px] font-mono text-sm"
                required
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Variables found: {extractVariables(formData.html_content).join(', ') || 'None'}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-2">
              <div className="border rounded-lg bg-background">
                <div className="bg-muted px-4 py-2 rounded-t-lg">
                  <p className="text-sm font-medium">Email Preview (with sample data)</p>
                </div>
                <div className="p-4">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full min-h-[500px] border rounded-md"
                      title="Template Preview"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                      Add HTML content to see preview
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="text_content">Plain Text Alternative</Label>
              <Textarea
                id="text_content"
                value={formData.text_content}
                onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                placeholder="Plain text version of the email (auto-generated from HTML if left empty)"
                className="min-h-[400px] font-mono text-sm"
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
