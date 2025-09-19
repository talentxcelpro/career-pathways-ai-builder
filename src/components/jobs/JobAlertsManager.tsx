import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Edit, Trash2, AlertCircle, BellRing, Search, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

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
  total_matches?: number;
}

const JobAlertsManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    keywords: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    salary_min: '',
    salary_max: '',
    is_remote: false,
    frequency: 'daily',
    is_active: true
  });

  // Fetch job alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['job-alerts'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as JobAlert[];
    },
    enabled: !!user
  });

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('job_alerts')
        .insert({
          ...alertData,
          user_id: user.id,
          keywords: alertData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0),
          salary_min: alertData.salary_min ? parseInt(alertData.salary_min) : null,
          salary_max: alertData.salary_max ? parseInt(alertData.salary_max) : null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-alerts'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Job alert created successfully!');
    },
    onError: (error) => {
      console.error('Create alert error:', error);
      toast.error('Failed to create job alert');
    }
  });

  // Update alert mutation
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
      setEditingAlert(null);
      toast.success('Job alert updated successfully!');
    },
    onError: (error) => {
      console.error('Update alert error:', error);
      toast.error('Failed to update job alert');
    }
  });

  // Delete alert mutation
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

  const resetForm = () => {
    setFormData({
      title: '',
      keywords: '',
      location: '',
      employment_type: [],
      experience_level: [],
      salary_min: '',
      salary_max: '',
      is_remote: false,
      frequency: 'daily',
      is_active: true
    });
  };

  const handleEdit = (alert: JobAlert) => {
    setFormData({
      title: alert.title,
      keywords: alert.keywords.join(', '),
      location: alert.location,
      employment_type: alert.employment_type,
      experience_level: alert.experience_level,
      salary_min: alert.salary_min?.toString() || '',
      salary_max: alert.salary_max?.toString() || '',
      is_remote: alert.is_remote,
      frequency: alert.frequency,
      is_active: alert.is_active
    });
    setEditingAlert(alert);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAlert) {
      updateAlertMutation.mutate({ 
        id: editingAlert.id, 
        updates: {
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
          salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        }
      });
    } else {
      createAlertMutation.mutate(formData);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && alert.is_active) ||
                         (statusFilter === 'inactive' && !alert.is_active);
    return matchesSearch && matchesStatus;
  });

  const activeAlerts = alerts.filter(alert => alert.is_active);
  const totalAlerts = alerts.length;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Login Required</h3>
            <p className="text-muted-foreground">Please log in to manage your job alerts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BellRing className="h-8 w-8 text-primary" />
            Job Alerts
          </h1>
          <p className="text-muted-foreground mt-2">
            Stay informed about new job opportunities that match your preferences
          </p>
        </div>

        <Dialog 
          open={isCreateDialogOpen || !!editingAlert} 
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setEditingAlert(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? 'Edit Job Alert' : 'Create Job Alert'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Alert Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                <Textarea
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., React, JavaScript, Frontend, TypeScript"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Mumbai, Remote, Bangalore"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_min">Min Salary (₹)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="500000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="salary_max">Max Salary (₹)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="1500000"
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
                    <SelectItem value="instantly">Instantly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
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
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createAlertMutation.isPending || updateAlertMutation.isPending}
                  className="flex-1"
                >
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingAlert(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAlerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(a.created_at) > weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search Alerts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {totalAlerts === 0 ? 'No job alerts yet' : 'No alerts match your filters'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {totalAlerts === 0 
                ? 'Create your first job alert to get notified about relevant opportunities'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {totalAlerts === 0 && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Alert
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{alert.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.frequency}
                      </Badge>
                    </div>
                  </div>
                  
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
              </CardHeader>

              <CardContent className="space-y-3">
                {alert.keywords && alert.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {alert.keywords.slice(0, 4).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {alert.keywords.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{alert.keywords.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {alert.location && (
                  <p className="text-sm"><strong>Location:</strong> {alert.location}</p>
                )}

                {(alert.salary_min || alert.salary_max) && (
                  <p className="text-sm">
                    <strong>Salary:</strong> ₹{(alert.salary_min || 0).toLocaleString()} - ₹{(alert.salary_max || 0).toLocaleString()}
                  </p>
                )}

                {alert.is_remote && (
                  <Badge variant="outline" className="text-xs">Remote Only</Badge>
                )}

                {alert.last_sent && (
                  <p className="text-xs text-muted-foreground">
                    Last sent: {new Date(alert.last_sent).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(alert)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                    disabled={deleteAlertMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
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

export default JobAlertsManager;