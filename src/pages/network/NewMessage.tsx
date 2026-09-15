
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search, Send, Users, Plus, X, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useConversations } from "@/hooks/useConversations";
import { toast } from "sonner";

const NewMessage = () => {
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(() => {
    return queryUserId ? [queryUserId] : [];
  });
  const [message, setMessage] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const navigate = useNavigate();
  const { findOrCreateConversation } = useConversations();

  useEffect(() => {
    if (queryUserId && !selectedUsers.includes(queryUserId)) {
      setSelectedUsers(prev => prev.includes(queryUserId) ? prev : [...prev, queryUserId]);
    }
  }, [queryUserId]);

  // Search for users
  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ['userSearch', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, email')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!searchTerm.trim()
  });

  // Suggested connections when search is empty
  const { data: suggestedUsers, isLoading: isSuggestedLoading } = useQuery({
    queryKey: ['suggestedUsersForMessaging'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's accepted connections
      const { data: conns } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(40);

      const connIds = Array.from(new Set(
        (conns || []).flatMap(c => [c.requester_id, c.recipient_id]).filter(id => id !== user.id)
      ));

      if (connIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url, title, email')
          .in('id', connIds)
          .limit(25);
        return profiles || [];
      }

      // Fallback: active profiles if no connections yet
      const { data: fallbackProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title, email')
        .neq('id', user.id)
        .not('full_name', 'is', null)
        .limit(10);

      return fallbackProfiles || [];
    }
  });

  const users = searchTerm.trim() ? (searchResults || []) : (suggestedUsers || []);
  const isLoading = searchTerm.trim() ? isSearchLoading : isSuggestedLoading;

  const { data: selectedUserProfiles } = useQuery({
    queryKey: ['selectedUserProfiles', selectedUsers],
    queryFn: async () => {
      if (selectedUsers.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', selectedUsers);

      if (error) throw error;
      return data;
    },
    enabled: selectedUsers.length > 0
  });

  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0 || !message.trim()) {
      toast.error('Please select recipients and enter a message');
      return;
    }

    try {
      // Create or find conversation
      const conversation = await findOrCreateConversation(selectedUsers);
      
      // Send the initial message
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: message,
          message_type: 'text'
        });

      if (error) throw error;

      toast.success('Message sent successfully!');
      navigate(`/network/messages/${conversation.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const generateInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/network/messages" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Message</h1>
              <p className="text-gray-600 mt-1">Start a conversation with your network</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Search */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-base">
                  {searchTerm.trim() ? "Search Results" : "Your Network & Suggestions"}
                </CardTitle>
                <Badge variant="outline" className="text-[11px] font-semibold">
                  {users.length} available
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-xs text-muted-foreground mt-2">Loading connections...</p>
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="divide-y">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user.id)}
                        className={`p-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-muted/40 transition-colors ${
                          selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-950/40 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10 border">
                            <AvatarImage src={user.profile_picture_url} />
                            <AvatarFallback>
                              {generateInitials(user.full_name || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-foreground truncate">
                              {user.full_name || 'Professional User'}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">{user.title || user.email || 'Member'}</p>
                          </div>
                          {selectedUsers.includes(user.id) ? (
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-600 text-xs">
                              Selected
                            </Badge>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-blue-600">
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchTerm.trim() ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No users found for "{searchTerm}"
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No suggestions available. Type to search people.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Compose */}
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              
              {/* Selected Recipients */}
              {selectedUsers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      To: {selectedUsers.length} recipient{selectedUsers.length > 1 ? 's' : ''}
                    </span>
                    {selectedUsers.length > 1 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsGroup(!isGroup)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {isGroup ? 'Individual' : 'Group'} Chat
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedUserProfiles?.map((user) => (
                      <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={user.profile_picture_url} />
                          <AvatarFallback className="text-xs">
                            {generateInitials(user.full_name || '')}
                          </AvatarFallback>
                        </Avatar>
                        {user.full_name || 'User'}
                        <button
                          onClick={() => handleUserSelect(user.id)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>

                  {isGroup && selectedUsers.length > 1 && (
                    <Input
                      placeholder="Group name (optional)"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {message.length}/1000 characters
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={selectedUsers.length === 0 || !message.trim()}
                  className="flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewMessage;
