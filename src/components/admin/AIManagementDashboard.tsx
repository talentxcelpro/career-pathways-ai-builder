import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Activity, 
  Brain, 
  Settings, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';

interface AIToolConfig {
  id: string;
  tool_slug: string;
  tool_name: string;
  category: string;
  description: string;
  is_enabled: boolean;
  model_name: string;
  system_message: string;
  prompt_template: string;
  temperature: number;
  max_tokens: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
}

interface AdminInput {
  id: string;
  title: string;
  input_type: string;
  content: any;
  category: string;
  tool_slug: string;
  priority: number;
  is_active: boolean;
}

interface AIFeatureStatus {
  id: string;
  module_name: string;
  feature_name: string;
  feature_key: string;
  enabled: boolean;
  last_checked: string;
  last_success: string;
  last_error: string;
  usage_count: number;
  success_count: number;
  error_count: number;
  average_response_time: number;
}

export const AIManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [aiTools, setAiTools] = useState<AIToolConfig[]>([]);
  const [adminInputs, setAdminInputs] = useState<AdminInput[]>([]);
  const [aiStatus, setAiStatus] = useState<AIFeatureStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<AIToolConfig | null>(null);
  const [editingInput, setEditingInput] = useState<AdminInput | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [toolsResult, inputsResult, statusResult] = await Promise.all([
        supabase.from('ai_tools_config').select('*').order('category', { ascending: true }),
        supabase.from('ai_admin_inputs').select('*').order('priority', { ascending: false }),
        supabase.from('ai_features_status').select('*').order('usage_count', { ascending: false })
      ]);

      if (toolsResult.error) throw toolsResult.error;
      if (inputsResult.error) throw inputsResult.error;
      if (statusResult.error) throw statusResult.error;

      setAiTools(toolsResult.data || []);
      setAdminInputs(inputsResult.data || []);
      setAiStatus(statusResult.data || []);
    } catch (error) {
      console.error('Failed to load AI management data:', error);
      toast.error('Failed to load AI management data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateToolConfig = async (tool: AIToolConfig) => {
    try {
      const { error } = await supabase
        .from('ai_tools_config')
        .update({
          tool_name: tool.tool_name,
          description: tool.description,
          is_enabled: tool.is_enabled,
          model_name: tool.model_name,
          system_message: tool.system_message,
          prompt_template: tool.prompt_template,
          temperature: tool.temperature,
          max_tokens: tool.max_tokens,
          rate_limit_per_hour: tool.rate_limit_per_hour,
          rate_limit_per_day: tool.rate_limit_per_day
        })
        .eq('id', tool.id);

      if (error) throw error;
      
      toast.success('AI tool updated successfully');
      setEditingTool(null);
      loadData();
    } catch (error) {
      console.error('Failed to update AI tool:', error);
      toast.error('Failed to update AI tool');
    }
  };

  const createAdminInput = async (input: Omit<AdminInput, 'id'>) => {
    try {
      const { error } = await supabase
        .from('ai_admin_inputs')
        .insert([input]);

      if (error) throw error;
      
      toast.success('Admin input created successfully');
      setEditingInput(null);
      loadData();
    } catch (error) {
      console.error('Failed to create admin input:', error);
      toast.error('Failed to create admin input');
    }
  };

  const updateAdminInput = async (input: AdminInput) => {
    try {
      const { error } = await supabase
        .from('ai_admin_inputs')
        .update({
          title: input.title,
          input_type: input.input_type,
          content: input.content,
          category: input.category,
          tool_slug: input.tool_slug,
          priority: input.priority,
          is_active: input.is_active
        })
        .eq('id', input.id);

      if (error) throw error;
      
      toast.success('Admin input updated successfully');
      setEditingInput(null);
      loadData();
    } catch (error) {
      console.error('Failed to update admin input:', error);
      toast.error('Failed to update admin input');
    }
  };

  const deleteAdminInput = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_admin_inputs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Admin input deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete admin input:', error);
      toast.error('Failed to delete admin input');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (status: AIFeatureStatus) => {
    const errorRate = status.usage_count > 0 ? (status.error_count / status.usage_count) * 100 : 0;
    
    if (!status.enabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    } else if (errorRate > 10) {
      return <Badge variant="destructive">High Error Rate</Badge>;
    } else if (status.last_error && new Date(status.last_error) > new Date(status.last_success || 0)) {
      return <Badge variant="destructive">Recent Error</Badge>;
    } else {
      return <Badge variant="default">Healthy</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Management Dashboard</h1>
          <p className="text-muted-foreground">
            Manage AI tools, configurations, and monitor performance
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="inputs">Admin Inputs</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AI Tools</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aiTools.length}</div>
                <p className="text-xs text-muted-foreground">
                  {aiTools.filter(t => t.is_enabled).length} enabled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Inputs</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminInputs.length}</div>
                <p className="text-xs text-muted-foreground">
                  {adminInputs.filter(i => i.is_active).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {aiStatus.reduce((sum, s) => sum + s.usage_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">AI requests processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(() => {
                    const totalUsage = aiStatus.reduce((sum, s) => sum + s.usage_count, 0);
                    const totalSuccess = aiStatus.reduce((sum, s) => sum + s.success_count, 0);
                    return totalUsage > 0 ? Math.round((totalSuccess / totalUsage) * 100) : 0;
                  })()}%
                </div>
                <p className="text-xs text-muted-foreground">Overall success rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Tools by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(
                    aiTools.reduce((acc, tool) => {
                      acc[tool.category] = (acc[tool.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([category, count]) => (
                    <div key={category} className="flex justify-between">
                      <span className="capitalize">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent AI Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiStatus.slice(0, 5).map((status) => (
                    <div key={status.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">{status.feature_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {status.usage_count} uses
                        </span>
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">AI Tools Configuration</h2>
          </div>

          <div className="grid gap-6">
            {aiTools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {tool.tool_name}
                        <Badge variant={tool.is_enabled ? "default" : "secondary"}>
                          {tool.is_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTool(tool)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <p className="capitalize">{tool.category}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Model</Label>
                      <p>{tool.model_name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Rate Limit (hourly)</Label>
                      <p>{tool.rate_limit_per_hour}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max Tokens</Label>
                      <p>{tool.max_tokens}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingTool && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Edit AI Tool: {editingTool.tool_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tool_name">Tool Name</Label>
                      <Input
                        id="tool_name"
                        value={editingTool.tool_name}
                        onChange={(e) => setEditingTool({...editingTool, tool_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="model_name">Model</Label>
                      <Select
                        value={editingTool.model_name}
                        onValueChange={(value) => setEditingTool({...editingTool, model_name: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingTool.description}
                      onChange={(e) => setEditingTool({...editingTool, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="system_message">System Message</Label>
                    <Textarea
                      id="system_message"
                      value={editingTool.system_message}
                      onChange={(e) => setEditingTool({...editingTool, system_message: e.target.value})}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={editingTool.temperature}
                        onChange={(e) => setEditingTool({...editingTool, temperature: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_tokens">Max Tokens</Label>
                      <Input
                        id="max_tokens"
                        type="number"
                        value={editingTool.max_tokens}
                        onChange={(e) => setEditingTool({...editingTool, max_tokens: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate_limit">Rate Limit (hourly)</Label>
                      <Input
                        id="rate_limit"
                        type="number"
                        value={editingTool.rate_limit_per_hour}
                        onChange={(e) => setEditingTool({...editingTool, rate_limit_per_hour: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_enabled"
                      checked={editingTool.is_enabled}
                      onCheckedChange={(checked) => setEditingTool({...editingTool, is_enabled: checked})}
                    />
                    <Label htmlFor="is_enabled">Enabled</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingTool(null)}>
                      Cancel
                    </Button>
                    <Button onClick={() => updateToolConfig(editingTool)}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inputs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Admin Inputs</h2>
            <Button onClick={() => setEditingInput({
              id: '',
              title: '',
              input_type: 'system_prompt',
              content: {},
              category: 'general',
              tool_slug: '',
              priority: 0,
              is_active: true
            })}>
              <Plus className="h-4 w-4 mr-1" />
              Add Input
            </Button>
          </div>

          <div className="grid gap-4">
            {adminInputs.map((input) => (
              <Card key={input.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {input.title}
                        <Badge variant={input.is_active ? "default" : "secondary"}>
                          {input.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{input.input_type}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Tool: {input.tool_slug} | Category: {input.category} | Priority: {input.priority}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingInput(input)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAdminInput(input.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {editingInput && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>
                    {editingInput.id ? 'Edit Admin Input' : 'Create Admin Input'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editingInput.title}
                      onChange={(e) => setEditingInput({...editingInput, title: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="input_type">Input Type</Label>
                      <Select
                        value={editingInput.input_type}
                        onValueChange={(value) => setEditingInput({...editingInput, input_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system_prompt">System Prompt</SelectItem>
                          <SelectItem value="optimization_template">Optimization Template</SelectItem>
                          <SelectItem value="section_template">Section Template</SelectItem>
                          <SelectItem value="matching_criteria">Matching Criteria</SelectItem>
                          <SelectItem value="recommendation_template">Recommendation Template</SelectItem>
                          <SelectItem value="analysis_template">Analysis Template</SelectItem>
                          <SelectItem value="question_template">Question Template</SelectItem>
                          <SelectItem value="letter_template">Letter Template</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={editingInput.category}
                        onValueChange={(value) => setEditingInput({...editingInput, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="resume">Resume</SelectItem>
                          <SelectItem value="jobs">Jobs</SelectItem>
                          <SelectItem value="career">Career</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="cover_letter">Cover Letter</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="salary">Salary</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tool_slug">Tool Slug</Label>
                      <Select
                        value={editingInput.tool_slug}
                        onValueChange={(value) => setEditingInput({...editingInput, tool_slug: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aiTools.map((tool) => (
                            <SelectItem key={tool.tool_slug} value={tool.tool_slug}>
                              {tool.tool_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Input
                        id="priority"
                        type="number"
                        value={editingInput.priority}
                        onChange={(e) => setEditingInput({...editingInput, priority: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Content (JSON)</Label>
                    <Textarea
                      id="content"
                      value={JSON.stringify(editingInput.content, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setEditingInput({...editingInput, content: parsed});
                        } catch (error) {
                          // Keep the text as is for continued editing
                        }
                      }}
                      rows={6}
                      placeholder='{"key": "value"}'
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={editingInput.is_active}
                      onCheckedChange={(checked) => setEditingInput({...editingInput, is_active: checked})}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingInput(null)}>
                      Cancel
                    </Button>
                    <Button onClick={() => 
                      editingInput.id ? updateAdminInput(editingInput) : createAdminInput(editingInput)
                    }>
                      {editingInput.id ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <h2 className="text-2xl font-bold">AI Features Monitoring</h2>
          
          <div className="grid gap-4">
            {aiStatus.map((status) => (
              <Card key={status.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {status.feature_name}
                        {getStatusBadge(status)}
                      </CardTitle>
                      <CardDescription>
                        Module: {status.module_name} | Key: {status.feature_key}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Last checked</p>
                      <p className="text-sm">
                        {new Date(status.last_checked).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Usage</Label>
                      <p className="text-lg font-semibold">{status.usage_count}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Success Rate</Label>
                      <p className="text-lg font-semibold">
                        {status.usage_count > 0 
                          ? Math.round((status.success_count / status.usage_count) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Errors</Label>
                      <p className="text-lg font-semibold text-red-600">{status.error_count}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Avg Response Time</Label>
                      <p className="text-lg font-semibold">
                        {status.average_response_time || 0}ms
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Enabled</Label>
                      <div className="flex items-center gap-2">
                        {status.enabled ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="text-sm">
                          {status.enabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {status.last_error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <Label className="text-xs text-red-600">Last Error:</Label>
                      <p className="text-sm text-red-800 mt-1">
                        {new Date(status.last_error).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
