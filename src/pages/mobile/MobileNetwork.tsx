import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LinkedInMobileHeader } from '@/components/mobile/LinkedInMobileHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Users, 
  UserPlus, 
  Search,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileNetwork = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['mobile-conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            profiles:user_id(
              id,
              first_name,
              last_name,
              avatar_url,
              title
            )
          ),
          last_message:messages(
            content,
            created_at
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch connection requests
  const { data: connectionRequests = [] } = useQuery({
    queryKey: ['mobile-connection-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch suggested connections
  const { data: suggestedConnections = [] } = useQuery({
    queryKey: ['mobile-suggested-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Get users that are not already connected
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const handleAcceptConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId);

    if (!error) {
      // Refresh connection requests
      // Query will be invalidated automatically
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'rejected' })
      .eq('id', connectionId);

    if (!error) {
      // Refresh connection requests
    }
  };

  const handleSendConnectionRequest = async (userId: string) => {
    const { error } = await supabase
      .from('connections')
        .insert({
          requester_id: user?.id as string,
          recipient_id: userId,
          status: 'pending'
        });

    if (!error) {
      // Refresh suggested connections
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageTime = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <LinkedInMobileHeader showCreatePost={false} />
      
      <div className="px-4 py-4">
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100/80 backdrop-blur-sm">
            <TabsTrigger value="messages" className="rounded-xl">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests
              {connectionRequests.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-red-500 text-white rounded-full">
                  {connectionRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discover" className="rounded-xl">
              <Users className="h-4 w-4 mr-2" />
              Discover
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-4">
            <div className="space-y-4">
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-2xl border-gray-200 bg-white/80 backdrop-blur-sm"
              />

              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-3 pb-20">
                  {conversations.length === 0 ? (
                    <Card className="p-8 text-center rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500 mt-2">Start connecting with professionals</p>
                    </Card>
                  ) : (
                    conversations.map((conversation) => {
                      const otherParticipant = conversation.participants?.find(
                        (p: any) => p.user_id !== user?.id
                      )?.profiles;
                      
                      return (
                        <Card 
                          key={conversation.id}
                          className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                          onClick={() => navigate(`/messages/${conversation.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={otherParticipant?.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                  {otherParticipant?.first_name?.[0]}{otherParticipant?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-semibold text-gray-900 truncate">
                                    {otherParticipant?.first_name} {otherParticipant?.last_name}
                                  </h3>
                                  {conversation.last_message?.[0] && (
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(conversation.last_message[0].created_at)}
                                    </span>
                                  )}
                                </div>
                                {otherParticipant?.title && (
                                  <p className="text-sm text-gray-600 truncate">{otherParticipant.title}</p>
                                )}
                                {conversation.last_message?.[0] && (
                                  <p className="text-sm text-gray-500 truncate mt-1">
                                    {conversation.last_message[0].content}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3 pb-20">
                {connectionRequests.length === 0 ? (
                  <Card className="p-8 text-center rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending requests</p>
                  </Card>
                ) : (
                  connectionRequests.map((request) => (
                    <Card 
                      key={request.id}
                      className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              CN
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              Connection request
                            </h3>
                            <p className="text-sm text-gray-600">
                              Requested by {request.requester_id?.slice(0,8)}...
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                onClick={() => handleAcceptConnection(request.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-2xl border-gray-200"
                                onClick={() => handleRejectConnection(request.id)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="discover" className="mt-4">
            <div className="space-y-4">
              <Input
                placeholder="Search professionals..."
                className="rounded-2xl border-gray-200 bg-white/80 backdrop-blur-sm"
              />

              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-3 pb-20">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Suggested for you</h3>
                  </div>
                  
                  {suggestedConnections.map((person) => (
                    <Card 
                      key={person.id}
                      className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={person.profile_photo_url} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              {(person.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0,2)) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {person.full_name}
                            </h3>
                            {person.headline && (
                              <p className="text-sm text-gray-600">
                                {person.headline}
                              </p>
                            )}
                            <Button
                              size="sm"
                              className="mt-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                              onClick={() => handleSendConnectionRequest(person.id)}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Connect
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};