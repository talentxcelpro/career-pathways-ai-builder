import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export const SendEmailTest = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');

  const { data: events } = useQuery({
    queryKey: ['email-events-for-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_event_definitions')
        .select('*')
        .eq('is_enabled', true)
        .order('event_name');
      
      if (error) throw error;
      return data;
    }
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('enqueue_email_event', {
        p_event_key: selectedEvent,
        p_recipient_email: email,
        p_recipient_name: name,
        p_template_data: {
          user_name: name,
          platform_name: 'TalentXcel'
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Test email queued',
        description: 'Test email has been added to the queue and will be sent shortly',
      });
      setEmail('');
      setName('');
      setSelectedEvent('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to queue test email',
        variant: 'destructive',
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Test Email</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          sendTestEmailMutation.mutate();
        }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event">Email Event</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Select an email event" />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.event_key}>
                    {event.event_name} - {event.module_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Recipient Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={!selectedEvent || !email || !name || sendTestEmailMutation.isPending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
