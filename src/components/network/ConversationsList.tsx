
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Users, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConversationsListProps {
  conversations: any[];
  searchTerm?: string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  searchTerm = ''
}) => {
  // Get user profiles for conversation participants
  const { data: userProfiles } = useQuery({
    queryKey: ['conversationProfiles', conversations],
    queryFn: async () => {
      if (!conversations || conversations.length === 0) return {};

      const allParticipantIds = conversations.flatMap(conv => conv.participants || []);
      const uniqueIds = [...new Set(allParticipantIds)];
      
      if (uniqueIds.length === 0) return {};

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', uniqueIds);

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

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  const getConversationDisplay = (conversation: any) => {
    const currentUserId = getCurrentUser();
    
    if (conversation.is_group) {
      return {
        name: conversation.name || 'Group Chat',
        avatar: null,
        isGroup: true
      };
    }

    // For 1:1 conversations, show the other participant
    const otherParticipant = conversation.participants?.find((id: string) => id !== currentUserId);
    const profile = userProfiles?.[otherParticipant];
    
    return {
      name: profile?.full_name || 'Professional User',
      avatar: profile?.profile_picture_url,
      title: profile?.title,
      isGroup: false
    };
  };

  const generateInitials = (name: string) => {
    if (!name || name === 'Professional User') return 'PU';
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    
    const display = getConversationDisplay(conv);
    const lastMessage = conv.messages?.[0];
    
    return (
      display.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <ScrollArea className="h-[600px]">
      <div className="divide-y">
        {filteredConversations.map((conversation) => {
          const display = getConversationDisplay(conversation);
          const lastMessage = conversation.messages?.[0];
          const hasUnread = false; // This would need proper unread logic
          
          return (
            <Link
              key={conversation.id}
              to={`/network/messages/${conversation.id}`}
              className="block p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={display.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {display.isGroup ? <Users className="h-6 w-6" /> : generateInitials(display.name)}
                    </AvatarFallback>
                  </Avatar>
                  {hasUnread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {display.name}
                      </h3>
                      {display.isGroup && (
                        <Badge variant="secondary" className="text-xs">
                          {conversation.participants?.length || 0}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {lastMessage ? formatTime(lastMessage.created_at) : formatTime(conversation.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  {!display.isGroup && display.title && (
                    <p className="text-sm text-gray-600 mb-1 truncate">
                      {display.title}
                    </p>
                  )}
                  
                  {lastMessage && (
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 truncate flex-1">
                        {lastMessage.message_type === 'text' 
                          ? lastMessage.content 
                          : `📎 ${lastMessage.message_type}`
                        }
                      </p>
                      {hasUnread && (
                        <Badge variant="default" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          3
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </ScrollArea>
  );
};
