
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCompanyAccessRequests } from '@/hooks/useCompanyAccessRequests';
import { Users, Building2, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';

export const CompanyAccessRequests = () => {
  const {
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
  } = useCompanyAccessRequests();

  const [requestMessage, setRequestMessage] = useState('');
  const [requestedRole, setRequestedRole] = useState('recruiter');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);

  const handleSubmitRequest = () => {
    if (!selectedCompanyId) return;

    submitRequest.mutate({
      companyId: selectedCompanyId,
      requestedRole,
      message: requestMessage
    });
  };

  const handleApprove = (requestId: string) => {
    approveRequest.mutate(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectRequest.mutate({
      requestId,
      reason: rejectReason
    });
    setShowRejectDialog(null);
    setRejectReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Request Access to Company */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Request Company Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company">Select Company</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a company" />
              </SelectTrigger>
              <SelectContent>
                {availableCompanies?.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Requested Role</Label>
            <Select value={requestedRole} onValueChange={setRequestedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Why do you want to join this company's hiring team?"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSubmitRequest}
            disabled={!selectedCompanyId || submitRequest.isPending}
            className="w-full"
          >
            {submitRequest.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            My Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMyRequests ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : myRequests && myRequests.length > 0 ? (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Company Access Request</h4>
                      <p className="text-sm text-gray-600">
                        Role: {request.requested_role}
                      </p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  {request.request_message && (
                    <p className="text-sm text-gray-600 mb-2">
                      "{request.request_message}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  {request.rejection_reason && (
                    <p className="text-sm text-red-600 mt-2">
                      Rejection reason: {request.rejection_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No requests found</p>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests (for company admins) */}
      {pendingRequests && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pending Team Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPendingRequests ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">{request.requester_email}</h4>
                        <p className="text-sm text-gray-600">
                          Requesting: {request.requested_role}
                        </p>
                        <p className="text-sm text-gray-600">
                          Domain: {request.company_domain}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    
                    {request.request_message && (
                      <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm">{request.request_message}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={approveRequest.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Dialog open={showRejectDialog === request.id} onOpenChange={(open) => setShowRejectDialog(open ? request.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Label htmlFor="reject-reason">Reason for rejection (optional)</Label>
                            <Textarea
                              id="reject-reason"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Provide a reason for rejection..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleReject(request.id)}
                                disabled={rejectRequest.isPending}
                                variant="destructive"
                              >
                                Reject Request
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowRejectDialog(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
