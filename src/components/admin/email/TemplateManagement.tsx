import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Eye, Copy, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateDialog } from './TemplateDialog';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { useToast } from '@/hooks/use-toast';
import { TEMPLATE_CATEGORIES } from '@/utils/emailTemplates';

export const TemplateManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates_v2')
        .select('*')
        .order('created_at', { ascending: true });
      
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
    const subject = template.subject_template || template.subject || '';
    const name = template.template_name || '';
    const key = template.template_key || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && template.is_active) ||
                         (filterStatus === 'inactive' && !template.is_active);
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const copyTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const copyKey = `${template.template_key || 'template'}_copy_${Date.now()}`;
      const { error } = await supabase.from('email_templates_v2').insert({
        template_key: copyKey,
        template_name: `${template.template_name} (Copy)`,
        category: template.category || 'candidate_career_os',
        subject_template: template.subject_template || template.subject,
        html_template: template.html_template || template.html_content,
        text_template: template.text_template || template.text_content,
        variables: template.variables || ['name'],
        is_active: false,
        version: 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({ title: 'Template copied', description: 'Template duplicate created successfully' });
    },
    onError: (err: any) => {
      toast({ title: 'Copy Failed', description: err.message, variant: 'destructive' });
    }
  });

  const getCategoryMeta = (catValue: string) => {
    return TEMPLATE_CATEGORIES.find(c => c.value === catValue) || {
      label: catValue || 'General',
      icon: '✉️'
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2 text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-sm font-medium">Loading templates catalog...</span>
      </div>
    );
  }

  return (
    <>
      <Card className="border-slate-800 bg-slate-950/60 shadow-xl">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-white">
                <span>Email Templates Catalog</span>
                <Badge className="bg-blue-600 text-white font-mono">
                  {filteredTemplates?.length || 0} active templates
                </Badge>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Apple-inspired, responsive email templates across Candidate Career OS, Social Network, Reels, Resume, Jobs, Recruiter OS, and Viral Referral.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()} 
                className="border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={() => { setSelectedTemplate(null); setDialogOpen(true); }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Template
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by template name, key, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 text-xs h-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[200px] bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="all">All Categories ({templates?.length || 0})</SelectItem>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-xs">
                      <span className="mr-2">{cat.icon}</span>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px] bg-slate-900 border-slate-800 text-white text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates?.map((template) => {
              const catMeta = getCategoryMeta(template.category);
              const subject = template.subject_template || template.subject || 'Notification from TalentXcel';
              const version = template.version || template.current_version || 1;

              return (
                <Card 
                  key={template.id} 
                  className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px] font-medium bg-slate-950/60 px-2 py-0.5">
                        <span className="mr-1">{catMeta.icon}</span>
                        {catMeta.label}
                      </Badge>
                      <Badge 
                        variant={template.is_active ? 'default' : 'secondary'}
                        className={`text-[10px] font-semibold px-2 py-0.5 ${
                          template.is_active ? 'bg-emerald-600/80 text-emerald-100 hover:bg-emerald-600' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {template.template_name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
                      {subject}
                    </p>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                      <span>Key: <strong className="text-slate-300">{template.template_key}</strong></span>
                      <span>v{version}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs h-8 px-2"
                        onClick={() => { setSelectedTemplate(template); setPreviewOpen(true); }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-8 px-2"
                        onClick={() => { setSelectedTemplate(template); setDialogOpen(true); }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-8 px-2"
                        onClick={() => copyTemplateMutation.mutate(template)}
                        disabled={copyTemplateMutation.isPending}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates?.length === 0 && (
            <div className="text-center py-16 bg-slate-900/40 rounded-xl border border-slate-800">
              <p className="text-slate-400 text-sm">No email templates match the current filter.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSearchTerm(''); setFilterCategory('all'); setFilterStatus('all'); }} 
                className="mt-3 border-slate-700 text-xs"
              >
                Clear Filters
              </Button>
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
