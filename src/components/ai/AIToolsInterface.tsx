import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import { Zap, FileText, Users, Briefcase, MessageSquare, Target, BarChart3, Map, Star, Send, Loader2 } from 'lucide-react';

interface AITool {
  id: string;
  tool_name: string;
  tool_slug: string;
  description: string;
  category: string;
  is_enabled: boolean;
  is_premium: boolean;
}

interface ToolResult {
  result: string;
  model: string;
  tokensUsed: number;
  timestamp: string;
}

const TOOL_ICONS = {
  'resume-tailor': FileText,
  'cover-letter': FileText,
  'career-pathfinder': Map,
  'job-match': Briefcase,
  'interview-qa': MessageSquare,
  'career-swot': Target,
  'skills-gap': BarChart3,
  'roadmap': Map,
  'resume-score': Star,
  'outreach': Send,
} as const;

export function AIToolsInterface() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [input, setInput] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ToolResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAITools();
  }, []);

  const fetchAITools = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_tools_config')
        .select('*')
        .eq('is_enabled', true)
        .order('tool_name');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching AI tools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI tools",
        variant: "destructive",
      });
    }
  };

  const executeTool = async () => {
    if (!selectedTool) return;

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const response = await supabase.functions.invoke('ai-gateway', {
        body: {
          toolSlug: selectedTool.tool_slug,
          operationType: 'process',
          input,
          userId: user.data.user?.id,
        },
      });

      if (response.data && response.data.success) {
        setResult(response.data.data);
        toast({
          title: "Success",
          description: `${selectedTool.tool_name} completed successfully`,
        });
      } else {
        throw new Error(response.data?.error || response.error?.message || 'Tool execution failed');
      }
    } catch (error) {
      console.error('Error executing tool:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Tool execution failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getToolIcon = (toolSlug: string) => {
    const IconComponent = TOOL_ICONS[toolSlug as keyof typeof TOOL_ICONS] || Zap;
    return <IconComponent className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'resume': 'bg-primary/10 text-primary',
      'career': 'bg-secondary/10 text-secondary',
      'job': 'bg-accent/10 text-accent',
      'network': 'bg-muted/10 text-muted-foreground',
      'interview': 'bg-destructive/10 text-destructive',
      'general': 'bg-neutral/10 text-neutral-foreground',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getInputFields = (toolSlug: string) => {
    const commonFields = {
      'resume-tailor': [
        { key: 'resume_text', label: 'Resume Content', type: 'textarea', placeholder: 'Paste your resume content here...' },
        { key: 'job_description', label: 'Job Description', type: 'textarea', placeholder: 'Paste the job description here...' },
        { key: 'target_role', label: 'Target Role', type: 'input', placeholder: 'e.g., Software Engineer' }
      ],
      'cover-letter': [
        { key: 'job_title', label: 'Job Title', type: 'input', placeholder: 'e.g., Product Manager' },
        { key: 'company_name', label: 'Company Name', type: 'input', placeholder: 'e.g., Tech Corp' },
        { key: 'job_description', label: 'Job Description', type: 'textarea', placeholder: 'Paste job description...' },
        { key: 'resume_summary', label: 'Resume Summary', type: 'textarea', placeholder: 'Brief summary of your experience...' }
      ],
      'career-pathfinder': [
        { key: 'current_role', label: 'Current Role', type: 'input', placeholder: 'e.g., Junior Developer' },
        { key: 'target_role', label: 'Target Role', type: 'input', placeholder: 'e.g., Senior Engineer' },
        { key: 'skills', label: 'Current Skills', type: 'textarea', placeholder: 'List your current skills...' },
        { key: 'interests', label: 'Career Interests', type: 'textarea', placeholder: 'What interests you in your career?' }
      ],
      'job-match': [
        { key: 'resume_content', label: 'Resume Content', type: 'textarea', placeholder: 'Paste your resume...' },
        { key: 'job_descriptions', label: 'Job Descriptions', type: 'textarea', placeholder: 'Paste job descriptions (one per line)...' }
      ],
      'interview-qa': [
        { key: 'job_title', label: 'Job Title', type: 'input', placeholder: 'e.g., Data Scientist' },
        { key: 'company_type', label: 'Company Type', type: 'input', placeholder: 'e.g., Tech Startup' },
        { key: 'experience_level', label: 'Experience Level', type: 'input', placeholder: 'e.g., 3-5 years' }
      ]
    };

    return commonFields[toolSlug as keyof typeof commonFields] || [
      { key: 'message', label: 'Input', type: 'textarea', placeholder: 'Enter your input...' }
    ];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Career Tools</h2>
        <p className="text-muted-foreground">Enhance your career with AI-powered tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card key={tool.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getToolIcon(tool.tool_slug)}
                  <CardTitle className="text-lg">{tool.tool_name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge className={getCategoryColor(tool.category)}>
                    {tool.category}
                  </Badge>
                  {tool.is_premium && (
                    <Badge variant="secondary">Premium</Badge>
                  )}
                </div>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDialogOpen && selectedTool?.id === tool.id} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedTool(tool);
                      setInput({});
                      setResult(null);
                    }}
                  >
                    Use Tool
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getToolIcon(tool.tool_slug)}
                      {tool.tool_name}
                    </DialogTitle>
                    <DialogDescription>{tool.description}</DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="input" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="input">Input</TabsTrigger>
                      <TabsTrigger value="result" disabled={!result}>Result</TabsTrigger>
                    </TabsList>

                    <TabsContent value="input" className="space-y-4">
                      <div className="space-y-4">
                        {getInputFields(tool.tool_slug).map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            {field.type === 'textarea' ? (
                              <Textarea
                                id={field.key}
                                placeholder={field.placeholder}
                                value={input[field.key] || ''}
                                onChange={(e) => setInput({ ...input, [field.key]: e.target.value })}
                                rows={4}
                              />
                            ) : (
                              <Input
                                id={field.key}
                                placeholder={field.placeholder}
                                value={input[field.key] || ''}
                                onChange={(e) => setInput({ ...input, [field.key]: e.target.value })}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={executeTool} disabled={loading}>
                          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Execute Tool
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="result" className="space-y-4">
                      {result && (
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Result</CardTitle>
                              <CardDescription>
                                Generated using {result.model} • {result.tokensUsed} tokens • {result.timestamp}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                                {result.result}
                              </div>
                            </CardContent>
                          </Card>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                              navigator.clipboard.writeText(result.result);
                              toast({ title: "Copied to clipboard" });
                            }}>
                              Copy Result
                            </Button>
                            <Button onClick={() => setIsDialogOpen(false)}>
                              Done
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No AI Tools Available</h3>
          <p className="text-muted-foreground">Contact your administrator to enable AI tools.</p>
        </div>
      )}
    </div>
  );
}