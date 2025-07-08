import React, { useState } from 'react';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PermissionRequest } from '@/types/team';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  requiredPermission: string;
  companyId: string;
  fallbackMessage?: string;
  showRequestOption?: boolean;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  requiredPermission,
  companyId,
  fallbackMessage = "You don't have permission to access this feature.",
  showRequestOption = true,
}) => {
  const { hasPermission, requiresApproval, requestPermission, role } = useTeamPermissions(companyId);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const { toast } = useToast();

  // If user has permission, show the content
  if (hasPermission(requiredPermission)) {
    return <>{children}</>;
  }

  // If permission requires approval and user wants to request it
  const canRequest = requiresApproval(requiredPermission) && showRequestOption;

  const handleRequestPermission = async () => {
    if (!requestReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for your request.",
        variant: "destructive",
      });
      return;
    }

    try {
      await requestPermission.mutateAsync({
        permissionType: requiredPermission,
        reason: requestReason,
      });

      toast({
        title: "Request submitted",
        description: "Your permission request has been sent to the company owner.",
      });

      setIsRequestDialogOpen(false);
      setRequestReason('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit permission request.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <Lock className="h-6 w-6 text-orange-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-2">Access Restricted</h3>
            <p className="text-orange-800 mb-4">{fallbackMessage}</p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  Your Role: {role?.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-orange-700 border-orange-300">
                  Required: {requiredPermission.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>

              {canRequest && (
                <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                      <Shield className="h-4 w-4 mr-2" />
                      Request Access
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Permission</DialogTitle>
                      <DialogDescription>
                        Request access to {requiredPermission.replace(/_/g, ' ')} from your company owner.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Reason for request</label>
                        <Textarea
                          placeholder="Please explain why you need this permission..."
                          value={requestReason}
                          onChange={(e) => setRequestReason(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsRequestDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRequestPermission}
                        disabled={requestPermission.isPending}
                      >
                        {requestPermission.isPending ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PermissionRequestsManager: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { permissionRequests, handlePermissionRequest, hasPermission } = useTeamPermissions(companyId);
  const { toast } = useToast();

  if (!hasPermission('approve_permissions')) {
    return null;
  }

  const handleRequest = async (requestId: string, action: 'approved' | 'rejected', reason?: string) => {
    try {
      await handlePermissionRequest.mutateAsync({ requestId, action, reason });
      toast({
        title: `Request ${action}`,
        description: `Permission request has been ${action}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      });
    }
  };

  const pendingRequests = permissionRequests?.filter(req => req.status === 'pending') || [];

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Pending Permission Requests ({pendingRequests.length})
        </CardTitle>
        <CardDescription>
          Review and approve access requests from your team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{(request as PermissionRequest).requester?.full_name || (request as PermissionRequest).requester?.email}</h4>
                    <Badge variant="outline">
                      {request.permission_type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{request.reason}</p>
                  <p className="text-xs text-gray-500">
                    Requested {new Date(request.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, 'approved')}
                    disabled={handlePermissionRequest.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRequest(request.id, 'rejected')}
                    disabled={handlePermissionRequest.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
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