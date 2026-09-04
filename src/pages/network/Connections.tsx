import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserCheck, UserPlus, MessageCircle, UserX, Search, Filter, Calendar, Building2, MapPin, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import { useRealtimeConnections } from '@/hooks/useRealtimeConnections';

const Connections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const queryClient = useQueryClient();

  // Set up live real-time synchronization with Supabase
  useEffect(() => {
    const channel = supabase
      .channel('connections-live-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, () => {
        queryClient.invalidateQueries({ queryKey: ['userConnections'] });
        queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
        queryClient.invalidateQueries({ queryKey: ['pendingRequestsCount'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'connection_requests' }, () => {
        queryClient.invalidateQueries({ queryKey: ['userConnections'] });
        queryClient.invalidateQueries({ queryKey: ['pendingRequestsCount'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['userMessagesCount'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch live messages count directly from database
  const { data: messagesCount = 0 } = useQuery({
    queryKey: ['userMessagesCount'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching messages count:', error);
        return 0;
      }
      return count || 0;
    }
  });

  // Fetch pending connection requests count
  const { data: pendingRequestsCount = 0 } = useQuery({
    queryKey: ['pendingRequestsCount'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (error) return 0;
      return count || 0;
    }
  });

  // Use the enhanced realtime connections hook
  const { 
    users: connections, 
    loading: connectionsLoading, 
    stats,
    showOnlineOnly,
    setShowOnlineOnly,
    getLastSeenText 
  } = useRealtimeConnections();

  // Fetch user's actual connections
  const { data: userConnections, isLoading: userConnectionsLoading } = useQuery({
    queryKey: ['userConnections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: connectionsData, error } = await supabase
        .from('connections')
        .select(`
          id,
          requester_id,
          recipient_id,
          status,
          connected_at,
          created_at,
          message
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('connected_at', { ascending: false });

      if (error) throw error;

      // Get other user IDs and fetch their profiles
      const otherUserIds = connectionsData.map(conn => 
        conn.requester_id === user.id ? conn.recipient_id : conn.requester_id
      ).filter(Boolean);

      if (otherUserIds.length === 0) return [];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          title, 
          profile_picture_url, 
          headline,
          location,
          current_company,
          is_online,
          last_seen,
          skills
        `)
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
            headline: null,
            location: null,
            current_company: null,
            is_online: false,
            last_seen: null,
            skills: []
          }
        };
      });
    }
  });

  // Remove connection mutation
  const removeConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userConnections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
      toast.success('Connection removed successfully');
    },
    onError: (error) => {
      console.error('Error removing connection:', error);
      toast.error('Failed to remove connection');
    }
  });

  const handleRemoveConnection = (connectionId: string) => {
    removeConnectionMutation.mutate(connectionId);
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

  // Enhanced filtering and sorting
  const filteredAndSortedConnections = userConnections
    ?.filter(conn => {
      if (!searchTerm && filterBy === 'all' && !showOnlineOnly) return true;
      
      const user = conn.otherUser;
      const name = formatDisplayName(user).toLowerCase();
      const title = user?.title?.toLowerCase() || '';
      const company = user?.current_company?.toLowerCase() || '';
      const location = user?.location?.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = !searchTerm || 
        name.includes(search) || 
        title.includes(search) || 
        company.includes(search) || 
        location.includes(search);
      
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'recent' && new Date(conn.connected_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
        (filterBy === 'same_company' && user.current_company === userConnections?.[0]?.otherUser?.current_company);
      
      const matchesOnline = !showOnlineOnly || user.is_online;
      
      return matchesSearch && matchesFilter && matchesOnline;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return formatDisplayName(a.otherUser).localeCompare(formatDisplayName(b.otherUser));
        case 'recent':
          return new Date(b.connected_at).getTime() - new Date(a.connected_at).getTime();
        case 'online':
          return Number(b.otherUser.is_online) - Number(a.otherUser.is_online);
        default:
          return new Date(b.connected_at).getTime() - new Date(a.connected_at).getTime();
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Connections</h1>
          <p className="text-gray-600">Manage and explore your professional network</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{userConnections?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Online Now</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userConnections?.filter(c => c.otherUser.is_online).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userConnections?.filter(c => 
                      new Date(c.connected_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Link to="/network/messages" className="flex items-center hover:opacity-80 transition-opacity">
                <MessageCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{messagesCount}</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Alert Banner */}
        {pendingRequestsCount > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full text-blue-700">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-blue-900">
                  {pendingRequestsCount} pending connection request{pendingRequestsCount > 1 ? 's' : ''} waiting for your response
                </p>
                <p className="text-xs text-blue-700">
                  Accept or decline requests to grow your professional executive network.
                </p>
              </div>
            </div>
            <Link to="/network/requests">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Review Requests ({pendingRequestsCount})
              </Button>
            </Link>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search connections by name, title, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="online">Online Status</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Connections</SelectItem>
                    <SelectItem value="recent">Recent (30 days)</SelectItem>
                    <SelectItem value="same_company">Same Company</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showOnlineOnly ? "default" : "outline"}
                  onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                  size="sm"
                >
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                  Online Only
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connections Grid — compact avatar view, 8-10 per row */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Your Network ({filteredAndSortedConnections?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userConnectionsLoading ? (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="h-2 w-10 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredAndSortedConnections?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || filterBy !== 'all' || showOnlineOnly ? 'No matching connections' : 'No connections yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterBy !== 'all' || showOnlineOnly
                    ? 'Try adjusting your filters or search terms'
                    : 'Start building your professional network by connecting with colleagues'
                  }
                </p>
                <Link to="/network/people">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Discover People
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {filteredAndSortedConnections?.map((connection) => (
                  <div
                    key={connection.id}
                    className="group relative flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar + online indicator */}
                    <div className="relative">
                      <Link to={`/network/people/${connection.otherUser.id}`}>
                        <Avatar className="h-11 w-11 hover:scale-105 transition-transform ring-2 ring-transparent group-hover:ring-blue-200">
                          <AvatarImage src={connection.otherUser.profile_picture_url} />
                          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                            {generateInitials(connection.otherUser)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      {connection.otherUser.is_online && (
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* First name */}
                    <p className="text-[11px] font-medium text-gray-800 text-center leading-tight truncate w-full">
                      {formatDisplayName(connection.otherUser).split(' ')[0]}
                    </p>

                    {/* Title — very small, hidden on very small screens */}
                    {connection.otherUser.title && (
                      <p className="text-[9px] text-gray-400 text-center leading-tight truncate w-full hidden sm:block">
                        {connection.otherUser.title}
                      </p>
                    )}

                    {/* Hover action buttons — centred overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl bg-white/85">
                      <Link to={`/network/messages/new?userId=${connection.otherUser.id}`}>
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0 rounded-full shadow border-blue-200 text-blue-600">
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full shadow border-red-100 text-red-500 hover:text-red-600"
                        onClick={() => handleRemoveConnection(connection.id)}
                      >
                        <UserX className="h-3 w-3" />
                      </Button>
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

export default Connections;