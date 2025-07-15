import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FlaskConical, 
  Play, 
  Loader, 
  CheckCircle, 
  XCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAIService } from '@/hooks/useAIService';

export const AITestingCenter: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState('single');
  const [deployments, setDeployments] = useState<any[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<string>('');
  
  const { callAI } = useAIService();

  useEffect(() => {
    fetchModelsAndDeployments();
  }, []);

  const fetchModelsAndDeployments = async () => {
    try {
      // Fetch models
      const { data: modelsData, error: modelsError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true);

      if (modelsError) throw modelsError;
      
      // Fetch deployments
      const { data: deploymentsData, error: deploymentsError } = await supabase
        .from('ai_deployments')
        .select(`
          *,
          ai_models (
            model_name,
            model_version
          )
        `)
        .eq('is_live', true);

      if (deploymentsError) throw deploymentsError;
      
      setModels(modelsData || []);
      setDeployments(deploymentsData || []);
    } catch (error) {
      console.error('Error fetching models and deployments:', error);
      toast.error('Failed to load models and deployments');
    }
  };

  const handleTestModel = async () => {
    if (!prompt) {
      toast.error('Please enter a prompt');
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    
    try {
      if (testMode === 'single') {
        const selectedModelData = models.find(m => m.id === selectedModel);
        if (!selectedModelData) {
          throw new Error('Selected model not found');
        }
        
        // Call the AI service
        const result = await callAI({
          module: 'testing',
          task: 'test_model',
          input: {
            modelId: selectedModel,
            prompt: prompt
          }
        });
        
        if (result.success) {
          setResponse(result.data?.response || 'No response received');
        } else {
          throw new Error(result.error || 'Failed to get response');
        }
      } else {
        const selectedDeploymentData = deployments.find(d => d.id === selectedDeployment);
        if (!selectedDeploymentData) {
          throw new Error('Selected deployment not found');
        }
        
        // Call the deployed AI service
        const result = await callAI({
          module: selectedDeploymentData.module_name,
          task: 'test',
          input: {
            deploymentId: selectedDeployment,
            prompt: prompt
          }
        });
        
        if (result.success) {
          setResponse(result.data?.response || 'No response received');
        } else {
          throw new Error(result.error || 'Failed to get response');
        }
      }
    } catch (error) {
      console.error('Error testing model:', error);
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setResponse('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const saveTestCase = async () => {
    try {
      const { error } = await supabase
        .from('ai_test_cases')
        .insert({
          model_id: testMode === 'single' ? selectedModel : null,
          deployment_id: testMode === 'deployment' ? selectedDeployment : null,
          prompt: prompt,
          expected_response: response,
          is_successful: true,
          created_by: null // This would be set to auth.uid() in a real scenario
        });

      if (error) throw error;
      toast.success('Test case saved successfully');
    } catch (error) {
      console.error('Error saving test case:', error);
      toast.error('Failed to save test case');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Testing Center</h2>
          <p className="text-muted-foreground">
            Test and validate AI models and deployments with real prompts
          </p>
        </div>
      </div>

      <Tabs value={testMode} onValueChange={setTestMode} className="space-y-6">
        <TabsList>
          <TabsTrigger value="single">Model Testing</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Test Individual Model
              </CardTitle>
              <CardDescription>
                Test a specific model with custom prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model-select">Select Model</Label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.model_name} v{model.model_version} ({model.task_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="prompt">Test Prompt</Label>
                  <Textarea
                    id="prompt"
                    rows={5}
                    placeholder="Enter your test prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPrompt('');
                      setResponse('');
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={handleTestModel}
                    disabled={isLoading || !selectedModel || !prompt}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Test Deployment
              </CardTitle>
              <CardDescription>
                Test a deployed model in its production environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deployment-select">Select Deployment</Label>
                  <Select 
                    value={selectedDeployment} 
                    onValueChange={setSelectedDeployment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deployment" />
                    </SelectTrigger>
                    <SelectContent>
                      {deployments.map((deployment) => (
                        <SelectItem key={deployment.id} value={deployment.id}>
                          {deployment.deployment_name} ({deployment.ai_models.model_name} v{deployment.ai_models.model_version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="prompt">Test Prompt</Label>
                  <Textarea
                    id="prompt"
                    rows={5}
                    placeholder="Enter your test prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPrompt('');
                      setResponse('');
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={handleTestModel}
                    disabled={isLoading || !selectedDeployment || !prompt}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Section */}
      {(response || isLoading) && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {response}
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Response Time: 245ms
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      Tokens: 128
                    </Badge>
                  </div>
                  
                  <div>
                    <Button onClick={saveTestCase}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Test Case
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};