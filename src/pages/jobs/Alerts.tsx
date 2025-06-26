
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Bell, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface JobAlert {
  id: string;
  title: string;
  keywords: string[];
  location: string;
  employment_type: string[];
  experience_level: string[];
  salary_min: number;
  salary_max: number;
  is_remote: boolean;
  frequency: string;
  is_active: boolean;
  last_sent: string;
  created_at: string;
}

const Alerts = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['job-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JobAlert[];
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('job_alerts')
        .insert({
          ...alertData,
          user_id: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      setIsCreateDialogOpen(false);
      toast.success('Job alert created successfully!');
    },
    onError: (error) => {
      console.error('Create alert error:', error);
      toast.error('Failed to create job alert');
    }
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('job_alerts')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert updated successfully!');
    },
    onError: (error) => {
      console.error('Update alert error:', error);
      toast.error('Failed to update job alert');
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_alerts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      toast.success('Job alert deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete alert error:', error);
      toast.error('Failed to delete job alert');
    }
  });

  const AlertForm = ({ alert }: { alert?: JobAlert }) => {
    const [formData, setFormData] = useState({
      title: alert?.title || '',
      keywords: alert?.keywords?.join(', ') || '',
      location: alert?.location || '',
      employment_type: alert?.employment_type || [],
      experience_level: alert?.experience_level || [],
      salary_min: alert?.salary_min || '',
      salary_max: alert?.salary_max || '',
      is_remote: alert?.is_remote || false,
      frequency: alert?.frequency || 'daily',
      is_active: alert?.is_active !== false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const alertData = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
        salary_min: formData.salary_min ? parseInt(formData.salary_min.toString()) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max.toString()) : null,
      };

      if (alert) {
        updateAlertMutation.mutate({ id: alert.id, updates: alertData });
        setEditingAlert(null);
      } else {
        createAlertMutation.mutate(alertData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Alert Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Frontend Developer Jobs"
            required
          />
        </div>

        <div>
          <Label htmlFor="keywords">Keywords (comma-separated)</Label>
          <Input
            id="keywords"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            placeholder="e.g., React, JavaScript, Frontend"
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., New York, Remote"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary_min">Min Salary</Label>
            <Input
              id="salary_min"
              type="number"
              value={formData.salary_min}
              onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
              placeholder="50000"
            />
          </div>
          
          <div>
            <Label htmlFor="salary_max">Max Salary</Label>
            <Input
              id="salary_max"
              type="number"
              value={formData.salary_max}
              onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
              placeholder="100000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="frequency">Alert Frequency</Label>
          <Select 
            value={formData.frequency} 
            onValueChange={(value) => setFormData({ ...formData, frequency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="instantly">Instantly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_remote"
            checked={formData.is_remote}
            onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
          />
          <Label htmlFor="is_remote">Remote jobs only</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createAlertMutation.isPending || updateAlertMutation.isPending}>
            {(createAlertMutation.isPending || updateAlertMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {alert ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              alert ? 'Update Alert' : 'Create Alert'
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setEditingAlert(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            Job Alerts
          </h1>
          <p className="text-gray-600 mt-2">
            Get notified when jobs matching your criteria are posted
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Job Alert</DialogTitle>
              <DialogDescription>
                Set up a new alert to get notified about relevant job opportunities
              </DialogDescription>
            </DialogHeader>
            <AlertForm />
          </DialogContent>
        </Dialog>
      </div>

      {!alerts || alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No job alerts yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first job alert to get notified about relevant opportunities
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{alert.title}</CardTitle>
                    <CardDescription>
                      {alert.frequency} notifications • {alert.is_active ? 'Active' : 'Inactive'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-1">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => 
                        updateAlertMutation.mutate({ 
                          id: alert.id, 
                          updates: { is_active: checked } 
                        })
                      }
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {alert.keywords && alert.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {alert.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {alert.keywords.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{alert.keywords.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {alert.location && (
                  <div>
                    <p className="text-sm font-medium">Location: {alert.location}</p>
                  </div>
                )}

                {(alert.salary_min || alert.salary_max) && (
                  <div>
                    <p className="text-sm font-medium">
                      Salary: ${alert.salary_min?.toLocaleString() || '0'} - ${alert.salary_max?.toLocaleString() || '∞'}
                    </p>
                  </div>
                )}

                {alert.is_remote && (
                  <Badge variant="outline" className="text-xs">
                    Remote Only
                  </Badge>
                )}

                {alert.last_sent && (
                  <p className="text-xs text-gray-500">
                    Last sent: {new Date(alert.last_sent).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Dialog open={editingAlert?.id === alert.id} onOpenChange={(open) => !open && setEditingAlert(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setEditingAlert(alert)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Job Alert</DialogTitle>
                        <DialogDescription>
                          Update your job alert settings
                        </DialogDescription>
                      </DialogHeader>
                      <AlertForm alert={editingAlert!} />
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                    disabled={deleteAlertMutation.isPending}
                  >
                    {deleteAlertMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
