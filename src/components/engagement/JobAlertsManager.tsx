import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useJobAlerts, type JobAlert } from '@/hooks/useJobAlerts';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Briefcase,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const JobAlertsManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<JobAlert | null>(null);
  
  const { 
    alerts, 
    isLoading, 
    createAlert, 
    updateAlert, 
    deleteAlert, 
    toggleAlert,
    isCreating,
    isUpdating,
    isDeleting
  } = useJobAlerts();

  const [formData, setFormData] = useState({
    alert_name: '',
    keywords: [] as string[],
    location: '',
    employment_types: [] as string[],
    experience_levels: [] as string[],
    salary_min: '',
    salary_max: '',
    is_remote: false,
    frequency: 'daily' as 'instant' | 'daily' | 'weekly',
    is_active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alertData = {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
    };

    if (editingAlert) {
      updateAlert({ id: editingAlert.id, ...alertData });
      setEditingAlert(null);
    } else {
      createAlert(alertData);
    }
    
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      alert_name: '',
      keywords: [],
      location: '',
      employment_types: [],
      experience_levels: [],
      salary_min: '',
      salary_max: '',
      is_remote: false,
      frequency: 'daily',
      is_active: true
    });
  };

  const handleEdit = (alert: JobAlert) => {
    setFormData({
      alert_name: alert.alert_name,
      keywords: alert.keywords,
      location: alert.location,
      employment_types: alert.employment_types,
      experience_levels: alert.experience_levels,
      salary_min: alert.salary_min?.toString() || '',
      salary_max: alert.salary_max?.toString() || '',
      is_remote: alert.is_remote || false,
      frequency: alert.frequency,
      is_active: alert.is_active
    });
    setEditingAlert(alert);
    setIsCreateDialogOpen(true);
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  if (isLoading) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Job Alerts
            {alerts.filter(a => a.is_active).length > 0 && (
              <Badge variant="secondary">
                {alerts.filter(a => a.is_active).length} active
              </Badge>
            )}
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAlert ? 'Edit Job Alert' : 'Create Job Alert'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="alert_name">Alert Name</Label>
                  <Input
                    id="alert_name"
                    value={formData.alert_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, alert_name: e.target.value }))}
                    placeholder="e.g., Frontend Developer Jobs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add keyword and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addKeyword(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addKeyword(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Bangalore, Mumbai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value: 'instant' | 'daily' | 'weekly') => 
                        setFormData(prev => ({ ...prev, frequency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">Instant</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary_min">Min Salary (₹/month)</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary_min: e.target.value }))}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_max">Max Salary (₹/month)</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary_max: e.target.value }))}
                      placeholder="150000"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_remote"
                    checked={formData.is_remote}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_remote: checked }))}
                  />
                  <Label htmlFor="is_remote">Remote jobs only</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active alert</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isCreating || isUpdating}
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
      </CardHeader>

      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No job alerts yet</p>
            <p className="text-xs">Create your first alert to get notified about matching jobs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-colors ${
                  alert.is_active ? 'bg-card' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{alert.alert_name}</h3>
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      {alert.keywords.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {alert.keywords.slice(0, 3).map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {alert.keywords.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{alert.keywords.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {alert.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {alert.location}
                          {alert.is_remote && <Badge variant="secondary" className="text-xs">Remote</Badge>}
                        </div>
                      )}

                      {(alert.salary_min || alert.salary_max) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          ₹{alert.salary_min?.toLocaleString() || '0'} - ₹{alert.salary_max?.toLocaleString() || '∞'}/month
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {alert.frequency} notifications
                        {alert.last_triggered_at && (
                          <span>• Last triggered {formatDistanceToNow(new Date(alert.last_triggered_at), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(alert)}
                      className="p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      disabled={isDeleting}
                      className="p-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};