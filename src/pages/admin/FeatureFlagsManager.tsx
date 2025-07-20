import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureFlags, useToggleFeatureFlag } from '@/hooks/useAdvancedAdmin';
import { Plus, Flag, Users, Percent, Settings, Eye, BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const FeatureFlagsManager = () => {
  const [selectedTab, setSelectedTab] = useState('flags');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: flags, isLoading } = useFeatureFlags();
  const toggleFlag = useToggleFeatureFlag();
  
  const { register, handleSubmit, reset, setValue } = useForm();

  const handleToggle = async (flagId: string, currentState: boolean) => {
    try {
      await toggleFlag.mutateAsync({ id: flagId, is_enabled: !currentState });
    } catch (error) {
      toast.error('Failed to toggle feature flag');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // In real implementation, create new feature flag
      toast.success('Feature flag created successfully');
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create feature flag');
    }
  };

  const getEnvironmentBadge = (percentage: number) => {
    if (percentage === 0) return { label: 'Off', color: 'bg-gray-100 text-gray-800' };
    if (percentage === 100) return { label: 'On', color: 'bg-green-100 text-green-800' };
    return { label: `${percentage}%`, color: 'bg-blue-100 text-blue-800' };
  };

  if (isLoading) {
    return (
      <UnifiedAdminLayout title="Feature Flags Manager" description="Control feature rollouts and A/B testing">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </UnifiedAdminLayout>
    );
  }

  return (
    <UnifiedAdminLayout title="Feature Flags Manager" description="Control feature rollouts and A/B testing">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flags?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Active flags</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Enabled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {flags?.filter(f => f.is_enabled).length || 0}
              </div>
              <p className="text-sm text-green-600">Currently active</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Gradual Rollouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {flags?.filter(f => f.rollout_percentage > 0 && f.rollout_percentage < 100).length || 0}
              </div>
              <p className="text-sm text-blue-600">Partial deployment</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Targeted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {flags?.filter(f => Object.keys(f.target_audience || {}).length > 0).length || 0}
              </div>
              <p className="text-sm text-purple-600">User-specific</p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              User Segments
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Environments
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Flag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Feature Flag</DialogTitle>
                <DialogDescription>
                  Create a new feature flag to control feature rollouts
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="flag_name">Flag Name</Label>
                    <Input
                      id="flag_name"
                      placeholder="new-feature-enabled"
                      {...register('flag_name', { required: true })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enable new feature..."
                      {...register('description')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rollout_percentage">Rollout Percentage</Label>
                    <Input
                      id="rollout_percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      {...register('rollout_percentage')}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 mt-6">
                    <Switch {...register('is_enabled')} />
                    <Label>Enable immediately</Label>
                  </div>
                </div>

                <div>
                  <Label>Target Audience</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...register('target_roles.admin')} />
                      <Label>Admins only</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...register('target_roles.beta_users')} />
                      <Label>Beta users</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" {...register('target_roles.pro_users')} />
                      <Label>Pro users</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Flag
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="targeting">Targeting Rules</TabsTrigger>
            <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
            <TabsTrigger value="environments">Environments</TabsTrigger>
          </TabsList>

          <TabsContent value="flags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>
                  Control feature availability across your platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flags?.map((flag) => {
                    const rolloutBadge = getEnvironmentBadge(flag.rollout_percentage || 0);
                    return (
                      <div key={flag.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Flag className="h-4 w-4 text-blue-600" />
                              <h3 className="font-medium">{flag.flag_name}</h3>
                              <Badge className={rolloutBadge.color}>
                                {rolloutBadge.label}
                              </Badge>
                              {Object.keys(flag.target_audience || {}).length > 0 && (
                                <Badge variant="outline">Targeted</Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {flag.description || 'No description provided'}
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Created</div>
                                <div className="font-medium">
                                  {new Date(flag.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Rollout</div>
                                <div className="font-medium">
                                  {flag.rollout_percentage || 0}%
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Users Affected</div>
                                <div className="font-medium">1,234</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Last Updated</div>
                                <div className="font-medium">
                                  {new Date(flag.updated_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 items-center">
                            <Switch 
                              checked={flag.is_enabled}
                              onCheckedChange={() => handleToggle(flag.id, flag.is_enabled)}
                              disabled={toggleFlag.isPending}
                            />
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!flags || flags.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No feature flags found. Create your first flag to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targeting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Targeting Rules</CardTitle>
                <CardDescription>Configure audience targeting for feature flags</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">User Role Targeting</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <label className="text-sm">Admin Users</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">Beta Users</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">Pro Users</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">All Users</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Geographic Targeting</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">India</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">United States</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">United Kingdom</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Device Targeting</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">Mobile</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">Desktop</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label className="text-sm">Tablet</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Evaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45,234</div>
                  <p className="text-sm text-green-600">+12% this week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,421</div>
                  <p className="text-sm text-muted-foreground">Affected by flags</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.2ms</div>
                  <p className="text-sm text-green-600">Avg evaluation time</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">99.9%</div>
                  <p className="text-sm text-green-600">Evaluation success</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Flag Usage Statistics</CardTitle>
                <CardDescription>Performance metrics for each feature flag</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Flag Name</th>
                        <th className="text-left p-2">Evaluations</th>
                        <th className="text-left p-2">Users Affected</th>
                        <th className="text-left p-2">Avg Response Time</th>
                        <th className="text-left p-2">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flags?.slice(0, 5).map((flag) => (
                        <tr key={flag.id} className="border-b">
                          <td className="p-2 font-medium">{flag.flag_name}</td>
                          <td className="p-2">12,345</td>
                          <td className="p-2">2,134</td>
                          <td className="p-2">0.15ms</td>
                          <td className="p-2">
                            <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Environment Configuration</CardTitle>
                <CardDescription>Manage feature flags across different environments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Development</h4>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Development environment with all features enabled for testing
                    </p>
                    <div className="text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>Enabled Flags: 12</div>
                        <div>API Key: dev_****</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Staging</h4>
                      <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Pre-production environment for final testing
                    </p>
                    <div className="text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>Enabled Flags: 8</div>
                        <div>API Key: staging_****</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Production</h4>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Live production environment with gradual rollouts
                    </p>
                    <div className="text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>Enabled Flags: 6</div>
                        <div>API Key: prod_****</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default FeatureFlagsManager;