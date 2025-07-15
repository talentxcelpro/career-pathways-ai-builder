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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  Database, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Users,
  Archive,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExportButton } from '@/components/admin/ExportButton';

interface Dataset {
  id: string;
  dataset_name: string;
  description: string;
  dataset_type: string;
  file_path: string;
  sample_count: number;
  file_size_mb: number;
  processing_status: string;
  quality_score: number;
  created_at: string;
  updated_at: string;
  data_schema: any;
}

export const DatasetManager: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isNewDatasetDialogOpen, setIsNewDatasetDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const datasetTypes = [
    'resumes',
    'job_descriptions',
    'user_interactions',
    'skills_data',
    'company_data',
    'salary_data',
    'training_feedback',
    'performance_metrics'
  ];

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDataset = async (formData: FormData) => {
    const datasetName = formData.get('dataset_name') as string;
    const description = formData.get('description') as string;
    const datasetType = formData.get('dataset_type') as string;

    try {
      const { error } = await supabase
        .from('ai_datasets')
        .insert({
          dataset_name: datasetName,
          description: description,
          dataset_type: datasetType,
          sample_count: 0,
          file_size_mb: 0,
          processing_status: 'pending',
          quality_score: 0,
          data_schema: {}
        });

      if (error) throw error;

      toast.success('Dataset created successfully');
      setIsNewDatasetDialogOpen(false);
      fetchDatasets();
    } catch (error) {
      console.error('Error creating dataset:', error);
      toast.error('Failed to create dataset');
    }
  };

  const handleDeleteDataset = async (datasetId: string) => {
    try {
      const { error } = await supabase
        .from('ai_datasets')
        .delete()
        .eq('id', datasetId);

      if (error) throw error;

      toast.success('Dataset deleted successfully');
      fetchDatasets();
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast.error('Failed to delete dataset');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-500' },
      processing: { variant: 'secondary' as const, icon: Clock, color: 'text-blue-500' },
      pending: { variant: 'outline' as const, icon: AlertCircle, color: 'text-yellow-500' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-500' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.dataset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dataset.processing_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSamples = datasets.reduce((sum, dataset) => sum + dataset.sample_count, 0);
  const totalSize = datasets.reduce((sum, dataset) => sum + dataset.file_size_mb, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dataset Management</h2>
          <p className="text-muted-foreground">
            Upload, process, and manage training datasets with real data
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Dataset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Dataset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drag and drop your dataset file</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for CSV, JSON, and Excel files up to 100MB
                  </p>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataset_type">Dataset Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {datasetTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="validation_split">Validation Split (%)</Label>
                    <Input type="number" placeholder="20" min="0" max="50" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Process
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewDatasetDialogOpen} onOpenChange={setIsNewDatasetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Dataset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Dataset</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateDataset(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div>
                  <Label htmlFor="dataset_name">Dataset Name</Label>
                  <Input
                    id="dataset_name"
                    name="dataset_name"
                    placeholder="e.g., Resume Training Data 2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Brief description of the dataset"
                  />
                </div>
                <div>
                  <Label htmlFor="dataset_type">Dataset Type</Label>
                  <Select name="dataset_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasetTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewDatasetDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Dataset</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dataset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSamples.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {datasets.filter(d => d.processing_status === 'processing').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search datasets..."
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchDatasets}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Datasets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Available Datasets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Samples</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDatasets.map((dataset) => (
                <TableRow key={dataset.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dataset.dataset_name}</div>
                      <div className="text-sm text-muted-foreground">{dataset.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {dataset.dataset_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(dataset.processing_status)}
                  </TableCell>
                  <TableCell>{dataset.sample_count.toLocaleString()}</TableCell>
                  <TableCell>{dataset.file_size_mb.toFixed(1)} MB</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${dataset.quality_score}%` }}
                        />
                      </div>
                      <span className="text-sm">{dataset.quality_score}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(dataset.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <ExportButton
                        data={[dataset]}
                        filename={`dataset-${dataset.dataset_name}`}
                        format="json"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDataset(dataset.id)}
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

      {/* Dataset Details Dialog */}
      <Dialog open={!!selectedDataset} onOpenChange={() => setSelectedDataset(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Dataset Details: {selectedDataset?.dataset_name}</DialogTitle>
          </DialogHeader>
          {selectedDataset && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="samples">Samples</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dataset Type</Label>
                    <p className="text-sm font-medium">{selectedDataset.dataset_type}</p>
                  </div>
                  <div>
                    <Label>Processing Status</Label>
                    <p className="text-sm font-medium">{selectedDataset.processing_status}</p>
                  </div>
                  <div>
                    <Label>Sample Count</Label>
                    <p className="text-sm font-medium">{selectedDataset.sample_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>File Size</Label>
                    <p className="text-sm font-medium">{selectedDataset.file_size_mb.toFixed(1)} MB</p>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <p className="text-sm">{selectedDataset.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="schema" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm">
                    {JSON.stringify(selectedDataset.data_schema, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="samples" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Sample data preview would be displayed here
                </div>
              </TabsContent>
              
              <TabsContent value="quality" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Overall Quality Score</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedDataset.quality_score} className="flex-1" />
                      <span className="text-sm font-medium">{selectedDataset.quality_score}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Completeness</Label>
                      <Progress value={85} className="mt-1" />
                    </div>
                    <div>
                      <Label>Accuracy</Label>
                      <Progress value={92} className="mt-1" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};