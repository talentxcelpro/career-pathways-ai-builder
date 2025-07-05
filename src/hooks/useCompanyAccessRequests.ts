
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type CompanyAccessRequest = {
  id: string;
  requester_id: string;
  company_id: string;
  requester_email: string;
  company_domain: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_role: 'admin' | 'recruiter' | 'hiring_manager' | 'viewer';
  request_message?: string;
  approved_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
};

export const useCompanyAccessRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Get user's own access requests
  const { data: myRequests, isLoading: loadingMyRequests } = useQuery({
    queryKey: ['my-company-access-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('company_access_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CompanyAccessRequest[];
    },
    enabled: !!user?.id
  });

  // Get pending requests for companies user manages
  const { data: pendingRequests, isLoading: loadingPendingRequests } = useQuery({
    queryKey: ['company-pending-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('company_access_requests')
        .select(`
          *,
          companies!inner(name, website)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Get available companies for domain matching
  const { data: availableCompanies } = useQuery({
    queryKey: ['available-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, website')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Submit company access request
  const submitRequest = useMutation({
    mutationFn: async (params: {
      companyId: string;
      requestedRole: string;
      message?: string;
    }) => {
      if (!user?.email) throw new Error('User email not found');

      const emailDomain = user.email.split('@')[1].toLowerCase();
      
      const { error } = await supabase
        .from('company_access_requests')
        .insert({
          requester_id: user.id,
          company_id: params.companyId,
          requester_email: user.email,
          company_domain: emailDomain,
          requested_role: params.requestedRole,
          request_message: params.message
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Access request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['my-company-access-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit request');
    }
  });

  // Approve request
  const approveRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('approve_company_access_request', {
        request_id: requestId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Request approved successfully');
      queryClient.invalidateQueries({ queryKey: ['company-pending-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve request');
    }
  });

  // Reject request
  const rejectRequest = useMutation({
    mutationFn: async (params: { requestId: string; reason?: string }) => {
      const { error } = await supabase.rpc('reject_company_access_request', {
        request_id: params.requestId,
        reason: params.reason
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Request rejected');
      queryClient.invalidateQueries({ queryKey: ['company-pending-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject request');
    }
  });

  return {
    myRequests,
    pendingRequests,
    availableCompanies,
    loadingMyRequests,
    loadingPendingRequests,
    selectedCompanyId,
    setSelectedCompanyId,
    submitRequest,
    approveRequest,
    rejectRequest
  };
};
