import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  host_id: string;
  host_name: string;
  host_avatar?: string;
  scheduled_at: string;
  duration_minutes: number;
  participant_count: number;
  max_participants?: number;
  is_live: boolean;
  event_type: 'webinar' | 'workshop' | 'networking' | 'interview';
  tags?: string[];
  event_url?: string;
  registration_required: boolean;
  is_registered?: boolean;
  price?: number;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
  status: 'registered' | 'attended' | 'cancelled';
}

export const useLiveEvents = (filters?: {
  type?: string;
  status?: string;
  category?: string;
  date_range?: string;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['live-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('live_events')
        .select(`
          *,
          host:profiles!host_id(
            id,
            full_name,
            profile_picture_url
          ),
          registrations:event_registrations(
            id,
            user_id,
            status
          )
        `)
        .order('scheduled_at', { ascending: true });

      // Apply filters
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('event_type', filters.type);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.status === 'live') {
        query = query.eq('is_live', true);
      } else if (filters?.status === 'upcoming') {
        query = query
          .eq('is_live', false)
          .gte('scheduled_at', new Date().toISOString());
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as LiveEvent[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // 30 seconds for live updates
  });
};

export const useEventRegistration = () => {
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered'
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update participant count
      await supabase.rpc('increment_event_participants', {
        event_id: eventId
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-events'] });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      // Decrement participant count
      await supabase.rpc('decrement_event_participants', {
        event_id: eventId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-events'] });
    },
  });

  return {
    register: registerMutation,
    unregister: unregisterMutation,
  };
};

export const useUserEventRegistrations = (userId?: string) => {
  return useQuery({
    queryKey: ['user-event-registrations', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:live_events(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'registered');

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTrendingEvents = (limit = 5) => {
  return useQuery({
    queryKey: ['trending-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_events')
        .select('*')
        .order('participant_count', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data as LiveEvent[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEventNotifications = (userId?: string) => {
  return useQuery({
    queryKey: ['event-notifications', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get events starting in the next 2 hours that user is registered for
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:live_events(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'registered')
        .gte('live_events.scheduled_at', now)
        .lte('live_events.scheduled_at', twoHoursFromNow);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });
};