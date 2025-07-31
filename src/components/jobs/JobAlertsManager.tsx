import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Bell, Plus, Edit, Trash2, Search, MapPin, DollarSign, 
  Clock, Mail, Volume2, AlertCircle
} from 'lucide-react';

interface JobAlert {
  id: string;
  title: string;
  keywords: string[];
  location: string;
  employment_type: string[];
  experience_level: string[];
  salary_min: number | null;
  salary_max: number | null;
  is_remote: boolean;
  is_active: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  last_sent: string | null;
  created_at: string;
  updated_at: string;
}

interface JobAlertFormData {
  title: string;
  keywords: string;
  location: string;
  employment_type: string[];
  experience_level: string[];
  salary_min: string;
  salary_max: string;
  is_remote: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export const JobAlertsManager = () => {
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  const [formData, setFormData] = useState<JobAlertFormData>({
    title: '',
    keywords: '',
    location: '',
    employment_type: [],
    experience_level: [],
    salary_min: '',
    salary_max: '',
    is_remote: false,
    frequency: 'daily'
  });

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchJobAlerts();
      } else {
        setLoading(false);
      }
    };
    getCurrentUser();
  }, []);

  const fetchJobAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data || []).map(alert => ({
        ...alert,
        frequency: alert.frequency as 'immediate' | 'daily' | 'weekly'
      })));
    } catch (error) {
      console.error('Error fetching job alerts:', error);
      toast.error('Failed to fetch job alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!user || !formData.title.trim()) {
      toast.error('Please provide an alert title');
      return;
    }

    try {
      const alertData = {
        user_id: user.id,
        title: formData.title.trim(),
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        location: formData.location.trim() || null,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        is_remote: formData.is_remote,
        frequency: formData.frequency,
        is_active: true
      };

      const { error } = await supabase
        .from('job_alerts')
        .insert([alertData]);

      if (error) throw error;

      toast.success('Job alert created successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchJobAlerts();
    } catch (error) {
      console.error('Error creating job alert:', error);
      toast.error('Failed to create job alert');
    }
  };

  const handleUpdateAlert = async () => {
    if (!editingAlert || !formData.title.trim()) {
      toast.error('Please provide an alert title');
      return;
    }

    try {
      const alertData = {
        title: formData.title.trim(),
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
        location: formData.location.trim() || null,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        is_remote: formData.is_remote,
        frequency: formData.frequency
      };

      const { error } = await supabase
        .from('job_alerts')
        .update(alertData)
        .eq('id', editingAlert.id);

      if (error) throw error;

      toast.success('Job alert updated successfully!');
      setEditingAlert(null);
      resetForm();
      fetchJobAlerts();
    } catch (error) {
      console.error('Error updating job alert:', error);
      toast.error('Failed to update job alert');
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('job_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;

      toast.success(`Job alert ${isActive ? 'activated' : 'deactivated'}`);
      fetchJobAlerts();
    } catch (error) {
      console.error('Error toggling job alert:', error);
      toast.error('Failed to update job alert');
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this job alert?')) return;

    try {
      const { error } = await supabase
        .from('job_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast.success('Job alert deleted successfully!');
      fetchJobAlerts();
    } catch (error) {
      console.error('Error deleting job alert:', error);
      toast.error('Failed to delete job alert');
    }
  };

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
      frequency: 'daily'
    });
  };

  const populateFormForEdit = (alert: JobAlert) => {
    setFormData({
      title: alert.title,
      keywords: alert.keywords.join(', '),
      location: alert.location || '',
      employment_type: alert.employment_type,
      experience_level: alert.experience_level,
      salary_min: alert.salary_min?.toString() || '',
      salary_max: alert.salary_max?.toString() || '',
      is_remote: alert.is_remote,
      frequency: alert.frequency
    });
    setEditingAlert(alert);
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'immediate': return <Volume2 className="h-4 w-4" />;
      case 'daily': return <Clock className="h-4 w-4" />;
      case 'weekly': return <Mail className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Please Sign In</h3>
          <p className="text-muted-foreground text-center">
            Sign in to create and manage your job alerts.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Alerts</h1>
          <p className="text-muted-foreground">Get notified when jobs matching your criteria are posted</p>
        </div>
        <Dialog open={isCreateDialogOpen || !!editingAlert} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setEditingAlert(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAlert ? 'Edit Job Alert' : 'Create New Job Alert'}</DialogTitle>
              <DialogDescription>
                Set up criteria to receive notifications when matching jobs are posted.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Alert Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior React Developer Jobs"
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., React, JavaScript, Frontend (comma-separated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employment_types">Employment Types</Label>
                  <Select onValueChange={(value) => {
                    if (!formData.employment_type.includes(value)) {
                      setFormData({ 
                        ...formData, 
                        employment_type: [...formData.employment_type, value]
                      });
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.employment_type.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            employment_type: formData.employment_type.filter(t => t !== type)
                          })}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience_levels">Experience Levels</Label>
                  <Select onValueChange={(value) => {
                    if (!formData.experience_level.includes(value)) {
                      setFormData({ 
                        ...formData, 
                        experience_level: [...formData.experience_level, value]
                      });
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="mid-level">Mid Level</SelectItem>
                      <SelectItem value="senior-level">Senior Level</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.experience_level.map((level) => (
                      <Badge key={level} variant="secondary" className="text-xs">
                        {level}
                        <button
                          onClick={() => setFormData({
                            ...formData,
                            experience_level: formData.experience_level.filter(l => l !== level)
                          })}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Mumbai, Bangalore, Remote"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_min">Minimum Salary (₹)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="e.g., 500000"
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Maximum Salary (₹)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="e.g., 1500000"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_remote"
                  checked={formData.is_remote}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
                />
                <Label htmlFor="is_remote">Remote Work Only</Label>
              </div>

              <div>
                <Label htmlFor="frequency">Notification Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingAlert(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}>
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Job Alerts Set Up</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first job alert to get notified when matching opportunities are posted.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {alert.title}
                      <Badge className={`${getFrequencyColor(alert.frequency)} flex items-center gap-1`}>
                        {getFrequencyIcon(alert.frequency)}
                        {alert.frequency}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {alert.last_sent 
                        ? `Last sent: ${new Date(alert.last_sent).toLocaleDateString()}`
                        : 'Never sent'
                      }
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => populateFormForEdit(alert)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alert.keywords.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {alert.keywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Location:</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.location}
                      </Badge>
                    </div>
                  )}

                  {(alert.salary_min || alert.salary_max) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Salary:</span>
                      <Badge variant="outline" className="text-xs">
                        ₹{alert.salary_min?.toLocaleString() || '0'} - ₹{alert.salary_max?.toLocaleString() || '∞'}
                      </Badge>
                    </div>
                  )}

                  {alert.employment_type.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Types:</span>
                      <div className="flex flex-wrap gap-1">
                        {alert.employment_type.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {alert.is_remote && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Remote Work Only</span>
                      <Badge variant="outline" className="text-xs">
                        Remote
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};