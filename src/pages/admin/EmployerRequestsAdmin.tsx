import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, CheckCircle, XCircle, Clock, AlertCircle, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface EmployerRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  company_name: string;
  role?: string;
  hiring_reason?: string;
  status: string;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
  admin_notes?: string;
}

const EmployerRequestsAdmin = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<EmployerRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch pending employer requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-employer-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employer_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployerRequest[];
    }
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('approve_employer_request', {
        request_id: requestId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employer request approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-employer-requests'] });
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    }
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { error } = await supabase.rpc('reject_employer_request', {
        request_id: requestId,
        reason: reason || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Employer request rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-employer-requests'] });
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'more_info_needed': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'more_info_needed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleApprove = (request: EmployerRequest) => {
    if (window.confirm(`Approve employer access for ${request.company_name}?`)) {
      approveMutation.mutate(request.id);
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({ 
        requestId: selectedRequest.id, 
        reason: rejectionReason 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const processedRequests = requests?.filter(r => r.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Access Requests</h1>
          <p className="text-gray-600">Manage employer access requests from companies</p>
        </div>

        {/* Pending Requests */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Review and approve or reject employer access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{request.company_name}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Contact:</strong> {request.full_name}</p>
                            <p><strong>Email:</strong> {request.email}</p>
                            {request.role && <p><strong>Role:</strong> {request.role}</p>}
                          </div>
                          <div>
                            <p><strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}</p>
                            {request.hiring_reason && (
                              <p><strong>Reason:</strong> {request.hiring_reason.substring(0, 100)}...</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleApprove(request)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject Employer Request</DialogTitle>
                              <DialogDescription>
                                Provide a reason for rejecting the request from {selectedRequest?.company_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                <Textarea
                                  id="rejectionReason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Please provide a reason for rejection..."
                                  rows={3}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={rejectMutation.isPending}
                              >
                                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Processed Requests ({processedRequests.length})</CardTitle>
            <CardDescription>
              Previously approved or rejected requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No processed requests</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {processedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(request.status)}
                          <h4 className="font-medium">{request.company_name}</h4>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {request.full_name} • {request.email}
                        </p>
                        {request.rejection_reason && (
                          <p className="text-sm text-red-600 mt-1">
                            <strong>Reason:</strong> {request.rejection_reason}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>Updated: {new Date(request.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployerRequestsAdmin;