import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Play, Pause, RotateCcw, Users, Briefcase, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkOperation {
  id: string;
  type: 'profile_enrichment' | 'job_scraping' | 'duplicate_detection';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  processed_items: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export default function LinkedInBulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedOperationType, setSelectedOperationType] = useState<string>('');
  const [batchSize, setBatchSize] = useState(100);
  const { toast } = useToast();

  const handleCreateBulkOperation = async (type: string) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-analytics-processor', {
        body: {
          action: 'create_bulk_operation',
          operation_type: type,
          batch_size: batchSize,
          config: {
            auto_start: true,
            priority: 'normal'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Bulk Operation Created",
        description: `${type.replace('_', ' ')} operation started with ${batchSize} items per batch`,
      });

      // Refresh operations list
      fetchOperations();
    } catch (error) {
      console.error('Error creating bulk operation:', error);
      toast({
        title: "Error",
        description: "Failed to create bulk operation",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const fetchOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_import_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      // Transform data to match BulkOperation interface
      // This is simplified - in reality you'd have a dedicated bulk_operations table
    } catch (error) {
      console.error('Error fetching operations:', error);
    }
  };

  const handlePauseOperation = async (operationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('linkedin-analytics-processor', {
        body: {
          action: 'pause_operation',
          operation_id: operationId
        }
      });

      if (error) throw error;
      toast({ title: "Operation Paused", description: "The bulk operation has been paused" });
      fetchOperations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to pause operation", variant: "destructive" });
    }
  };

  const handleResumeOperation = async (operationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('linkedin-analytics-processor', {
        body: {
          action: 'resume_operation',
          operation_id: operationId
        }
      });

      if (error) throw error;
      toast({ title: "Operation Resumed", description: "The bulk operation has been resumed" });
      fetchOperations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to resume operation", variant: "destructive" });
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'profile_enrichment': return <Users className="h-4 w-4" />;
      case 'job_scraping': return <Briefcase className="h-4 w-4" />;
      case 'duplicate_detection': return <TrendingUp className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Bulk Operations</CardTitle>
          <CardDescription>
            Manage large-scale LinkedIn data processing operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Operation</TabsTrigger>
              <TabsTrigger value="manage">Manage Operations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operation-type">Operation Type</Label>
                  <Select value={selectedOperationType} onValueChange={setSelectedOperationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profile_enrichment">Profile Enrichment</SelectItem>
                      <SelectItem value="job_scraping">Job Scraping</SelectItem>
                      <SelectItem value="duplicate_detection">Duplicate Detection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    min={10}
                    max={1000}
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => handleCreateBulkOperation(selectedOperationType)}
                disabled={!selectedOperationType || isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Start Bulk Operation'}
              </Button>
            </TabsContent>
            
            <TabsContent value="manage" className="space-y-4">
              {operations.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No bulk operations found. Create your first operation to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {operations.map((operation) => (
                    <Card key={operation.id}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                          {getOperationIcon(operation.type)}
                          <CardTitle className="text-sm font-medium">
                            {operation.type.replace('_', ' ').toUpperCase()}
                          </CardTitle>
                        </div>
                        <Badge className={getStatusColor(operation.status)}>
                          {operation.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progress: {operation.processed_items}/{operation.total_items}</span>
                            <span>{operation.progress}%</span>
                          </div>
                          <Progress value={operation.progress} className="w-full" />
                          
                          <div className="flex space-x-2">
                            {operation.status === 'running' ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePauseOperation(operation.id)}
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            ) : operation.status === 'pending' ? (
                              <Button 
                                size="sm" 
                                onClick={() => handleResumeOperation(operation.id)}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Resume
                              </Button>
                            ) : null}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleResumeOperation(operation.id)}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restart
                            </Button>
                          </div>
                          
                          {operation.error_message && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{operation.error_message}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}