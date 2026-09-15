import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: any;
}

export const EventDialog = ({ open, onOpenChange, event }: EventDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    event_key: '',
    event_name: '',
    description: '',
    module_name: '',
    priority: 'normal',
    is_enabled: true,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        event_key: event.event_key || '',
        event_name: event.event_name || '',
        description: event.description || '',
        module_name: event.module_name || '',
        priority: event.priority || 'normal',
        is_enabled: event.is_enabled ?? true,
      });
    } else {
      setFormData({
        event_key: '',
        event_name: '',
        description: '',
        module_name: '',
        priority: 'normal',
        is_enabled: true,
      });
    }
  }, [event, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (event) {
        const { error } = await supabase
          .from('email_event_definitions')
          .update(data)
          .eq('id', event.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_event_definitions')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-events'] });
      toast({
        title: event ? 'Event updated' : 'Event created',
        description: `Email event ${event ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save event',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const modules = [
    'Authentication', 'Profile', 'Resume Builder', 'Job Search', 'AI Career Coach',
    'Learning', 'Networking', 'Collaboration', 'Analytics', 'Company Portal',
    'Content', 'Gamification', 'System', 'Interview Prep', 'Salary Insights',
    'Skills Assessment', 'Mentorship'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_key">Event Key *</Label>
              <Input
                id="event_key"
                value={formData.event_key}
                onChange={(e) => setFormData({ ...formData, event_key: e.target.value })}
                placeholder="e.g., user.signup.welcome"
                required
                disabled={!!event}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_name">Event Name *</Label>
              <Input
                id="event_name"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                placeholder="e.g., Welcome Email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe when this event is triggered"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module_name">Module *</Label>
              <Select
                value={formData.module_name}
                onValueChange={(value) => setFormData({ ...formData, module_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
