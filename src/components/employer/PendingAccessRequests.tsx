import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Building2, Clock, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AccessRequest {
  id: string;
  company_id: string;
  requester_email: string;
  company_domain: string;
  status: string;
  requested_role: string;
  request_message: string;
  created_at: string;
  company?: {
    name: string;
    logo_url?: string;
  };
}

export const PendingAccessRequests: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch pending access requests for current user
  const { data: accessRequests, isLoading } = useQuery({
    queryKey: ['pending-access-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('company_access_requests')
        .select(`
          *,
          companies!inner(name, logo_url)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching access requests:', error);
        return [];
      }

      return data.map(request => ({
        ...request,
        company: request.companies
      }));
    },
  });

  // Accept access request mutation
  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('approve_company_access_request', {
        request_id: requestId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Access request accepted! You now have employer access.');
      queryClient.invalidateQueries({ queryKey: ['pending-access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['employer-access'] });
      queryClient.invalidateQueries({ queryKey: ['user-team-membership'] });
      // Refresh the page to update the dashboard
      window.location.reload();
    },
    onError: (error: any) => {
      toast.error('Failed to accept request: ' + error.message);
    }
  });

  // Reject access request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const { error } = await supabase.rpc('reject_company_access_request', {
        request_id: requestId,
        reason: reason || 'Declined by user'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Access request declined.');
      queryClient.invalidateQueries({ queryKey: ['pending-access-requests'] });
    },
    onError: (error: any) => {
      toast.error('Failed to decline request: ' + error.message);
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Pending Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accessRequests || accessRequests.length === 0) {
    return null; // Don't show the component if no requests
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Pending Employer Access Requests
        </CardTitle>
        <CardDescription>
          You have been invited to join company employer dashboards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accessRequests.map((request) => (
            <div 
              key={request.id} 
              className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Join {request.company?.name || 'Company'} as {request.requested_role}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Company domain: {request.company_domain}
                    </p>
                    {request.request_message && (
                      <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                        "{request.request_message}"
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {request.requested_role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => acceptMutation.mutate(request.id)}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => rejectMutation.mutate({ 
                      requestId: request.id, 
                      reason: 'Declined by user' 
                    })}
                    disabled={acceptMutation.isPending || rejectMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};