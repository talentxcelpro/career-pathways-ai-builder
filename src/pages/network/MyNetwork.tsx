import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, UserPlus, MessageCircle, UserX, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from 'react-router-dom';

const MyNetwork = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch connected users
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['myConnections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('connected_at', { ascending: false });

      if (error) throw error;

      // Get other user IDs
      const otherUserIds = connectionsData.map(conn => 
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      ).filter(Boolean);

      if (otherUserIds.length === 0) return [];

      // Fetch profiles for other users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, headline')
        .in('id', otherUserIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return connectionsData.map(conn => {
        const otherUserId = conn.requester_id === user.id ? conn.recipient_id : conn.requester_id;
        return {
          ...conn,
          otherUser: profilesMap.get(otherUserId) || {
            id: otherUserId,
            full_name: 'Unknown User',
            title: 'Professional',
            profile_picture_url: null,
            headline: null
          }
        };
      });
    }
  });

  // Fetch pending connection requests (received)
  const { data: pendingRequests, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingConnectionRequests'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: requestsData, error } = await supabase
        .from('connections')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (requestsData.length === 0) return [];

      // Get requester IDs
      const requesterIds = requestsData.map(req => req.requester_id).filter(Boolean);

      // Fetch profiles for requesters
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, headline')
        .in('id', requesterIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return requestsData.map(req => ({
        ...req,
        requester: profilesMap.get(req.requester_id) || {
          id: req.requester_id,
          full_name: 'Unknown User',
          title: 'Professional',
          profile_picture_url: null,
          headline: null
        }
      }));
    }
  });

  // Accept connection request mutation
  const acceptConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status: 'accepted', 
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myConnections'] });
      queryClient.invalidateQueries({ queryKey: ['pendingConnectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
      toast.success('Connection request accepted!');
    },
    onError: (error) => {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection request');
    }
  });

  // Decline connection request mutation
  const declineConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status: 'declined',
          updated_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingConnectionRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
      toast.success('Connection request declined');
    },
    onError: (error) => {
      console.error('Error declining connection:', error);
      toast.error('Failed to decline connection request');
    }
  });

  const handleAccept = (connectionId: string) => {
    acceptConnectionMutation.mutate(connectionId);
  };

  const handleDecline = (connectionId: string) => {
    declineConnectionMutation.mutate(connectionId);
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  // Filter connections based on search term
  const filteredConnections = connections?.filter(conn => {
    if (!searchTerm) return true;
    const name = formatDisplayName(conn.otherUser).toLowerCase();
    const title = conn.otherUser?.title?.toLowerCase() || '';
    const headline = conn.otherUser?.headline?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || title.includes(search) || headline.includes(search);
  });

  const filteredPendingRequests = pendingRequests?.filter(request => {
    if (!searchTerm) return true;
    const name = formatDisplayName(request.requester).toLowerCase();
    const title = request.requester?.title?.toLowerCase() || '';
    const headline = request.requester?.headline?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || title.includes(search) || headline.includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-gray-600">Manage your professional connections and requests</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your network..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Connections
              {connections && (
                <Badge variant="secondary" className="ml-1">
                  {connections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Pending Requests
              {pendingRequests && pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Connected Users Tab */}
          <TabsContent value="connections" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Connected Professionals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {connectionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConnections?.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'No matching connections' : 'No connections yet'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'Start building your professional network by connecting with colleagues'
                      }
                    </p>
                    {!searchTerm && (
                      <Link to="/network/people">
                        <Button>
                          <Users className="h-4 w-4 mr-2" />
                          Discover People
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredConnections?.map((connection) => (
                      <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Link to={`/network/people/${connection.otherUser.id}`}>
                            <Avatar className="cursor-pointer hover:scale-105 transition-transform">
                              <AvatarImage src={connection.otherUser.profile_picture_url} />
                              <AvatarFallback>
                                {generateInitials(connection.otherUser)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <Link 
                              to={`/network/people/${connection.otherUser.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              <h4 className="font-semibold text-gray-900">
                                {formatDisplayName(connection.otherUser)}
                              </h4>
                            </Link>
                            {connection.otherUser.title && (
                              <p className="text-sm text-gray-600">{connection.otherUser.title}</p>
                            )}
                            {connection.otherUser.headline && (
                              <p className="text-xs text-gray-500 mt-1">{connection.otherUser.headline}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Connected {new Date(connection.connected_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link to="/network/messages">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Pending Connection Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-20 h-8 bg-gray-300 rounded"></div>
                          <div className="w-20 h-8 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPendingRequests?.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'No matching requests' : 'No pending requests'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'You\'re all caught up! No new connection requests at the moment.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPendingRequests?.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Link to={`/network/people/${request.requester.id}`}>
                            <Avatar className="cursor-pointer hover:scale-105 transition-transform">
                              <AvatarImage src={request.requester.profile_picture_url} />
                              <AvatarFallback>
                                {generateInitials(request.requester)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <Link 
                              to={`/network/people/${request.requester.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              <h4 className="font-semibold text-gray-900">
                                {formatDisplayName(request.requester)}
                              </h4>
                            </Link>
                            {request.requester.title && (
                              <p className="text-sm text-gray-600">{request.requester.title}</p>
                            )}
                            {request.requester.headline && (
                              <p className="text-xs text-gray-500 mt-1">{request.requester.headline}</p>
                            )}
                            {request.message && (
                              <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded italic">
                                "{request.message}"
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Requested {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            disabled={acceptConnectionMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDecline(request.id)}
                            disabled={declineConnectionMutation.isPending}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyNetwork;