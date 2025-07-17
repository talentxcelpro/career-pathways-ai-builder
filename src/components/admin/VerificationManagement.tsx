import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  CheckCircle, 
  X, 
  Eye, 
  Shield, 
  Clock,
  AlertCircle,
  FileText,
  User,
  Building,
  Crown,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const VerificationManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch verification requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-verification-requests', searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_verification_requests')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url, email, verification_status)
        `)
        .order('submitted_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('verification_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Approve verification mutation
  const approveVerification = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('user_verification_requests')
        .update({ 
          verification_status: 'approved',
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);
      
      if (error) throw error;

      // Update user profile verification status
      const request = requests?.find(r => r.id === id);
      if (request) {
        const badges = request.profiles?.verification_badges || [];
        const newBadges = [...badges, request.verification_type];
        
        await supabase
          .from('profiles')
          .update({ 
            verification_status: 'verified',
            verification_badges: newBadges
          })
          .eq('id', request.user_id);
      }
    },
    onSuccess: () => {
      toast.success('Verification request approved');
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve verification');
    }
  });

  // Reject verification mutation
  const rejectVerification = useMutation({
    mutationFn: async ({ id, reason, notes }: { id: string; reason: string; notes: string }) => {
      const { error } = await supabase
        .from('user_verification_requests')
        .update({ 
          verification_status: 'rejected',
          rejection_reason: reason,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Verification request rejected');
      queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] });
      setSelectedRequest(null);
      setRejectionReason('');
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject verification');
    }
  });

  const filteredRequests = requests?.filter(request =>
    request.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.verification_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'additional_info_required':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'identity':
        return <User className="w-4 h-4" />;
      case 'professional':
        return <Shield className="w-4 h-4" />;
      case 'premium':
        return <Crown className="w-4 h-4" />;
      case 'business':
        return <Building className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verification Management</h1>
          <p className="text-muted-foreground">Review and manage user verification requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredRequests?.length || 0} Requests
          </Badge>
          <Badge variant="outline" className="bg-yellow-50">
            {requests?.filter(r => r.verification_status === 'pending').length || 0} Pending
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name or verification type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="additional_info_required">Info Required</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="identity">Identity</option>
              <option value="professional">Professional</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRequests?.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.profiles?.avatar_url} />
                    <AvatarFallback>
                      {request.profiles?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{request.profiles?.full_name || 'Unknown User'}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      {getTypeIcon(request.verification_type)}
                      <span className="capitalize">{request.verification_type}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(request.verification_status)}>
                  {request.verification_status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Submitted Documents */}
              <div>
                <span className="text-sm font-medium">Documents:</span>
                <div className="text-sm text-muted-foreground">
                  {request.submitted_documents?.length || 0} files submitted
                </div>
              </div>

              {/* Date */}
              <div className="text-xs text-muted-foreground">
                Submitted: {format(new Date(request.submitted_at), 'MMM dd, yyyy HH:mm')}
              </div>

              {/* Admin Notes */}
              {request.admin_notes && (
                <div className="p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Admin Notes:</span>
                  <p className="mt-1">{request.admin_notes}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {request.rejection_reason && (
                <div className="p-2 bg-red-50 rounded text-sm">
                  <span className="font-medium text-red-800">Rejection Reason:</span>
                  <p className="mt-1 text-red-700">{request.rejection_reason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRequest(request)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(selectedRequest.verification_type)}
                Review {selectedRequest.verification_type} Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <Avatar>
                  <AvatarImage src={selectedRequest.profiles?.avatar_url} />
                  <AvatarFallback>
                    {selectedRequest.profiles?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedRequest.profiles?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRequest.profiles?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Current Status: {selectedRequest.profiles?.verification_status}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="font-medium mb-2">Submitted Documents</h4>
                <div className="space-y-2">
                  {selectedRequest.submitted_documents?.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <FileText className="w-4 h-4" />
                      <span className="flex-1 text-sm">{doc.name || `Document ${index + 1}`}</span>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add your review notes..."
                  rows={3}
                />
              </div>

              {/* Rejection Reason (if rejecting) */}
              <div>
                <label className="block text-sm font-medium mb-2">Rejection Reason (if applicable)</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this verification is being rejected..."
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminNotes('');
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => rejectVerification.mutate({
                    id: selectedRequest.id,
                    reason: rejectionReason,
                    notes: adminNotes
                  })}
                  disabled={rejectVerification.isPending}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() => approveVerification.mutate({
                    id: selectedRequest.id,
                    notes: adminNotes
                  })}
                  disabled={approveVerification.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {filteredRequests?.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Verification Requests</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No requests match your search criteria.' : 'No verification requests available.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};