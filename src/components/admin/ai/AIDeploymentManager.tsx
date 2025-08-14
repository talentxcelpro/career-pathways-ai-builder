import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Rocket, 
  Settings, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIModel {
  id: string;
  model_name: string;
  model_version: string;
  description: string;
  task_type: string;
  api_endpoint: string;
  is_active: boolean;
  training_accuracy: number;
  model_config: any;
}

interface AIDeployment {
  id: string;
  model_id: string;
  module_name: string;
  deployment_name: string;
  endpoint_url: string;
  is_live: boolean;
  health_status: string;
  request_count: number;
  average_response_time_ms: number;
  error_rate: number;
  deployment_config: any;
  ai_models: AIModel;
}

export const AIDeploymentManager: React.FC = () => {
  const [deployments, setDeployments] = useState<AIDeployment[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<AIDeployment | null>(null);

  const modules = [
    'network',
    'jobs', 
    'employer',
    'resume_builder',
    'tools',
    'learning',
    'colleges',
    'career_map',
    'companies'
  ];

  const fetchData = async () => {
    try {
      // Fetch deployments with model information
      const { data: deploymentsData, error: deploymentsError } = await supabase
        .from('ai_deployments')
        .select(`
          *,
          ai_models (
            id,
            model_name,
            model_version,
            description,
            task_type,
            api_endpoint,
            is_active,
            training_accuracy,
            model_config
          )
        `)
        .order('created_at', { ascending: false });

      if (deploymentsError) throw deploymentsError;

      // Fetch available models
      const { data: modelsData, error: modelsError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true as any)
        .order('model_name');

      if (modelsError) throw modelsError;

      setDeployments((deploymentsData as any) || []);
      setModels((modelsData as any) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load deployment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeployment = async (formData: FormData) => {
    const modelId = formData.get('model_id') as string;
    const moduleName = formData.get('module_name') as string;
    const deploymentName = formData.get('deployment_name') as string;
    const endpointUrl = formData.get('endpoint_url') as string;
    const isLive = formData.get('is_live') === 'true';

    try {
      const { error } = await supabase
        .from('ai_deployments')
        .insert({
          model_id: modelId,
          module_name: moduleName,
          deployment_name: deploymentName,
          endpoint_url: endpointUrl,
          is_live: isLive,
          health_status: 'unknown',
          deployment_config: {}
        } as any);

      if (error) throw error;

      toast.success('Deployment created successfully');
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating deployment:', error);
      toast.error('Failed to create deployment');
    }
  };

  const toggleDeploymentStatus = async (deploymentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_deployments')
        .update({ is_live: !currentStatus } as any)
        .eq('id', deploymentId as any);

      if (error) throw error;

      toast.success(`Deployment ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      console.error('Error updating deployment:', error);
      toast.error('Failed to update deployment status');
    }
  };

  const deleteDeployment = async (deploymentId: string) => {
    try {
      const { error } = await supabase
        .from('ai_deployments')
        .delete()
        .eq('id', deploymentId as any);

      if (error) throw error;

      toast.success('Deployment deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting deployment:', error);
      toast.error('Failed to delete deployment');
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getHealthStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Deployment Manager</h2>
          <p className="text-muted-foreground">
            Deploy and manage AI models across platform modules
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Deployment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Deployment</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateDeployment(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model_id">AI Model</Label>
                <Select name="model_id" required>
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

              <div className="space-y-2">
                <Label htmlFor="module_name">Module</Label>
                <Select name="module_name" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deployment_name">Deployment Name</Label>
                <Input
                  id="deployment_name"
                  name="deployment_name"
                  placeholder="e.g., Resume Scoring Service"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint_url">Endpoint URL</Label>
                <Input
                  id="endpoint_url"
                  name="endpoint_url"
                  placeholder="e.g., /api/ai/resume-score"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_live" name="is_live" />
                <Label htmlFor="is_live">Deploy Live</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deployments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Live Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deployments.filter(d => d.is_live).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Healthy Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {deployments.filter(d => d.health_status === 'healthy').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deployments.reduce((sum, d) => sum + d.request_count, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Deployment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Avg Response</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{deployment.ai_models.model_name}</div>
                      <div className="text-sm text-muted-foreground">
                        v{deployment.ai_models.model_version} • {deployment.ai_models.task_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {deployment.module_name.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{deployment.deployment_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {deployment.endpoint_url}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={deployment.is_live ? "default" : "secondary"}>
                      {deployment.is_live ? 'Live' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(deployment.health_status)}
                      {getHealthStatusBadge(deployment.health_status)}
                    </div>
                  </TableCell>
                  <TableCell>{deployment.request_count.toLocaleString()}</TableCell>
                  <TableCell>{deployment.average_response_time_ms}ms</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      deployment.error_rate > 0.1 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(deployment.error_rate * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleDeploymentStatus(deployment.id, deployment.is_live)}
                      >
                        {deployment.is_live ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingDeployment(deployment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteDeployment(deployment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};