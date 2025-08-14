import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Zap, 
  Database, 
  Clock, 
  Brain,
  AlertCircle,
  CheckCircle,
  Globe,
  Key,
  Monitor,
  Sliders
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIToolConfig {
  id: string;
  tool_name: string;
  tool_slug: string;
  description: string;
  is_enabled: boolean;
  is_premium: boolean;
  model_name: string;
  temperature: number;
  max_tokens: number;
  rate_limit_per_hour: number;
  rate_limit_per_day: number;
  cost_per_request: number;
  system_message: string;
  prompt_template: string;
}

export const AISettingsManager: React.FC = () => {
  const [toolConfigs, setToolConfigs] = useState<AIToolConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tools');
  const [globalSettings, setGlobalSettings] = useState({
    defaultModel: 'gpt-4o-mini',
    defaultTemperature: 0.7,
    defaultMaxTokens: 2000,
    rateLimitEnabled: true,
    securityEnabled: true,
    loggingEnabled: true,
    cacheEnabled: true,
    autoScaling: true,
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
    retryAttempts: 3
  });

  useEffect(() => {
    fetchToolConfigs();
  }, []);

  const fetchToolConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_tools_config')
        .select('*')
        .order('tool_name');

      if (error) throw error;
      setToolConfigs((data as any) || []);
    } catch (error) {
      console.error('Error fetching tool configs:', error);
      toast.error('Failed to load AI tool configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateToolConfig = async (toolId: string, updates: Partial<AIToolConfig>) => {
    try {
      const { error } = await supabase
        .from('ai_tools_config')
        .update(updates as any)
        .eq('id', toolId as any);

      if (error) throw error;

      setToolConfigs(prev => 
        prev.map(tool => 
          tool.id === toolId ? { ...tool, ...updates } : tool
        )
      );

      toast.success('Tool configuration updated successfully');
    } catch (error) {
      console.error('Error updating tool config:', error);
      toast.error('Failed to update tool configuration');
    }
  };

  const handleSaveGlobalSettings = async () => {
    try {
      // Save global settings to admin_tool_configs table
      const { error } = await supabase
        .from('admin_tool_configs')
        .upsert({
          tool_slug: 'global_ai_settings',
          ai_settings: globalSettings,
          status: 'active'
        } as any);

      if (error) throw error;
      toast.success('Global settings saved successfully');
    } catch (error) {
      console.error('Error saving global settings:', error);
      toast.error('Failed to save global settings');
    }
  };

  const availableModels = [
    'gpt-4o-mini',
    'gpt-4o',
    'gpt-4-turbo',
    'claude-3-haiku',
    'claude-3-sonnet',
    'gemini-pro'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Settings Manager</h2>
          <p className="text-muted-foreground">
            Configure AI models, rate limits, and system-wide settings
          </p>
        </div>
        <Button onClick={handleSaveGlobalSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save All Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Tool Configuration
              </CardTitle>
              <CardDescription>
                Configure individual AI tools, their models, and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {toolConfigs.map((tool) => (
                  <Card key={tool.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tool.tool_name}</CardTitle>
                        <Switch
                          checked={tool.is_enabled}
                          onCheckedChange={(checked) => 
                            handleUpdateToolConfig(tool.id, { is_enabled: checked })
                          }
                        />
                      </div>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`model-${tool.id}`}>Model</Label>
                          <Select
                            value={tool.model_name}
                            onValueChange={(value) => 
                              handleUpdateToolConfig(tool.id, { model_name: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableModels.map(model => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`temperature-${tool.id}`}>Temperature</Label>
                          <Input
                            id={`temperature-${tool.id}`}
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={tool.temperature}
                            onChange={(e) => 
                              handleUpdateToolConfig(tool.id, { temperature: parseFloat(e.target.value) })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`max-tokens-${tool.id}`}>Max Tokens</Label>
                          <Input
                            id={`max-tokens-${tool.id}`}
                            type="number"
                            min="1"
                            max="4000"
                            value={tool.max_tokens}
                            onChange={(e) => 
                              handleUpdateToolConfig(tool.id, { max_tokens: parseInt(e.target.value) })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`rate-hour-${tool.id}`}>Rate Limit (per hour)</Label>
                          <Input
                            id={`rate-hour-${tool.id}`}
                            type="number"
                            min="1"
                            value={tool.rate_limit_per_hour}
                            onChange={(e) => 
                              handleUpdateToolConfig(tool.id, { rate_limit_per_hour: parseInt(e.target.value) })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`rate-day-${tool.id}`}>Rate Limit (per day)</Label>
                          <Input
                            id={`rate-day-${tool.id}`}
                            type="number"
                            min="1"
                            value={tool.rate_limit_per_day}
                            onChange={(e) => 
                              handleUpdateToolConfig(tool.id, { rate_limit_per_day: parseInt(e.target.value) })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`cost-${tool.id}`}>Cost per Request ($)</Label>
                          <Input
                            id={`cost-${tool.id}`}
                            type="number"
                            step="0.0001"
                            min="0"
                            value={tool.cost_per_request}
                            onChange={(e) => 
                              handleUpdateToolConfig(tool.id, { cost_per_request: parseFloat(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor={`system-message-${tool.id}`}>System Message</Label>
                          <Textarea
                            id={`system-message-${tool.id}`}
                            rows={3}
                            value={tool.system_message}
                            onChange={(e) => 
                              handleUpdateToolConfig(tool.id, { system_message: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`prompt-template-${tool.id}`}>Prompt Template</Label>
                          <Textarea
                            id={`prompt-template-${tool.id}`}
                            rows={4}
                            value={tool.prompt_template}
                            onChange={(e) => 
                              handleUpdateToolConfig(tool.id, { prompt_template: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Model Configuration
              </CardTitle>
              <CardDescription>
                Configure default model settings and parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="default-model">Default Model</Label>
                  <Select
                    value={globalSettings.defaultModel}
                    onValueChange={(value) => 
                      setGlobalSettings(prev => ({ ...prev, defaultModel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="default-temperature">Default Temperature</Label>
                  <Input
                    id="default-temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={globalSettings.defaultTemperature}
                    onChange={(e) => 
                      setGlobalSettings(prev => ({ ...prev, defaultTemperature: parseFloat(e.target.value) }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="default-max-tokens">Default Max Tokens</Label>
                  <Input
                    id="default-max-tokens"
                    type="number"
                    min="1"
                    max="4000"
                    value={globalSettings.defaultMaxTokens}
                    onChange={(e) => 
                      setGlobalSettings(prev => ({ ...prev, defaultMaxTokens: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="request-timeout">Request Timeout (ms)</Label>
                  <Input
                    id="request-timeout"
                    type="number"
                    min="1000"
                    max="120000"
                    value={globalSettings.requestTimeout}
                    onChange={(e) => 
                      setGlobalSettings(prev => ({ ...prev, requestTimeout: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="rate-limit-enabled">Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable rate limiting for AI requests
                    </p>
                  </div>
                  <Switch
                    id="rate-limit-enabled"
                    checked={globalSettings.rateLimitEnabled}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, rateLimitEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="security-enabled">Security Scanning</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable security scanning for AI requests
                    </p>
                  </div>
                  <Switch
                    id="security-enabled"
                    checked={globalSettings.securityEnabled}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, securityEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="logging-enabled">Request Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable logging of all AI requests
                    </p>
                  </div>
                  <Switch
                    id="logging-enabled"
                    checked={globalSettings.loggingEnabled}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, loggingEnabled: checked }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="retry-attempts">Retry Attempts</Label>
                  <Input
                    id="retry-attempts"
                    type="number"
                    min="0"
                    max="10"
                    value={globalSettings.retryAttempts}
                    onChange={(e) => 
                      setGlobalSettings(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Settings
              </CardTitle>
              <CardDescription>
                Configure performance optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cache-enabled">Response Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable caching for AI responses
                    </p>
                  </div>
                  <Switch
                    id="cache-enabled"
                    checked={globalSettings.cacheEnabled}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, cacheEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-scaling">Auto Scaling</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic scaling based on load
                    </p>
                  </div>
                  <Switch
                    id="auto-scaling"
                    checked={globalSettings.autoScaling}
                    onCheckedChange={(checked) => 
                      setGlobalSettings(prev => ({ ...prev, autoScaling: checked }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="max-concurrent">Max Concurrent Requests</Label>
                  <Input
                    id="max-concurrent"
                    type="number"
                    min="1"
                    max="1000"
                    value={globalSettings.maxConcurrentRequests}
                    onChange={(e) => 
                      setGlobalSettings(prev => ({ ...prev, maxConcurrentRequests: parseInt(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Monitoring & Alerting
              </CardTitle>
              <CardDescription>
                Configure monitoring and alerting settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="error-threshold">Error Rate Threshold (%)</Label>
                    <Input
                      id="error-threshold"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="response-threshold">Response Time Threshold (ms)</Label>
                    <Input
                      id="response-threshold"
                      type="number"
                      min="100"
                      max="10000"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email alerts for critical issues
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Slack Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send Slack notifications for alerts
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Performance Monitoring</Label>
                      <p className="text-sm text-muted-foreground">
                        Monitor system performance metrics
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};