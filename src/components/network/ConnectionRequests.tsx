import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Users, Loader2 } from 'lucide-react';
import { useConnectionRequests } from '@/hooks/useConnectionRequests';

export const ConnectionRequests: React.FC = () => {
  const {
    pendingRequests,
    isLoadingPending,
    isProcessing,
    acceptConnectionRequest,
    declineConnectionRequest,
    formatDisplayName,
    generateInitials,
    isAcceptingRequest,
    isDecliningRequest
  } = useConnectionRequests();

  if (isLoadingPending) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" />
            Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-md border-slate-200/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" />
            Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              No pending connection requests at the moment. 
              <br />
              <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => window.location.reload()}>
                Refresh to check for new requests
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-md border-slate-200/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Connection Requests ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {pendingRequests.map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-white/50">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={request.requester?.profile_picture_url}
                    alt={formatDisplayName(request.requester)}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {generateInitials(request.requester)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">
                    {formatDisplayName(request.requester)}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {request.requester?.title || 'Professional'}
                  </p>
                  {request.message && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      "{request.message}"
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Pending
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => acceptConnectionRequest(request.id)}
                  disabled={isProcessing === request.id || isAcceptingRequest || isDecliningRequest}
                >
                  {(isProcessing === request.id && isAcceptingRequest) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <UserCheck className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => declineConnectionRequest(request.id)}
                  disabled={isProcessing === request.id || isAcceptingRequest || isDecliningRequest}
                >
                  {(isProcessing === request.id && isDecliningRequest) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <UserX className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};