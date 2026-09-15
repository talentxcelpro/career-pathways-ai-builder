
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Requests = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['connection-requests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status,
          connected_at: status === 'accepted' ? new Date().toISOString() : null
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      toast.success('Request updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update request');
      console.error('Request update error:', error);
    }
  });

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  const getFilteredRequests = async (type: 'received' | 'sent') => {
    if (!requests) return [];
    
    const user = await getCurrentUser();
    if (!user) return [];
    
    return requests.filter(request => {
      if (type === 'received') {
        return request.recipient_id === user.id && request.status === 'pending';
      } else {
        return request.requester_id === user.id;
      }
    });
  };

  const handleRequest = (requestId: string, status: 'accepted' | 'declined') => {
    updateRequestMutation.mutate({ requestId, status });
  };

  const renderRequestCard = (request: any, isReceived: boolean) => {
    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  U
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Anonymous User
                </h3>
                <p className="text-sm text-gray-600">Professional</p>
                <p className="text-xs text-gray-500">Professional Network</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant={
                  request.status === 'accepted' ? 'default' : 
                  request.status === 'pending' ? 'secondary' : 
                  'destructive'
                }
              >
                {request.status}
              </Badge>
              
              {isReceived && request.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequest(request.id, 'accepted')}
                    disabled={updateRequestMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRequest(request.id, 'declined')}
                    disabled={updateRequestMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {request.message && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{request.message}</p>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500">
            {isReceived ? 'Received' : 'Sent'} {new Date(request.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    );
  };

  const [receivedRequests, setReceivedRequests] = React.useState<any[]>([]);
  const [sentRequests, setSentRequests] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadRequests = async () => {
      const received = await getFilteredRequests('received');
      const sent = await getFilteredRequests('sent');
      setReceivedRequests(received);
      setSentRequests(sent);
    };
    
    if (requests) {
      loadRequests();
    }
  }, [requests]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Connection Requests</h1>
          <p className="text-gray-600 mt-2">Manage your incoming and outgoing connection requests</p>
        </div>

        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                      </div>
                      <div className="space-x-2">
                        <div className="h-8 bg-gray-300 rounded w-16 inline-block"></div>
                        <div className="h-8 bg-gray-300 rounded w-16 inline-block"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : receivedRequests.length > 0 ? (
              receivedRequests.map(request => renderRequestCard(request, true))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">You're all caught up! No new connection requests at the moment.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : sentRequests.length > 0 ? (
              sentRequests.map(request => renderRequestCard(request, false))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sent requests</h3>
                  <p className="text-gray-600">Start connecting with professionals to grow your network!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Requests;
