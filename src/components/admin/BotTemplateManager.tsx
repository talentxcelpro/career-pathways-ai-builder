import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Play, Download, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  useBotContentTemplates,
  useCreateBotTemplate,
  useUpdateBotTemplate,
  useDeleteBotTemplate,
  useBulkCreateTemplates,
  type BotContentTemplate
} from '@/hooks/useBotTemplateManagement';
import { useBots } from '@/hooks/useBotManagement';

export const BotTemplateManager: React.FC = () => {
  const { data: bots = [] } = useBots();
  const { data: templates = [] } = useBotContentTemplates();
  const createTemplate = useCreateBotTemplate();
  const updateTemplate = useUpdateBotTemplate();
  const deleteTemplate = useDeleteBotTemplate();
  const bulkCreateTemplates = useBulkCreateTemplates();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BotContentTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<BotContentTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    bot_id: '',
    template_name: '',
    prompt_template: '',
    category: '',
    content_type: 'post',
    seo_keywords: [] as string[],
    system_message: '',
    variables: {},
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      bot_id: '',
      template_name: '',
      prompt_template: '',
      category: '',
      content_type: 'post',
      seo_keywords: [],
      system_message: '',
      variables: {},
      is_active: true
    });
  };

  const handleCreateTemplate = () => {
    setIsEditing(false);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditTemplate = (template: BotContentTemplate) => {
    setIsEditing(true);
    setSelectedTemplate(template);
    setFormData({
      bot_id: template.bot_id,
      template_name: template.template_name,
      prompt_template: template.prompt_template,
      category: template.category,
      content_type: template.content_type,
      seo_keywords: template.seo_keywords || [],
      system_message: template.system_message || '',
      variables: template.variables || {},
      is_active: template.is_active
    });
    setIsDialogOpen(true);
  };

  const handlePreviewTemplate = (template: BotContentTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && selectedTemplate) {
        await updateTemplate.mutateAsync({ id: selectedTemplate.id, ...formData });
      } else {
        await createTemplate.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (template: BotContentTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.template_name}"?`)) {
      try {
        await deleteTemplate.mutateAsync(template.id);
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleBulkCreateTemplates = async () => {
    // Create 5 templates for each bot based on your specification
    const templatePrompts = [
      {
        title: "Support in 3 Steps",
        prompt: "Explain how to get support on TalentXcel in 3 clear steps.",
        category: "Customer Support",
        domain: "Support"
      },
      {
        title: "5 Ways to Stand Out Professionally",
        prompt: "Share 5 actionable ways professionals can stand out in their field.",
        category: "Professional Growth",
        domain: "Career Development"
      },
      {
        title: "Skills That Pay in 2025",
        prompt: "List and explain the most valuable skills for career growth in 2025.",
        category: "Upskilling",
        domain: "Skills Development"
      },
      {
        title: "How to Contribute in Our Network",
        prompt: "Guide users on how to actively contribute and engage in the TalentXcel community.",
        category: "Community",
        domain: "Networking"
      },
      {
        title: "What Makes a Great Resume?",
        prompt: "Share key elements that make a resume stand out to employers.",
        category: "Resume Tips",
        domain: "Career Support"
      }
    ];

    const allTemplates = [];
    
    for (const bot of bots.filter(b => b.is_active)) {
      for (const [index, template] of templatePrompts.entries()) {
        allTemplates.push({
          bot_id: bot.id,
          template_name: `${bot.name} - ${template.title}`,
          prompt_template: template.prompt,
          category: template.category,
          content_type: 'post',
          seo_keywords: [`${bot.name.toLowerCase()}`, `talentxcel`, template.category.toLowerCase()],
          system_message: `You are ${bot.name}, a ${bot.role} with a ${bot.tone_style} tone.`,
          variables: { domain: template.domain, tone: bot.tone_style },
          is_active: true
        });
      }
    }

    try {
      await bulkCreateTemplates.mutateAsync(allTemplates);
    } catch (error) {
      console.error('Error bulk creating templates:', error);
    }
  };

  const activeBots = bots.filter(bot => bot.is_active);
  const templatesByBot = templates.reduce((acc, template) => {
    if (!acc[template.bot_id]) acc[template.bot_id] = [];
    acc[template.bot_id].push(template);
    return acc;
  }, {} as Record<string, BotContentTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Template Management</h2>
          <p className="text-muted-foreground">
            Manage AI bot content templates for automated generation
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleBulkCreateTemplates} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Create Default Templates
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {templates.filter(t => t.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBots.length}</div>
            <p className="text-xs text-muted-foreground">
              With templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Content Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(templates.map(t => t.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {templates.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Template uses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Templates by Bot */}
      <div className="space-y-6">
        {activeBots.map((bot) => {
          const botTemplates = templatesByBot[bot.id] || [];
          return (
            <Card key={bot.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      {bot.name} ({bot.role})
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {botTemplates.length} templates • {bot.tone_style} tone
                    </p>
                  </div>
                  <Badge variant={botTemplates.length >= 5 ? "default" : "secondary"}>
                    {botTemplates.length}/5 templates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {botTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{template.template_name}</h4>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTemplate(template)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.prompt_template}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.content_type}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Active template</span>
                        <Switch 
                          checked={template.is_active} 
                          onCheckedChange={(checked) => 
                            updateTemplate.mutate({ id: template.id, is_active: checked })
                          }
                        />
                      </div>
                    </div>
                  ))}
                  
                  {botTemplates.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No templates created for this bot yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bot_id">Bot</Label>
                <Select value={formData.bot_id} onValueChange={(value) => setFormData({ ...formData, bot_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        {bot.name} - {bot.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Customer Support"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                placeholder="e.g., Support in 3 Steps"
                required
              />
            </div>

            <div>
              <Label htmlFor="prompt_template">Prompt Template</Label>
              <Textarea
                id="prompt_template"
                value={formData.prompt_template}
                onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                placeholder="Detailed prompt for AI content generation..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Social Post</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="seo_page">SEO Page</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="system_message">System Message</Label>
                <Input
                  id="system_message"
                  value={formData.system_message}
                  onChange={(e) => setFormData({ ...formData, system_message: e.target.value })}
                  placeholder="Optional system message for AI"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="seo_keywords">SEO Keywords (comma-separated)</Label>
              <Input
                id="seo_keywords"
                value={formData.seo_keywords.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  seo_keywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="talentxcel support, help guide"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active Template</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
                {isEditing ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{previewTemplate.template_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {bots.find(b => b.id === previewTemplate.bot_id)?.name} • {previewTemplate.category}
                </p>
              </div>
              
              <div>
                <Label>Prompt Template</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                  {previewTemplate.prompt_template}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Content Type</Label>
                  <p className="text-sm">{previewTemplate.content_type}</p>
                </div>
                <div>
                  <Label>System Message</Label>
                  <p className="text-sm">{previewTemplate.system_message || 'None'}</p>
                </div>
              </div>
              
              <div>
                <Label>SEO Keywords</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {previewTemplate.seo_keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};