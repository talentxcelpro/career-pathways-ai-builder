
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConversationsListProps {
  conversations: any[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  setSearchTerm,
  isLoading
}) => {
  // Get user profiles for conversation participants
  const { data: userProfiles } = useQuery({
    queryKey: ['conversationProfiles', conversations],
    queryFn: async () => {
      if (!conversations || conversations.length === 0) return {};

      const userIds = conversations.map(conv => conv.userId).filter(Boolean);
      if (userIds.length === 0) return {};

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching conversation profiles:', error);
        return {};
      }

      return profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: conversations && conversations.length > 0
  });

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Messages
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <div className="divide-y">
              {conversations.map((conversation) => {
                const profile = userProfiles?.[conversation.userId];
                const isSelected = selectedConversation === conversation.userId;
                
                return (
                  <div
                    key={conversation.userId}
                    onClick={() => onSelectConversation(conversation.userId)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={profile?.profile_picture_url} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {generateInitials(profile)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {formatDisplayName(profile)}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1 truncate">
                          {profile?.title || 'Professional'}
                        </p>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600">Start connecting with your network to begin messaging</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
