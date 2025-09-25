import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: string;
  provider_id: string;
  images: string[];
  location?: string;
  delivery_time?: string;
  tags: string[];
  status: 'active' | 'paused' | 'draft';
  created_at: string;
  updated_at: string;
  // Calculated fields
  rating?: number;
  review_count?: number;
  order_count?: number;
  view_count?: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  verified: boolean;
  rating: number;
  review_count: number;
  completed_orders: number;
  response_time: string;
  member_since: string;
  location?: string;
}

export interface ServiceOrder {
  id: string;
  service_id: string;
  client_id: string;
  provider_id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  deadline?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  // Related data
  service?: Service;
  client?: any;
  provider?: ServiceProvider;
}

export interface ServiceFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
  min_rating?: number;
  delivery_time?: string;
  verified_only?: boolean;
  tags?: string[];
  sort_by?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'popular' | 'newest';
}

export const useServices = (filters?: ServiceFilters) => {
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select(`
          *,
          provider:provider_id (
            id,
            name,
            avatar,
            title,
            verified,
            rating,
            review_count,
            completed_orders,
            response_time,
            member_since,
            location
          )
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.subcategory) {
        query = query.eq('subcategory', filters.subcategory);
      }

      if (filters?.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }

      if (filters?.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }

      if (filters?.location) {
        query = query.eq('location', filters.location);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply sorting
      switch (filters?.sort_by) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    services,
    isLoading,
    error
  };
};

export const useService = (serviceId: string) => {
  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          provider:provider_id (
            id,
            name,
            avatar,
            title,
            verified,
            rating,
            review_count,
            completed_orders,
            response_time,
            member_since,
            location
          )
        `)
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!serviceId,
  });

  return {
    service,
    isLoading,
    error
  };
};

export const useProviderServices = (providerId?: string) => {
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['provider-services', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  return {
    services,
    isLoading,
    error
  };
};

export const useProviderOrders = (providerId?: string) => {
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['provider-orders', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          service:service_id (
            id,
            title,
            category
          ),
          client:client_id (
            id,
            name,
            avatar
          )
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  return {
    orders,
    isLoading,
    error
  };
};

export const useServiceMutations = () => {
  const queryClient = useQueryClient();

  const createService = useMutation({
    mutationFn: async (serviceData: Partial<Service>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          provider_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Service created successfully!');
    },
    onError: (error) => {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Service updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    },
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      toast.success('Service deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    },
  });

  const createOrder = useMutation({
    mutationFn: async (orderData: {
      service_id: string;
      provider_id: string;
      price: number;
      deadline?: string;
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          ...orderData,
          client_id: user.id,
          status: 'pending',
          progress: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, progress }: {
      orderId: string;
      status: ServiceOrder['status'];
      progress?: number;
    }) => {
      const updates: any = { status };
      if (progress !== undefined) {
        updates.progress = progress;
      }
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
      }

      const { data, error } = await supabase
        .from('service_orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-orders'] });
      toast.success('Order updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    },
  });

  return {
    createService,
    updateService,
    deleteService,
    createOrder,
    updateOrderStatus,
    isCreating: createService.isPending,
    isUpdating: updateService.isPending,
    isDeleting: deleteService.isPending,
  };
};