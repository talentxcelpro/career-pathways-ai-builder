import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Eye, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateDialog } from './TemplateDialog';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { useToast } from '@/hooks/use-toast';

export const TemplateManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates_v2')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Real-time subscription for templates
  React.useEffect(() => {
    const channel = supabase
      .channel('email-templates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_templates_v2'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['email-templates'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.is_active) ||
                         (filterStatus === 'inactive' && !template.is_active);
    return matchesSearch && matchesStatus;
  });

  const copyTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const { error } = await supabase.from('email_templates_v2').insert({
        template_name: `${template.template_name} (Copy)`,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content,
        is_active: false,
        current_version: 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({ title: 'Template copied', description: 'Template copied successfully' });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading templates...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email Templates ({filteredTemplates?.length || 0})</span>
            <Button size="sm" onClick={() => { setSelectedTemplate(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates?.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-semibold text-sm">{template.template_name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{template.subject}</p>
                  </div>
                  <Badge variant={template.is_active ? 'default' : 'secondary'}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Version {template.current_version}</span>
                  <span>{new Date(template.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => { setSelectedTemplate(template); setPreviewOpen(true); }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => { setSelectedTemplate(template); setDialogOpen(true); }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyTemplateMutation.mutate(template)}
                    disabled={copyTemplateMutation.isPending}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No templates found
          </div>
        )}
      </CardContent>
    </Card>

    <TemplateDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      template={selectedTemplate}
    />
    
    <TemplatePreviewDialog
      open={previewOpen}
      onOpenChange={setPreviewOpen}
      template={selectedTemplate}
    />
    </>
  );
};
