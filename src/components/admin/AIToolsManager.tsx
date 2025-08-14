import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Play, BarChart3, Edit, Plus, Trash2 } from 'lucide-react';

interface AITool {
  id: string;
  tool_name: string;
  tool_slug: string;
  description: string;
  category: string;
  is_enabled: boolean;
  is_premium: boolean;
  model_name: string;
  temperature: number;
  max_tokens: number;
  cost_per_request: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  prompt_template: string;
  system_message: string;
  admin_notes: string;
}

export function AIToolsManager() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAITools();
  }, []);

  const fetchAITools = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_tools_config')
        .select('*')
        .order('tool_name');

      if (error) throw error;
      setTools((data as any) || []);
    } catch (error) {
      console.error('Error fetching AI tools:', error);
      toast({
        title: "Error",
        description: "Failed to fetch AI tools",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleToolStatus = async (toolId: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_tools_config')
        .update({ is_enabled: isEnabled } as any)
        .eq('id', toolId as any);

      if (error) throw error;

      setTools(tools.map(tool => 
        tool.id === toolId ? { ...tool, is_enabled: isEnabled } : tool
      ));

      toast({
        title: "Success",
        description: `Tool ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error updating tool status:', error);
      toast({
        title: "Error",
        description: "Failed to update tool status",
        variant: "destructive",
      });
    }
  };

  const updateTool = async (tool: AITool) => {
    try {
      const { error } = await supabase
        .from('ai_tools_config')
        .update({
          tool_name: tool.tool_name,
          description: tool.description,
          category: tool.category,
          is_premium: tool.is_premium,
          model_name: tool.model_name,
          temperature: tool.temperature,
          max_tokens: tool.max_tokens,
          cost_per_request: tool.cost_per_request,
          rate_limit_per_hour: tool.rate_limit_per_hour,
          rate_limit_per_day: tool.rate_limit_per_day,
          prompt_template: tool.prompt_template,
          system_message: tool.system_message,
          admin_notes: tool.admin_notes,
        } as any)
        .eq('id', tool.id as any);

      if (error) throw error;

      setTools(tools.map(t => t.id === tool.id ? tool : t));
      setIsEditDialogOpen(false);
      setSelectedTool(null);

      toast({
        title: "Success",
        description: "Tool updated successfully",
      });
    } catch (error) {
      console.error('Error updating tool:', error);
      toast({
        title: "Error",
        description: "Failed to update tool",
        variant: "destructive",
      });
    }
  };

  const testTool = async (toolSlug: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          toolSlug,
          operationType: 'test',
          input: { message: 'This is a test request' },
          userId: (await supabase.auth.getUser()).data.user?.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Test Successful",
        description: `Tool ${toolSlug} is working correctly`,
      });
    } catch (error) {
      console.error('Error testing tool:', error);
      toast({
        title: "Test Failed",
        description: "Tool test failed",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading AI tools...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Tools Management</h2>
          <p className="text-muted-foreground">Configure and manage AI-powered tools</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Tool
        </Button>
      </div>

      <div className="grid gap-4">
        {tools.map((tool) => (
          <Card key={tool.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{tool.tool_name}</CardTitle>
                  <Badge className={getCategoryColor(tool.category)}>
                    {tool.category}
                  </Badge>
                  {tool.is_premium && (
                    <Badge variant="secondary">Premium</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tool.is_enabled}
                    onCheckedChange={(checked) => toggleToolStatus(tool.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testTool(tool.tool_slug)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Dialog open={isEditDialogOpen && selectedTool?.id === tool.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTool(tool)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit {tool.tool_name}</DialogTitle>
                        <DialogDescription>
                          Configure tool settings, prompts, and limitations
                        </DialogDescription>
                      </DialogHeader>
                      {selectedTool && (
                        <EditToolForm
                          tool={selectedTool}
                          onSave={updateTool}
                          onCancel={() => {
                            setIsEditDialogOpen(false);
                            setSelectedTool(null);
                          }}
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Model</Label>
                  <p>{tool.model_name}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Cost/Request</Label>
                  <p>${tool.cost_per_request?.toFixed(4) || '0.0000'}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Rate Limit</Label>
                  <p>{tool.rate_limit_per_hour}/hour</p>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Max Tokens</Label>
                  <p>{tool.max_tokens}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface EditToolFormProps {
  tool: AITool;
  onSave: (tool: AITool) => void;
  onCancel: () => void;
}

function EditToolForm({ tool, onSave, onCancel }: EditToolFormProps) {
  const [formData, setFormData] = useState<AITool>(tool);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai-config">AI Config</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tool_name">Tool Name</Label>
              <Input
                id="tool_name"
                value={formData.tool_name}
                onChange={(e) => setFormData({ ...formData, tool_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
              />
              <Label htmlFor="is_premium">Premium Tool</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-config" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model_name">Model Name</Label>
              <Input
                id="model_name"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <Input
                id="max_tokens"
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="cost_per_request">Cost per Request ($)</Label>
              <Input
                id="cost_per_request"
                type="number"
                step="0.0001"
                value={formData.cost_per_request}
                onChange={(e) => setFormData({ ...formData, cost_per_request: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="rate_limit_per_hour">Rate Limit (per hour)</Label>
              <Input
                id="rate_limit_per_hour"
                type="number"
                value={formData.rate_limit_per_hour}
                onChange={(e) => setFormData({ ...formData, rate_limit_per_hour: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="rate_limit_per_day">Rate Limit (per day)</Label>
              <Input
                id="rate_limit_per_day"
                type="number"
                value={formData.rate_limit_per_day}
                onChange={(e) => setFormData({ ...formData, rate_limit_per_day: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <div>
            <Label htmlFor="system_message">System Message</Label>
            <Textarea
              id="system_message"
              rows={4}
              value={formData.system_message || ''}
              onChange={(e) => setFormData({ ...formData, system_message: e.target.value })}
              placeholder="System prompt that defines the AI's role and behavior..."
            />
          </div>
          <div>
            <Label htmlFor="prompt_template">Prompt Template</Label>
            <Textarea
              id="prompt_template"
              rows={6}
              value={formData.prompt_template || ''}
              onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
              placeholder="Use {variables} to inject user input into the prompt..."
            />
          </div>
          <div>
            <Label htmlFor="admin_notes">Admin Notes</Label>
            <Textarea
              id="admin_notes"
              rows={3}
              value={formData.admin_notes || ''}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              placeholder="Internal notes for administrators..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}