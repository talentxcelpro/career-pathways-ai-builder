import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Eye, Users, Calendar, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Hub {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  hub_type: 'company' | 'college' | 'organization';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  member_count?: number;
  opportunity_count?: number;
  event_count?: number;
}

interface HubFormData {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  hub_type: 'company' | 'college' | 'organization';
  contact_email: string;
  website_url: string;
  is_verified: boolean;
  is_active: boolean;
}

const HubManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [formData, setFormData] = useState<HubFormData>({
    name: '',
    slug: '',
    description: '',
    logo_url: '',
    banner_url: '',
    hub_type: 'company',
    contact_email: '',
    website_url: '',
    is_verified: false,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: hubs, isLoading } = useQuery({
    queryKey: ['admin-hubs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_hubs')
        .select(`
          *,
          hub_stats (
            member_count,
            opportunity_count,
            event_count
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Hub[];
    }
  });

  const createHubMutation = useMutation({
    mutationFn: async (data: HubFormData) => {
      const { error } = await supabase
        .from('organization_hubs')
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hubs'] });
      toast.success('Hub created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create hub: ' + error.message);
    }
  });

  const updateHubMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HubFormData> }) => {
      const { error } = await supabase
        .from('organization_hubs')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hubs'] });
      toast.success('Hub updated successfully');
      setEditingHub(null);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update hub: ' + error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      logo_url: '',
      banner_url: '',
      hub_type: 'company',
      contact_email: '',
      website_url: '',
      is_verified: false,
      is_active: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingHub) {
      updateHubMutation.mutate({ id: editingHub.id, data: formData });
    } else {
      createHubMutation.mutate(formData);
    }
  };

  const openEditModal = (hub: Hub) => {
    setEditingHub(hub);
    setFormData({
      name: hub.name,
      slug: hub.slug,
      description: hub.description,
      logo_url: hub.logo_url || '',
      banner_url: hub.banner_url || '',
      hub_type: hub.hub_type,
      contact_email: '', // These would need to be fetched if stored
      website_url: '',
      is_verified: hub.is_verified,
      is_active: hub.is_active
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Hub Management</h1>
          <p className="text-muted-foreground">Manage organization hubs and their settings</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Hub
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Hub</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="unique-hub-slug"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Hub Type</label>
                  <Select value={formData.hub_type} onValueChange={(value: 'company' | 'college' | 'organization') => 
                    setFormData(prev => ({ ...prev, hub_type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Logo URL</label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Banner URL</label>
                  <Input
                    value={formData.banner_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                  />
                  <span className="text-sm">Verified</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createHubMutation.isPending}>
                  {createHubMutation.isPending ? 'Creating...' : 'Create Hub'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {hubs?.map((hub) => (
          <Card key={hub.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  {hub.logo_url && (
                    <img 
                      src={hub.logo_url} 
                      alt={hub.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {hub.name}
                      {hub.is_verified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                      <Badge variant={hub.is_active ? "default" : "destructive"} className="text-xs">
                        {hub.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">/{hub.slug}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/hubs/${hub.slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(hub)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{hub.description}</p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{hub.member_count || 0} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span>{hub.opportunity_count || 0} opportunities</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{hub.event_count || 0} events</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {hub.hub_type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingHub} onOpenChange={() => setEditingHub(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hub: {editingHub?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Same form fields as create modal */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                />
                <span className="text-sm">Verified</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditingHub(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateHubMutation.isPending}>
                {updateHubMutation.isPending ? 'Updating...' : 'Update Hub'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HubManagement;