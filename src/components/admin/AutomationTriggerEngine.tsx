import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  ShoppingCart, 
  Calendar, 
  Mail,
  Clock,
  Users,
  Target,
  Activity
} from "lucide-react";

interface AutomationTrigger {
  id: string;
  name: string;
  event_type: string;
  description: string;
  is_active: boolean;
  conditions: any;
  actions: any;
  template_id?: string;
  delay_minutes: number;
  created_at: string;
  last_triggered?: string;
  trigger_count: number;
}

interface TriggerEvent {
  id: string;
  trigger_id: string;
  user_id: string;
  event_data: any;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
  processed_at?: string;
}

const eventTypeIcons = {
  user_registration: UserPlus,
  purchase_completed: ShoppingCart,
  subscription_expired: Calendar,
  email_opened: Mail,
  profile_updated: Users,
  goal_achieved: Target
};

export const AutomationTriggerEngine = () => {
  const [triggers, setTriggers] = useState<AutomationTrigger[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<TriggerEvent[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<AutomationTrigger | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newTrigger, setNewTrigger] = useState({
    name: '',
    event_type: '',
    description: '',
    delay_minutes: 0,
    template_id: '',
    conditions: {},
    actions: {}
  });

  useEffect(() => {
    loadTriggers();
    loadTriggerEvents();
    
    // Set up real-time subscription for trigger events
    const subscription = supabase
      .channel('automation_triggers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'automation_trigger_events' },
        () => {
          loadTriggerEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTriggers = async () => {
    try {
      // Mock data - in real implementation, this would come from automation_triggers table
      const mockTriggers: AutomationTrigger[] = [
        {
          id: '1',
          name: 'Welcome Email Sequence',
          event_type: 'user_registration',
          description: 'Send welcome email when user registers',
          is_active: true,
          conditions: { user_type: 'new' },
          actions: { send_email: true },
          template_id: 'welcome_template',
          delay_minutes: 5,
          created_at: new Date().toISOString(),
          trigger_count: 1250
        },
        {
          id: '2',
          name: 'Abandoned Cart Recovery',
          event_type: 'cart_abandoned',
          description: 'Send reminder email for abandoned carts',
          is_active: true,
          conditions: { cart_value: { min: 50 } },
          actions: { send_email: true },
          template_id: 'cart_reminder',
          delay_minutes: 60,
          created_at: new Date().toISOString(),
          last_triggered: new Date(Date.now() - 3600000).toISOString(),
          trigger_count: 456
        },
        {
          id: '3',
          name: 'Subscription Renewal Reminder',
          event_type: 'subscription_expiring',
          description: 'Remind users before subscription expires',
          is_active: false,
          conditions: { days_before_expiry: 7 },
          actions: { send_email: true },
          template_id: 'renewal_reminder',
          delay_minutes: 0,
          created_at: new Date().toISOString(),
          trigger_count: 89
        }
      ];
      
      setTriggers(mockTriggers);
    } catch (error) {
      console.error('Error loading triggers:', error);
      toast({
        title: "Error",
        description: "Failed to load automation triggers.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const loadTriggerEvents = async () => {
    try {
      // Mock recent trigger events
      const mockEvents: TriggerEvent[] = [
        {
          id: '1',
          trigger_id: '1',
          user_id: 'user123',
          event_data: { email: 'user@example.com', name: 'John Doe' },
          status: 'processed',
          created_at: new Date(Date.now() - 300000).toISOString(),
          processed_at: new Date(Date.now() - 240000).toISOString()
        },
        {
          id: '2',
          trigger_id: '2',
          user_id: 'user456',
          event_data: { cart_value: 125.50, items: 3 },
          status: 'pending',
          created_at: new Date(Date.now() - 180000).toISOString()
        },
        {
          id: '3',
          trigger_id: '1',
          user_id: 'user789',
          event_data: { email: 'newuser@example.com', name: 'Jane Smith' },
          status: 'failed',
          created_at: new Date(Date.now() - 120000).toISOString()
        }
      ];
      
      setTriggerEvents(mockEvents);
    } catch (error) {
      console.error('Error loading trigger events:', error);
    }
  };

  const toggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      // Update trigger status
      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId 
          ? { ...trigger, is_active: isActive }
          : trigger
      ));

      toast({
        title: `Trigger ${isActive ? 'Activated' : 'Deactivated'}`,
        description: `Automation trigger has been ${isActive ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error toggling trigger:', error);
      toast({
        title: "Error",
        description: "Failed to update trigger status.",
        variant: "destructive"
      });
    }
  };

  const createTrigger = async () => {
    try {
      if (!newTrigger.name || !newTrigger.event_type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const trigger: AutomationTrigger = {
        id: Date.now().toString(),
        ...newTrigger,
        is_active: true,
        created_at: new Date().toISOString(),
        trigger_count: 0
      };

      setTriggers(prev => [...prev, trigger]);
      setIsCreateModalOpen(false);
      setNewTrigger({
        name: '',
        event_type: '',
        description: '',
        delay_minutes: 0,
        template_id: '',
        conditions: {},
        actions: {}
      });

      toast({
        title: "Trigger Created",
        description: "New automation trigger has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating trigger:', error);
      toast({
        title: "Error",
        description: "Failed to create automation trigger.",
        variant: "destructive"
      });
    }
  };

  const testTrigger = async (triggerId: string) => {
    try {
      const trigger = triggers.find(t => t.id === triggerId);
      if (!trigger) return;

      // Simulate trigger execution
      const mockEvent: TriggerEvent = {
        id: Date.now().toString(),
        trigger_id: triggerId,
        user_id: 'test_user',
        event_data: { test: true },
        status: 'pending',
        created_at: new Date().toISOString()
      };

      setTriggerEvents(prev => [mockEvent, ...prev]);

      toast({
        title: "Trigger Test Started",
        description: `Testing automation trigger: ${trigger.name}`,
      });

      // Simulate processing
      setTimeout(() => {
        setTriggerEvents(prev => prev.map(event => 
          event.id === mockEvent.id 
            ? { ...event, status: 'processed', processed_at: new Date().toISOString() }
            : event
        ));
      }, 3000);
    } catch (error) {
      console.error('Error testing trigger:', error);
      toast({
        title: "Error",
        description: "Failed to test automation trigger.",
        variant: "destructive"
      });
    }
  };

  const getEventIcon = (eventType: string) => {
    const IconComponent = eventTypeIcons[eventType as keyof typeof eventTypeIcons] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processed: 'default',
      failed: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading automation engine...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Automation Trigger Engine
          </h2>
          <p className="text-muted-foreground">
            Create and manage automated email triggers based on user actions
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Trigger
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Trigger</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Trigger Name</Label>
                  <Input
                    id="name"
                    value={newTrigger.name}
                    onChange={(e) => setNewTrigger(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter trigger name"
                  />
                </div>
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select 
                    value={newTrigger.event_type} 
                    onValueChange={(value) => setNewTrigger(prev => ({...prev, event_type: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user_registration">User Registration</SelectItem>
                      <SelectItem value="purchase_completed">Purchase Completed</SelectItem>
                      <SelectItem value="subscription_expired">Subscription Expired</SelectItem>
                      <SelectItem value="email_opened">Email Opened</SelectItem>
                      <SelectItem value="profile_updated">Profile Updated</SelectItem>
                      <SelectItem value="goal_achieved">Goal Achieved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTrigger.description}
                  onChange={(e) => setNewTrigger(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe what this trigger does"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delay">Delay (minutes)</Label>
                  <Input
                    id="delay"
                    type="number"
                    value={newTrigger.delay_minutes}
                    onChange={(e) => setNewTrigger(prev => ({...prev, delay_minutes: parseInt(e.target.value) || 0}))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="template">Email Template</Label>
                  <Select 
                    value={newTrigger.template_id} 
                    onValueChange={(value) => setNewTrigger(prev => ({...prev, template_id: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome_template">Welcome Template</SelectItem>
                      <SelectItem value="cart_reminder">Cart Reminder</SelectItem>
                      <SelectItem value="renewal_reminder">Renewal Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createTrigger}>
                  Create Trigger
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="triggers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="triggers">Active Triggers</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="triggers" className="space-y-4">
          <div className="grid gap-4">
            {triggers.map((trigger) => (
              <Card key={trigger.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getEventIcon(trigger.event_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{trigger.name}</h3>
                        <p className="text-sm text-muted-foreground">{trigger.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {trigger.delay_minutes > 0 ? `${trigger.delay_minutes}min delay` : 'Instant'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {trigger.trigger_count} triggers
                          </span>
                          {trigger.last_triggered && (
                            <span>
                              Last: {new Date(trigger.last_triggered).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={trigger.is_active}
                        onCheckedChange={(checked) => toggleTrigger(trigger.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testTrigger(trigger.id)}
                      >
                        Test
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="space-y-4">
            {triggerEvents.map((event) => {
              const trigger = triggers.find(t => t.id === event.trigger_id);
              return (
                <Card key={event.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          {trigger && getEventIcon(trigger.event_type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{trigger?.name || 'Unknown Trigger'}</h4>
                          <p className="text-sm text-muted-foreground">
                            User: {event.user_id} • {new Date(event.created_at).toLocaleString()}
                          </p>
                          {event.processed_at && (
                            <p className="text-xs text-muted-foreground">
                              Processed: {new Date(event.processed_at).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};