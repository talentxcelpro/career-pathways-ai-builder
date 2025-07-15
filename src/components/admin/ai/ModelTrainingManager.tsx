import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Brain, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Target,
  BarChart3,
  Zap,
  Timer,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingJob {
  id: string;
  job_name: string;
  model_id: string;
  dataset_id: string;
  status: string;
  progress: number;
  current_epoch: number;
  total_epochs: number;
  loss_value: number;
  accuracy: number;
  training_config: any;
  created_at: string;
  updated_at: string;
  start_time: string;
  end_time: string;
  ai_models: {
    model_name: string;
    model_version: string;
    task_type: string;
  };
  ai_datasets: {
    dataset_name: string;
    dataset_type: string;
  };
}

export const ModelTrainingManager: React.FC = () => {
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch training jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('ai_training_jobs')
        .select(`
          *,
          ai_models (
            model_name,
            model_version,
            task_type
          ),
          ai_datasets (
            dataset_name,
            dataset_type
          )
        `)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch available models
      const { data: modelsData, error: modelsError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true);

      if (modelsError) throw modelsError;

      // Fetch available datasets
      const { data: datasetsData, error: datasetsError } = await supabase
        .from('ai_datasets')
        .select('*')
        .eq('processing_status', 'processed');

      if (datasetsError) throw datasetsError;

      setTrainingJobs(jobsData || []);
      setModels(modelsData || []);
      setDatasets(datasetsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load training data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrainingJob = async (formData: FormData) => {
    const jobName = formData.get('job_name') as string;
    const modelId = formData.get('model_id') as string;
    const datasetId = formData.get('dataset_id') as string;
    const totalEpochs = parseInt(formData.get('total_epochs') as string);
    const learningRate = parseFloat(formData.get('learning_rate') as string);
    const batchSize = parseInt(formData.get('batch_size') as string);

    try {
      const { error } = await supabase
        .from('ai_training_jobs')
        .insert({
          job_name: jobName,
          model_id: modelId,
          dataset_id: datasetId,
          total_epochs: totalEpochs,
          status: 'queued',
          progress: 0,
          current_epoch: 0,
          training_config: {
            learning_rate: learningRate,
            batch_size: batchSize,
            optimizer: 'adam',
            loss_function: 'cross_entropy'
          }
        });

      if (error) throw error;

      toast.success('Training job created successfully');
      setIsCreateDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating training job:', error);
      toast.error('Failed to create training job');
    }
  };

  const handleStartTraining = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('ai_training_jobs')
        .update({ 
          status: 'running',
          start_time: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Training started');
      fetchData();
    } catch (error) {
      console.error('Error starting training:', error);
      toast.error('Failed to start training');
    }
  };

  const handleStopTraining = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('ai_training_jobs')
        .update({ 
          status: 'stopped',
          end_time: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Training stopped');
      fetchData();
    } catch (error) {
      console.error('Error stopping training:', error);
      toast.error('Failed to stop training');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
      running: { variant: 'secondary' as const, icon: Play, color: 'text-blue-500' },
      queued: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-500' },
      stopped: { variant: 'destructive' as const, icon: Pause, color: 'text-red-500' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-500' }
    };

    const config = statusConfig[status] || statusConfig.queued;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalJobs = trainingJobs.length;
  const runningJobs = trainingJobs.filter(job => job.status === 'running').length;
  const completedJobs = trainingJobs.filter(job => job.status === 'completed').length;
  const queuedJobs = trainingJobs.filter(job => job.status === 'queued').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Model Training</h2>
          <p className="text-muted-foreground">
            Train and fine-tune AI models with real platform data
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Start Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Training Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateTrainingJob(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="job_name">Job Name</Label>
                <Input
                  id="job_name"
                  name="job_name"
                  placeholder="e.g., Resume Scorer Fine-tuning v2"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model_id">Base Model</Label>
                  <Select name="model_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.model_name} v{model.model_version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dataset_id">Training Dataset</Label>
                  <Select name="dataset_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id}>
                          {dataset.dataset_name} ({dataset.sample_count.toLocaleString()} samples)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="total_epochs">Epochs</Label>
                  <Input
                    id="total_epochs"
                    name="total_epochs"
                    type="number"
                    placeholder="100"
                    min="1"
                    max="1000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="learning_rate">Learning Rate</Label>
                  <Input
                    id="learning_rate"
                    name="learning_rate"
                    type="number"
                    step="0.0001"
                    placeholder="0.001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="batch_size">Batch Size</Label>
                  <Input
                    id="batch_size"
                    name="batch_size"
                    type="number"
                    placeholder="32"
                    min="1"
                    max="512"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Play className="h-4 w-4 mr-2" />
                  Start Training
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Training Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{runningJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Queued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{queuedJobs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Training Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Training Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Dataset</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-medium">{job.job_name}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.ai_models.model_name}</div>
                      <div className="text-sm text-muted-foreground">
                        v{job.ai_models.model_version} • {job.ai_models.task_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.ai_datasets.dataset_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {job.ai_datasets.dataset_type}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(job.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Epoch {job.current_epoch}/{job.total_epochs}</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{job.accuracy ? `${job.accuracy.toFixed(1)}%` : 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.start_time ? new Date(job.start_time).toLocaleString() : 'Not started'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {job.status === 'running' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStopTraining(job.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : job.status === 'queued' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartTraining(job.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJob(job)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Training Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Training Job Details: {selectedJob?.job_name}</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Model</Label>
                  <p className="font-medium">{selectedJob.ai_models.model_name}</p>
                </div>
                <div>
                  <Label>Dataset</Label>
                  <p className="font-medium">{selectedJob.ai_datasets.dataset_name}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedJob.status)}</div>
                </div>
                <div>
                  <Label>Progress</Label>
                  <p className="font-medium">{selectedJob.progress}%</p>
                </div>
              </div>

              <div>
                <Label>Training Configuration</Label>
                <div className="mt-2 bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
                    {JSON.stringify(selectedJob.training_config, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Current Epoch</Label>
                  <p className="font-medium">{selectedJob.current_epoch}</p>
                </div>
                <div>
                  <Label>Loss Value</Label>
                  <p className="font-medium">{selectedJob.loss_value?.toFixed(4) || 'N/A'}</p>
                </div>
                <div>
                  <Label>Accuracy</Label>
                  <p className="font-medium">{selectedJob.accuracy ? `${selectedJob.accuracy.toFixed(2)}%` : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};