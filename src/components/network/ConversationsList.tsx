
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConversationItem } from './ConversationItem';

interface ConversationsListProps {
  conversations: any[];
  searchTerm?: string;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  searchTerm = ''
}) => {
  // Get current user ID
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    }
  });

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

  const getConversationDisplay = (conversation: any) => {
    if (!currentUser) {
      console.log('No current user for conversation display');
      return { name: 'Loading...', avatar: null, isGroup: false };
    }
    
    console.log('Processing conversation:', conversation.id, 'participants:', conversation.participants);
    console.log('Available user profiles:', userProfiles);
    
    if (conversation.is_group) {
      return {
        name: conversation.name || 'Group Chat',
        avatar: null,
        isGroup: true
      };
    }

    // For 1:1 conversations, show the other participant
    const otherParticipant = conversation.participants?.find((id: string) => id !== currentUser);
    console.log('Other participant ID:', otherParticipant);
    const profile = userProfiles?.[otherParticipant];
    console.log('Found profile for participant:', profile);
    
    return {
      name: profile?.full_name || `Professional User (${otherParticipant?.slice(0, 8) || 'Unknown'})`,
      avatar: profile?.profile_picture_url,
      title: profile?.title,
      isGroup: false
    };
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

  if (!currentUser) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading conversations...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="divide-y">
        {filteredConversations.map((conversation) => {
          const display = getConversationDisplay(conversation);
          const lastMessage = conversation.messages?.[0];
          const hasUnread = false; // This would need proper unread logic
          
          return (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              displayName={display.name}
              displayAvatar={display.avatar}
              displayTitle={display.title}
              isGroup={display.isGroup}
              lastMessage={lastMessage}
              hasUnread={hasUnread}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
};
