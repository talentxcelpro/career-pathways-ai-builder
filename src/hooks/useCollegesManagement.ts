import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useCollegesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [premiumFilter, setPremiumFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch colleges with comprehensive filters
  const { data: colleges, isLoading: collegesLoading } = useQuery({
    queryKey: ['colleges', searchTerm, typeFilter, stateFilter, verificationFilter, premiumFilter],
    queryFn: async () => {
      let query = supabase
        .from('colleges')
        .select(`
          *,
          college_programs(count),
          college_alumni(count),
          college_inquiries(count),
          college_events(count)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
      }

      if (typeFilter !== 'all') {
        query = query.eq('college_type', typeFilter);
      }

      if (stateFilter !== 'all') {
        query = query.eq('state', stateFilter);
      }

      if (verificationFilter !== 'all') {
        query = query.eq('verification_status', verificationFilter);
      }

      if (premiumFilter === 'premium') {
        query = query.eq('is_premium', true);
      } else if (premiumFilter === 'free') {
        query = query.eq('is_premium', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Fetch college statistics
  const { data: collegeStats } = useQuery({
    queryKey: ['college-stats'],
    queryFn: async () => {
        const [
        totalCollegesResult,
        verifiedCollegesResult,
        pendingVerificationResult,
        premiumCollegesResult,
        totalProgramsResult,
        totalInquiriesResult,
        totalEventsResult,
        statesResult
      ] = await Promise.all([
        supabase.from('colleges').select('*', { count: 'exact', head: true }),
        supabase.from('colleges').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
        supabase.from('colleges').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('colleges').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('college_programs').select('*', { count: 'exact', head: true }),
        supabase.from('college_inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('college_events').select('*', { count: 'exact', head: true }),
        supabase.from('colleges').select('state').not('state', 'is', null)
      ]);

      const totalColleges = totalCollegesResult.count || 0;
      const verifiedColleges = verifiedCollegesResult.count || 0;
      const pendingVerification = pendingVerificationResult.count || 0;
      const premiumColleges = premiumCollegesResult.count || 0;
      const totalPrograms = totalProgramsResult.count || 0;
      const totalInquiries = totalInquiriesResult.count || 0;
      const totalEvents = totalEventsResult.count || 0;
      const states = statesResult.data || [];

      const uniqueStates = [...new Set(states?.map(c => c.state).filter(Boolean))];
      
      return {
        totalColleges: totalColleges || 0,
        verifiedColleges: verifiedColleges || 0,
        pendingVerification: pendingVerification || 0,
        premiumColleges: premiumColleges || 0,
        totalPrograms: totalPrograms || 0,
        totalInquiries: totalInquiries || 0,
        totalEvents: totalEvents || 0,
        states: uniqueStates,
        verificationRate: totalColleges ? Math.round((verifiedColleges / totalColleges) * 100) : 0
      };
    }
  });

  // College verification mutation
  const verifyCollege = useMutation({
    mutationFn: async ({ collegeId, status, reason }: { collegeId: string; status: string; reason?: string }) => {
      const updates: any = {
        verification_status: status,
        is_verified: status === 'verified',
        verified_by: status === 'verified' ? (await supabase.auth.getUser()).data.user?.id : null,
        verified_at: status === 'verified' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('colleges')
        .update(updates)
        .eq('id', collegeId);
      
      if (error) throw error;

      // Log verification activity
      if (reason) {
        await supabase.from('admin_activity_log').insert({
          admin_user_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'college_verification',
          details: {
            college_id: collegeId,
            status,
            reason,
            timestamp: new Date().toISOString()
          }
        });
      }
    },
    onSuccess: () => {
      toast.success('College verification status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      queryClient.invalidateQueries({ queryKey: ['college-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update verification status');
    }
  });

  // Premium status toggle mutation
  const togglePremiumStatus = useMutation({
    mutationFn: async ({ collegeId, isPremium, expiresAt }: { collegeId: string; isPremium: boolean; expiresAt?: string }) => {
      const { error } = await supabase
        .from('colleges')
        .update({
          is_premium: isPremium,
          premium_expires_at: expiresAt || null
        })
        .eq('id', collegeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Premium status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      queryClient.invalidateQueries({ queryKey: ['college-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update premium status');
    }
  });

  // Create college mutation
  const createCollege = useMutation({
    mutationFn: async (collegeData: any) => {
      const { error } = await supabase
        .from('colleges')
        .insert({
          ...collegeData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('College created successfully');
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      queryClient.invalidateQueries({ queryKey: ['college-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create college');
    }
  });

  // Delete college mutation
  const deleteCollege = useMutation({
    mutationFn: async (collegeId: string) => {
      const { error } = await supabase
        .from('colleges')
        .delete()
        .eq('id', collegeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('College deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
      queryClient.invalidateQueries({ queryKey: ['college-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete college');
    }
  });

  return {
    // State
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    stateFilter,
    setStateFilter,
    verificationFilter,
    setVerificationFilter,
    premiumFilter,
    setPremiumFilter,
    
    // Data
    colleges,
    collegeStats,
    isLoading: collegesLoading,
    
    // Mutations
    verifyCollege,
    togglePremiumStatus,
    createCollege,
    deleteCollege
  };
};