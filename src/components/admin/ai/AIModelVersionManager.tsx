import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  GitBranch, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Copy,
  Archive,
  RefreshCw,
  Star,
  Tag,
  History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModelVersion {
  id: string;
  model_name: string;
  model_version: string;
  description: string;
  task_type: string;
  training_accuracy: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  model_config: any;
  performance_metrics: any;
}

export const AIModelVersionManager: React.FC = () => {
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelVersion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModels((data as any) || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to load model versions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async (formData: FormData) => {
    const modelName = formData.get('model_name') as string;
    const modelVersion = formData.get('model_version') as string;
    const description = formData.get('description') as string;
    const taskType = formData.get('task_type') as string;
    const trainingAccuracy = parseFloat(formData.get('training_accuracy') as string);

    try {
      const { error } = await supabase
        .from('ai_models')
        .insert({
          model_name: modelName,
          model_version: modelVersion,
          description: description,
          task_type: taskType,
          training_accuracy: trainingAccuracy,
          is_active: true,
          model_config: {},
          performance_metrics: {}
        } as any);

      if (error) throw error;

      toast.success('Model version created successfully');
      setIsCreateDialogOpen(false);
      fetchModels();
    } catch (error) {
      console.error('Error creating model version:', error);
      toast.error('Failed to create model version');
    }
  };

  const handleToggleActive = async (modelId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_models')
        .update({ is_active: !currentStatus } as any)
        .eq('id', modelId as any);

      if (error) throw error;

      toast.success(`Model ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchModels();
    } catch (error) {
      console.error('Error updating model status:', error);
      toast.error('Failed to update model status');
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      const { error } = await supabase
        .from('ai_models')
        .delete()
        .eq('id', modelId as any);

      if (error) throw error;

      toast.success('Model version deleted successfully');
      fetchModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model version');
    }
  };

  const handleCloneModel = async (model: ModelVersion) => {
    try {
      const { error } = await supabase
        .from('ai_models')
        .insert({
          model_name: model.model_name,
          model_version: `${model.model_version}-clone`,
          description: `Clone of ${model.description}`,
          task_type: model.task_type,
          training_accuracy: model.training_accuracy,
          is_active: false,
          model_config: model.model_config,
          performance_metrics: model.performance_metrics
        } as any);

      if (error) throw error;

      toast.success('Model cloned successfully');
      fetchModels();
    } catch (error) {
      console.error('Error cloning model:', error);
      toast.error('Failed to clone model');
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && model.is_active) ||
                         (statusFilter === 'inactive' && !model.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalModels = models.length;
  const activeModels = models.filter(m => m.is_active).length;
  const inactiveModels = totalModels - activeModels;
  const averageAccuracy = models.length > 0 ? 
    models.reduce((sum, m) => sum + (m.training_accuracy || 0), 0) / models.length : 0;

  const taskTypes = ['resume_scoring', 'job_matching', 'skill_analysis', 'career_guidance', 'content_generation'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Model Version Manager</h2>
          <p className="text-muted-foreground">
            Track and manage AI model versions, performance, and deployments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Model Version</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateVersion(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="model_name">Model Name</Label>
                <Input
                  id="model_name"
                  name="model_name"
                  placeholder="e.g., Resume Scorer"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="model_version">Version</Label>
                <Input
                  id="model_version"
                  name="model_version"
                  placeholder="e.g., v1.2.0"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of this version"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Select name="task_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="training_accuracy">Training Accuracy (%)</Label>
                <Input
                  id="training_accuracy"
                  name="training_accuracy"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="95.5"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Version</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModels}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeModels}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inactive Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveModels}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAccuracy.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchModels}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Models Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Model Versions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Task Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{model.model_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {model.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="font-medium">{model.model_version}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {model.task_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(model.is_active)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">
                        {model.training_accuracy ? `${model.training_accuracy.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(model.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(model.id, model.is_active)}
                      >
                        {model.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCloneModel(model)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedModel(model)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteModel(model.id)}
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

      {/* Model Details Dialog */}
      <Dialog open={!!selectedModel} onOpenChange={() => setSelectedModel(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedModel?.model_name} v{selectedModel?.model_version}
            </DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task Type</Label>
                  <p className="font-medium">{selectedModel.task_type}</p>
                </div>
                <div>
                  <Label>Training Accuracy</Label>
                  <p className="font-medium">{selectedModel.training_accuracy}%</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedModel.is_active)}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="font-medium">{new Date(selectedModel.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="mt-2 p-3 bg-muted rounded-lg">{selectedModel.description}</p>
              </div>

              <div>
                <Label>Model Configuration</Label>
                <div className="mt-2 bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
                    {JSON.stringify(selectedModel.model_config, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <Label>Performance Metrics</Label>
                <div className="mt-2 bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
                    {JSON.stringify(selectedModel.performance_metrics, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Model
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};