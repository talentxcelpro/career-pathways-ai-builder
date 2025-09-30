import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Power } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventDialog } from './EventDialog';

export const EventManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['email-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_event_definitions')
        .select('*')
        .order('module_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Real-time subscription for events
  React.useEffect(() => {
    const channel = supabase
      .channel('email-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_event_definitions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['email-events'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const toggleEventMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const { error } = await supabase
        .from('email_event_definitions')
        .update({ is_enabled: isEnabled })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-events'] });
      toast({
        title: 'Event updated',
        description: 'Email event status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        variant: 'destructive',
      });
    }
  });

  const modules = Array.from(new Set(events?.map(e => e.module_name) || []));

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.event_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || event.module_name === filterModule;
    return matchesSearch && matchesModule;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'normal': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading events...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email Events ({filteredEvents?.length || 0})</span>
            <Button size="sm" onClick={() => { setSelectedEvent(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredEvents?.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{event.event_name}</h4>
                  <Badge variant={getPriorityColor(event.priority)}>{event.priority}</Badge>
                  <Badge variant="outline">{event.module_name}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <p className="text-xs text-muted-foreground">Key: {event.event_key}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{event.is_enabled ? 'Active' : 'Disabled'}</span>
                  <Switch
                    checked={event.is_enabled}
                    onCheckedChange={(checked) => 
                      toggleEventMutation.mutate({ id: event.id, isEnabled: checked })
                    }
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => { setSelectedEvent(event); setDialogOpen(true); }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No events found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
    
    <EventDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      event={selectedEvent}
    />
    </>
  );
};
