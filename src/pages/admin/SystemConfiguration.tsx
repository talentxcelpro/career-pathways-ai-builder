import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Settings, Database, Shield, Mail, Bell, 
  Globe, Users, Key, Monitor, Save,
  Plus, Edit, Trash2, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemConfiguration = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingConfig, setEditingConfig] = useState(null);
  const [newConfigOpen, setNewConfigOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({
    category: 'general',
    key: '',
    value: '',
    description: '',
    data_type: 'string',
    is_public: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system configurations
  const { data: configurations, isLoading } = useQuery({
    queryKey: ['system-configurations', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('system_configuration')
        .select('*')
        .order('category', { ascending: true })
        .then(result => result.data?.sort((a, b) => a.key.localeCompare(b.key)));

      const { data, error } = await supabase
        .from('system_configuration')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      let filteredData = data || [];
      if (selectedCategory !== 'all') {
        filteredData = filteredData.filter(config => config.category === selectedCategory);
      }

      return filteredData;
    }
  });

  // Fetch notification templates
  const { data: templates } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, value }: { id: any; value: any }) => {
      const { data, error } = await supabase
        .from('system_configuration')
        .update({ 
          value: JSON.stringify(value),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuration updated",
        description: "System configuration has been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['system-configurations'] });
      setEditingConfig(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive"
      });
    }
  });

  // Create new configuration mutation
  const createConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      const { data, error } = await supabase
        .from('system_configuration')
        .insert({
          ...configData,
          value: JSON.stringify(configData.value),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Configuration created",
        description: "New system configuration has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['system-configurations'] });
      setNewConfigOpen(false);
      setNewConfig({
        category: 'general',
        key: '',
        value: '',
        description: '',
        data_type: 'string',
        is_public: false
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create configuration.",
        variant: "destructive"
      });
    }
  });

  const handleConfigUpdate = (config, newValue) => {
    updateConfigMutation.mutate({
      id: config.id,
      value: newValue
    });
  };

  const handleCreateConfig = () => {
    createConfigMutation.mutate(newConfig);
  };

  const renderConfigValue = (config) => {
    let parsedValue;
    try {
      parsedValue = JSON.parse(config.value);
    } catch {
      parsedValue = config.value;
    }

    if (config.data_type === 'boolean') {
      return (
        <Switch
          checked={parsedValue === true || parsedValue === 'true'}
          onCheckedChange={(checked) => handleConfigUpdate(config, checked)}
          disabled={updateConfigMutation.isPending}
        />
      );
    }

    if (config.data_type === 'number') {
      return (
        <Input
          type="number"
          value={parsedValue}
          onChange={(e) => handleConfigUpdate(config, parseInt(e.target.value))}
          onBlur={(e) => handleConfigUpdate(config, parseInt(e.target.value))}
          className="w-32"
          disabled={updateConfigMutation.isPending}
        />
      );
    }

    return (
      <Input
        value={parsedValue}
        onChange={(e) => setEditingConfig({ ...config, tempValue: e.target.value })}
        onBlur={(e) => handleConfigUpdate(config, e.target.value)}
        disabled={updateConfigMutation.isPending}
      />
    );
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'general': return Globe;
      case 'features': return Monitor;
      case 'security': return Shield;
      case 'notifications': return Bell;
      default: return Settings;
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: Settings },
    { value: 'general', label: 'General', icon: Globe },
    { value: 'features', label: 'Features', icon: Monitor },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage platform settings, features, and system behavior</p>
        </div>
        <Button onClick={() => setNewConfigOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Configuration
        </Button>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="templates">Notification Templates</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Mode</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category.value)}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <IconComponent className="h-6 w-6 mb-2" />
                      <span className="text-sm">{category.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuration List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory === 'all' ? 'All Configurations' : 
                 categories.find(c => c.value === selectedCategory)?.label + ' Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configurations?.map((config) => {
                      const IconComponent = getCategoryIcon(config.category);
                      return (
                        <TableRow key={config.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{config.key}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {config.category}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <span className="text-sm text-muted-foreground">
                              {config.description}
                            </span>
                          </TableCell>
                          <TableCell>
                            {renderConfigValue(config)}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {config.data_type}
                            </span>
                          </TableCell>
                          <TableCell>
                            {config.is_public ? (
                              <span className="text-green-600 text-sm">Public</span>
                            ) : (
                              <span className="text-gray-500 text-sm">Private</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage email and notification templates used throughout the system
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Variables: {(template.variables as string[])?.join(', ') || 'None'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{template.type}</span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {template.subject}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={template.is_active}
                          disabled
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Maintenance Mode
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enable maintenance mode to prevent user access during system updates
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Maintenance Mode Status</h4>
                  <p className="text-sm text-muted-foreground">
                    Currently: <span className="font-medium text-green-600">Disabled</span>
                  </p>
                </div>
                <Switch disabled />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Maintenance Message</Label>
                  <Textarea
                    placeholder="Enter message to display to users..."
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estimated Completion</Label>
                    <Input type="datetime-local" className="mt-1" />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input placeholder="admin@example.com" className="mt-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New Configuration Dialog */}
      <Dialog open={newConfigOpen} onOpenChange={setNewConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={newConfig.category} onValueChange={(value) => setNewConfig({...newConfig, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="notifications">Notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data Type</Label>
                <Select value={newConfig.data_type} onValueChange={(value) => setNewConfig({...newConfig, data_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Key</Label>
              <Input
                value={newConfig.key}
                onChange={(e) => setNewConfig({...newConfig, key: e.target.value})}
                placeholder="configuration_key"
              />
            </div>
            
            <div>
              <Label>Value</Label>
              <Input
                value={newConfig.value}
                onChange={(e) => setNewConfig({...newConfig, value: e.target.value})}
                placeholder="Configuration value"
              />
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={newConfig.description}
                onChange={(e) => setNewConfig({...newConfig, description: e.target.value})}
                placeholder="Describe what this configuration controls..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={newConfig.is_public}
                onCheckedChange={(checked) => setNewConfig({...newConfig, is_public: checked})}
              />
              <Label>Public (accessible to frontend)</Label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewConfigOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateConfig}
                disabled={!newConfig.key || !newConfig.value || createConfigMutation.isPending}
              >
                {createConfigMutation.isPending ? 'Creating...' : 'Create Configuration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemConfiguration;