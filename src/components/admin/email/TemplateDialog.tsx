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
    template_key: '',
    template_name: '',
    subject: '',
    html_content: '',
    text_content: '',
    is_active: true,
    category: 'candidate_career_os',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        template_key: template.template_key || '',
        template_name: template.template_name || '',
        subject: template.subject_template || template.subject || '',
        html_content: template.html_template || template.html_content || '',
        text_content: template.text_template || template.text_content || '',
        is_active: template.is_active ?? true,
        category: template.category || 'candidate_career_os',
      });
    } else {
      setFormData({
        template_key: '',
        template_name: '',
        subject: '',
        html_content: '',
        text_content: '',
        is_active: true,
        category: 'candidate_career_os',
      });
    }
    setShowPreview(false);
  }, [template, open]);

  // Generate preview with sample data
  useEffect(() => {
    if (showPreview && formData.html_content) {
      const sampleData = {
        name: 'Aditi Sharma',
        username: 'Aditi Sharma',
        email: 'aditi@example.com',
        first_name: 'Aditi',
        last_name: 'Sharma',
        company: 'TalentXcel Partner',
        job_title: 'Senior Software Engineer',
        link: 'https://talentxcel.in',
        title: formData.subject || 'Welcome to TalentXcel',
        description: 'Your career journey starts here',
        cta_text: 'Get Started',
        year: new Date().getFullYear().toString(),
        logo_url: 'https://talentxcel.in/assets/talentxcel-brand-logo.png',
        location: 'Bangalore, India',
        device: 'Chrome on Windows',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
      setPreviewHtml(renderTemplate(formData.html_content, sampleData));
    }
  }, [showPreview, formData.html_content, formData.subject]);

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
    }
  };

  const handleSelectBaseTemplate = (templateHtml: string, name: string) => {
    setFormData({
      ...formData,
      html_content: templateHtml,
      template_name: formData.template_name || name,
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const variables = extractVariables(data.html_content);
      const computedKey = data.template_key || data.template_name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      const payload = {
        template_key: computedKey,
        template_name: data.template_name,
        category: data.category,
        subject_template: data.subject,
        html_template: data.html_content,
        text_template: data.text_content,
        variables,
        is_active: data.is_active,
        version: (template?.version || 1) + 1,
        updated_at: new Date().toISOString()
      };

      if (template?.id) {
        const { error } = await supabase
          .from('email_templates_v2')
          .update(payload)
          .eq('id', template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates_v2')
          .insert(payload);
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
          <DialogTitle>{template ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                placeholder="e.g., Welcome Candidate"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Welcome to TalentXcel. Your next career chapter starts here."
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Email Content</Label>
              <div className="flex gap-2">
                <TemplateBaseSelector onSelectTemplate={handleSelectBaseTemplate} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      Show Editor
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Live Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            <VariableInsertHelper onInsert={handleInsertVariable} />

            {showPreview ? (
              <div className="border rounded-lg p-4 bg-muted/30">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[500px] border rounded bg-white"
                  title="Template Preview"
                />
              </div>
            ) : (
              <Tabs defaultValue="html" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="html">HTML Version</TabsTrigger>
                  <TabsTrigger value="text">Plain Text Version</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="space-y-2">
                  <Textarea
                    ref={htmlTextareaRef}
                    id="html_content"
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    placeholder="Enter full responsive HTML code here..."
                    className="font-mono text-xs min-h-[400px]"
                    required
                  />
                </TabsContent>
                <TabsContent value="text" className="space-y-2">
                  <Textarea
                    id="text_content"
                    value={formData.text_content}
                    onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                    placeholder="Enter fallback plain text version here..."
                    className="font-mono text-xs min-h-[400px]"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Set Template as Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-500">
                {saveMutation.isPending ? 'Saving...' : template ? 'Save Changes' : 'Create Template'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
