
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Building2, 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Linkedin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EmployerRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'more_info' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Check if user is admin
  const isAdmin = user?.email === 'talentxcelpro@gmail.com';

  const { data: requests, isLoading } = useQuery({
    queryKey: ['employer-requests'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      const { data, error } = await supabase
        .from('employer_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: isAdmin
  });

  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { error } = await supabase.rpc('approve_employer_request', {
        request_id: requestId
      });
      
      if (error) throw error;

      // Update admin notes
      if (notes) {
        await supabase
          .from('employer_requests')
          .update({ admin_notes: notes })
          .eq('id', requestId);
      }
    },
    onSuccess: () => {
      toast.success('Employer request approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['employer-requests'] });
      setSelectedRequest(null);
      setActionType(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve request');
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, reason, notes }: { requestId: string; reason: string; notes: string }) => {
      const { error } = await supabase.rpc('reject_employer_request', {
        request_id: requestId,
        reason: reason
      });
      
      if (error) throw error;

      // Update admin notes
      if (notes) {
        await supabase
          .from('employer_requests')
          .update({ admin_notes: notes })
          .eq('id', requestId);
      }
    },
    onSuccess: () => {
      toast.success('Employer request rejected');
      queryClient.invalidateQueries({ queryKey: ['employer-requests'] });
      setSelectedRequest(null);
      setActionType(null);
      setAdminNotes('');
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject request');
    }
  });

  const handleAction = () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === 'approve') {
      approveRequestMutation.mutate({
        requestId: selectedRequest.id,
        notes: adminNotes
      });
    } else if (actionType === 'reject') {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
      rejectRequestMutation.mutate({
        requestId: selectedRequest.id,
        reason: rejectionReason,
        notes: adminNotes
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'more_info_needed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const processedRequests = requests?.filter(r => r.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Requests Admin</h1>
          <p className="text-gray-600 mt-1">Manage employer access requests for TalentXcel</p>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Pending Requests ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{request.full_name}</CardTitle>
                        <p className="text-sm text-gray-600">{request.company_name}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{request.email}</span>
                        </div>
                        {request.phone_number && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{request.phone_number}</span>
                          </div>
                        )}
                        {request.company_website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <a 
                              href={request.company_website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {request.company_website}
                            </a>
                          </div>
                        )}
                        {request.linkedin_profile && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4 text-gray-400" />
                            <a 
                              href={request.linkedin_profile} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                      <div>
                        {request.gst_number && (
                          <p className="text-sm"><strong>GST:</strong> {request.gst_number}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {request.company_description && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Company Description:</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {request.company_description}
                        </p>
                      </div>
                    )}

                    {request.hiring_reason && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Why they want to hire:</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {request.hiring_reason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('approve');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('reject');
                        }}
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setActionType('more_info');
                        }}
                        variant="outline"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request More Info
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Processed Requests */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Processed Requests ({processedRequests.length})</h2>
          
          {processedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-500">No processed requests yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {processedRequests.map((request) => (
                <Card key={request.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{request.full_name}</CardTitle>
                        <p className="text-sm text-gray-600">{request.company_name}</p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Processed: {new Date(request.updated_at).toLocaleDateString()}</span>
                      {request.rejection_reason && (
                        <span>Reason: {request.rejection_reason}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Modal */}
        {selectedRequest && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'more_info' && 'Request More Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{selectedRequest.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.company_name}</p>
                </div>

                {actionType === 'reject' && (
                  <div>
                    <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes for this request..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAction}
                    disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                    className={
                      actionType === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }
                  >
                    {approveRequestMutation.isPending || rejectRequestMutation.isPending ? (
                      'Processing...'
                    ) : (
                      actionType === 'approve' ? 'Approve' : 'Reject'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(null);
                      setActionType(null);
                      setAdminNotes('');
                      setRejectionReason('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerRequests;
