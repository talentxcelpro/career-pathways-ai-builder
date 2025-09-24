import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, FileText, TrendingUp, Settings, Play, Pause, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentTemplate {
  id: string;
  name: string;
  type: 'job-page' | 'company-page' | 'location-page' | 'skill-page' | 'course-page';
  template: string;
  variables: string[];
  seoOptimized: boolean;
}

interface GenerationJob {
  id: string;
  templateId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalPages: number;
  generatedPages: number;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export const AIContentScaler = () => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [batchSize, setBatchSize] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'job-page' as const,
    template: '',
    variables: ''
  });

  useEffect(() => {
    loadTemplates();
    loadGenerationJobs();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_content_library')
        .select('*')
        .eq('template_type', 'page_template')
        .eq('is_approved', true);

      if (error) throw error;

      const formattedTemplates: ContentTemplate[] = data?.map(item => ({
        id: item.id,
        name: item.title,
        type: item.category as any,
        template: item.content,
        variables: item.metadata?.variables || [],
        seoOptimized: item.metadata?.seo_optimized || false
      })) || [];

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Load default templates
      setTemplates(getDefaultTemplates());
    }
  };

  const loadGenerationJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_operation_queue')
        .select('*')
        .eq('operation_type', 'content_scaling')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedJobs: GenerationJob[] = data?.map(item => ({
        id: item.id,
        templateId: item.input_data?.template_id || '',
        status: item.status as any,
        progress: ((item.output_data?.generated_pages || 0) / (item.input_data?.total_pages || 1)) * 100,
        totalPages: item.input_data?.total_pages || 0,
        generatedPages: item.output_data?.generated_pages || 0,
        startedAt: new Date(item.created_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
        errorMessage: item.error_message
      })) || [];

      setGenerationJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading generation jobs:', error);
    }
  };

  const getDefaultTemplates = (): ContentTemplate[] => [
    {
      id: '1',
      name: 'Job Page Template',
      type: 'job-page',
      template: `<h1>{{job_title}} Jobs in {{location}}</h1>
<p>Find the best {{job_title}} opportunities in {{location}}. Browse {{job_count}} available positions from top companies.</p>
<h2>{{job_title}} Job Requirements</h2>
<ul>
  <li>{{requirement_1}}</li>
  <li>{{requirement_2}}</li>
  <li>{{requirement_3}}</li>
</ul>
<h2>Average {{job_title}} Salary in {{location}}</h2>
<p>The average salary for {{job_title}} in {{location}} is {{average_salary}}.</p>`,
      variables: ['job_title', 'location', 'job_count', 'requirement_1', 'requirement_2', 'requirement_3', 'average_salary'],
      seoOptimized: true
    },
    {
      id: '2',
      name: 'Company Location Page',
      type: 'company-page',
      template: `<h1>{{company_name}} Jobs in {{location}}</h1>
<p>Explore career opportunities at {{company_name}} in {{location}}. Join {{employee_count}} professionals building the future.</p>
<h2>About {{company_name}} {{location}} Office</h2>
<p>{{company_description}}</p>
<h2>Open Positions at {{company_name}} {{location}}</h2>
<p>{{company_name}} is currently hiring for {{open_positions}} positions in {{location}}.</p>`,
      variables: ['company_name', 'location', 'employee_count', 'company_description', 'open_positions'],
      seoOptimized: true
    }
  ];

  const startBatchGeneration = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          template_id: selectedTemplate,
          batch_size: batchSize,
          operation_type: 'bulk_generation'
        }
      });

      if (error) throw error;

      toast.success(`Started generating ${batchSize} pages`);
      loadGenerationJobs(); // Refresh the jobs list
    } catch (error) {
      console.error('Error starting batch generation:', error);
      toast.error('Failed to start batch generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.template) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_content_library')
        .insert({
          title: newTemplate.name,
          content: newTemplate.template,
          category: newTemplate.type,
          template_type: 'page_template',
          metadata: {
            variables: newTemplate.variables.split(',').map(v => v.trim()).filter(Boolean),
            seo_optimized: true
          },
          is_approved: true
        });

      if (error) throw error;

      toast.success('Template saved successfully');
      setNewTemplate({ name: '', type: 'job-page', template: '', variables: '' });
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Content Scaling Engine
          </CardTitle>
          <CardDescription>
            Generate thousands of SEO-optimized pages automatically using AI templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Templates</p>
                    <p className="text-2xl font-bold">{templates.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">
                      {generationJobs.filter(j => j.status === 'running').length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pages Generated</p>
                    <p className="text-2xl font-bold">
                      {generationJobs.reduce((acc, job) => acc + job.generatedPages, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {Math.round((generationJobs.filter(j => j.status === 'completed').length / Math.max(generationJobs.length, 1)) * 100)}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Start Batch Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="">Select Template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>

                <Input
                  type="number"
                  placeholder="Batch size"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  min="1"
                  max="10000"
                />

                <Button 
                  onClick={startBatchGeneration} 
                  disabled={isGenerating || !selectedTemplate}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Generation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Generation Jobs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generation Jobs</h3>
            <div className="space-y-3">
              {generationJobs.map(job => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        <span className="text-sm font-medium">
                          {templates.find(t => t.id === job.templateId)?.name || 'Unknown Template'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {job.generatedPages} / {job.totalPages} pages
                      </div>
                    </div>
                    
                    {job.status === 'running' && (
                      <div className="space-y-2">
                        <Progress value={job.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {job.progress.toFixed(1)}% complete
                        </div>
                      </div>
                    )}
                    
                    {job.errorMessage && (
                      <div className="text-sm text-red-600 mt-2">
                        Error: {job.errorMessage}
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Started: {job.startedAt.toLocaleString()}</span>
                      {job.completedAt && (
                        <span>Completed: {job.completedAt.toLocaleString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Template Creation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
                <select
                  className="w-full p-2 border rounded-md"
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="job-page">Job Page</option>
                  <option value="company-page">Company Page</option>
                  <option value="location-page">Location Page</option>
                  <option value="skill-page">Skill Page</option>
                  <option value="course-page">Course Page</option>
                </select>
              </div>

              <Textarea
                placeholder="Template content (use {{variable_name}} for dynamic content)"
                value={newTemplate.template}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, template: e.target.value }))}
                rows={6}
              />

              <Input
                placeholder="Variables (comma separated, e.g., job_title, location, salary)"
                value={newTemplate.variables}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, variables: e.target.value }))}
              />

              <Button onClick={saveTemplate} disabled={!newTemplate.name || !newTemplate.template}>
                <Settings className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};