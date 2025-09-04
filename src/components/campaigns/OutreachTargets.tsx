import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Mail, ExternalLink, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function OutreachTargets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: targets, isLoading } = useQuery({
    queryKey: ['backlink-targets', searchTerm, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('backlink_targets')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`domain.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const [newTarget, setNewTarget] = useState({
    domain: '',
    contact_email: '',
    contact_name: '',
    domain_authority: '',
    category: '',
    notes: ''
  });

  const addTarget = useMutation({
    mutationFn: async (target: any) => {
      const { data, error } = await supabase
        .from('backlink_targets')
        .insert([{
          domain: target.domain,
          contact_email: target.contact_email,
          contact_name: target.contact_name,
          domain_authority: parseInt(target.domain_authority) || null,
          category: target.category,
          notes: target.notes,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Target added successfully!');
      queryClient.invalidateQueries({ queryKey: ['backlink-targets'] });
      setShowAddDialog(false);
      setNewTarget({
        domain: '',
        contact_email: '',
        contact_name: '',
        domain_authority: '',
        category: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast.error(`Failed to add target: ${error.message}`);
    },
  });

  const sendOutreach = useMutation({
    mutationFn: async (targetIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('backlink-outreach', {
        body: {
          target_ids: targetIds,
          content_type: 'email_pitch',
          send_immediately: true
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Outreach sent to ${data.sent} targets`);
      queryClient.invalidateQueries({ queryKey: ['backlink-targets'] });
    },
    onError: (error) => {
      toast.error(`Failed to send outreach: ${error.message}`);
    },
  });

  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.domain || !newTarget.contact_email) {
      toast.error('Domain and contact email are required');
      return;
    }
    addTarget.mutate(newTarget);
  };

  const getDomainAuthorityColor = (da: number | null) => {
    if (!da) return 'bg-gray-500';
    if (da >= 70) return 'bg-green-500';
    if (da >= 50) return 'bg-yellow-500';
    if (da >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search targets by domain or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="university">University</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="directory">Directory</SelectItem>
              <SelectItem value="resource">Resource Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Outreach Target</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTarget} className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain *</Label>
                <Input
                  id="domain"
                  value={newTarget.domain}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={newTarget.contact_email}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="contact@example.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={newTarget.contact_name}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="domain_authority">Domain Authority</Label>
                  <Input
                    id="domain_authority"
                    type="number"
                    min="0"
                    max="100"
                    value={newTarget.domain_authority}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, domain_authority: e.target.value }))}
                    placeholder="50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTarget.category} onValueChange={(value) => setNewTarget(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="directory">Directory</SelectItem>
                      <SelectItem value="resource">Resource Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newTarget.notes}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about this target..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addTarget.isPending}>
                  {addTarget.isPending ? 'Adding...' : 'Add Target'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targets?.map((target) => (
          <Card key={target.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {target.domain}
                    <ExternalLink 
                      className="h-4 w-4 text-muted-foreground cursor-pointer"
                      onClick={() => window.open(`https://${target.domain}`, '_blank')}
                    />
                  </CardTitle>
                  <CardDescription>
                    {target.contact_name} • {target.contact_email}
                  </CardDescription>
                </div>
                {target.domain_authority && (
                  <Badge className={`${getDomainAuthorityColor(target.domain_authority)} text-white`}>
                    DA: {target.domain_authority}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {target.category && (
                  <Badge variant="outline">{target.category}</Badge>
                )}
                {target.last_contacted && (
                  <Badge variant="secondary">Contacted</Badge>
                )}
              </div>
              
              {target.notes && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {target.notes}
                </p>
              )}
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="gap-1 flex-1"
                  onClick={() => sendOutreach.mutate([target.id])}
                  disabled={sendOutreach.isPending}
                >
                  <Mail className="h-3 w-3" />
                  Send Outreach
                </Button>
              </div>
              
              {target.last_contacted && (
                <p className="text-xs text-muted-foreground">
                  Last contacted: {new Date(target.last_contacted).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {targets?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No targets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first outreach target to get started'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Target
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}