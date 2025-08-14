import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Edit, Plus, Eye, Trash2 } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  template_type: string;
  subject: string;
  content: string;
  html_template?: string;
  is_active: boolean;
}

export const EmailTemplateManager = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    template_type: 'notification',
    subject: '',
    content: '',
    html_template: '',
    is_active: true
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, template_type, subject, content, html_template, is_active')
        .order('template_type', { ascending: true });

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('email_templates')
          .update(formData as any)
          .eq('id', selectedTemplate.id as any);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('email_templates')
          .insert([{
            name: formData.name,
            template_type: formData.template_type,
            subject: formData.subject,
            content: formData.content,
            html_template: formData.html_template,
            is_active: formData.is_active
          } as any]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Template created successfully"
        });
      }

      setIsEditing(false);
      setSelectedTemplate(null);
      fetchTemplates();
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully"
      });

      fetchTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsEditing(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      template_type: 'notification',
      subject: '',
      content: '',
      html_template: '',
      is_active: true
    });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      subject: template.subject,
      content: template.content,
      html_template: template.html_template || '',
      is_active: template.is_active
    });
    setIsEditing(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    resetForm();
    setIsEditing(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'notification': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'recommendation': return 'bg-green-100 text-green-800';
      case 'summary': return 'bg-purple-100 text-purple-800';
      case 'base': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Template Manager</h3>
          <p className="text-sm text-muted-foreground">
            Manage HTML email templates with dynamic placeholders
          </p>
        </div>
        <Button onClick={handleNewTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Templates ({templates.length})
            </CardTitle>
            <CardDescription>
              Select a template to view or edit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedTemplate?.id === template.id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{template.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(template.template_type)}>
                        {template.template_type}
                      </Badge>
                      {!template.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {template.subject}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {template.name !== 'base_template' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(template.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? (selectedTemplate ? 'Edit Template' : 'New Template') : 'Template Preview'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., welcome_email"
                  />
                </div>

                <div>
                  <Label htmlFor="template_type">Template Type</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="base">Base Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject Template</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Welcome to {{company_name}}, {{candidate_name}}!"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Simple Content (Optional)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Simple text content"
                    rows={3}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="html_template">Full HTML Template</Label>
                  <Textarea
                    id="html_template"
                    value={formData.html_template}
                    onChange={(e) => setFormData({ ...formData, html_template: e.target.value })}
                    placeholder="Full HTML content with {{placeholders}} - including <!DOCTYPE html>, <html>, <head>, etc."
                    rows={20}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{"}{"{"} candidate_name {"}"} {"}"} for dynamic values. This field supports full HTML email templates.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    Save Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <p className="text-sm">{selectedTemplate.name}</p>
                </div>

                <div>
                  <Label>Subject Template</Label>
                  <p className="text-sm">{selectedTemplate.subject}</p>
                </div>

                <div>
                  <Label>Template Type</Label>
                  <Badge className={getTypeColor(selectedTemplate.template_type)}>
                    {selectedTemplate.template_type}
                  </Badge>
                </div>

                <div>
                  <Label>HTML Template Preview</Label>
                  <div className="bg-muted p-2 rounded text-xs font-mono max-h-40 overflow-y-auto">
                    {(selectedTemplate.html_template || selectedTemplate.content).substring(0, 1000)}
                    {(selectedTemplate.html_template || selectedTemplate.content).length > 1000 ? '...' : ''}
                  </div>
                  {selectedTemplate.html_template && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Rich HTML template with {selectedTemplate.html_template.length} characters
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleEditTemplate(selectedTemplate)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Template
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a template to view details or create a new one
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};