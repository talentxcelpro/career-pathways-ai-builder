import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  metadata?: Record<string, any>;
  is_read: boolean;
  sender_name?: string;
  sender_avatar?: string;
}

export interface ChatRoom {
  id: string;
  participant_ids: string[];
  room_type: 'direct' | 'group' | 'mentorship';
  room_name?: string;
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export const useRealTimeChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const channelRef = useRef<any>(null);

  const connectToRoom = useCallback(async (roomId: string) => {
    if (!user) return;

    setIsLoading(true);
    setActiveRoom(roomId);

    try {
      // Disconnect from previous channel
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
      }

      // Connect to new room channel
      channelRef.current = supabase
        .channel(`chat_room_${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        }, (payload) => {
          console.log('💬 New message received:', payload);
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        })
        .on('presence', { event: 'sync' }, () => {
          const newState = channelRef.current.presenceState();
          console.log('👥 Presence sync:', newState);
        })
        .on('broadcast', { event: 'typing' }, (payload) => {
          console.log('⌨️ Typing indicator:', payload);
          const { user_id, is_typing } = payload.payload;
          setIsTyping(prev => ({ ...prev, [user_id]: is_typing }));
        })
        .subscribe();

      // Load existing messages
      const { data: existingMessages, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name, profile_picture_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      setMessages(existingMessages || []);
      console.log('✅ Connected to chat room:', roomId);

    } catch (err: any) {
      console.error('❌ Failed to connect to chat room:', err);
      toast.error('Failed to connect to chat');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string, roomId: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        content: content.trim(),
        sender_id: user.id,
        room_id: roomId,
        message_type: messageType,
        created_at: new Date().toISOString()
      });

      if (error) throw error;
      console.log('📨 Message sent successfully');

    } catch (err: any) {
      console.error('❌ Failed to send message:', err);
      toast.error('Failed to send message');
    }
  }, [user]);

  const createDirectChat = useCallback(async (recipientId: string) => {
    if (!user) return null;

    try {
      // Check if direct chat already exists
      const { data: existingRoom, error: checkError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('room_type', 'direct')
        .contains('participant_ids', [user.id, recipientId])
        .single();

      if (existingRoom) {
        return existingRoom.id;
      }

      // Create new direct chat room
      const { data: newRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          participant_ids: [user.id, recipientId],
          room_type: 'direct',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Direct chat created:', newRoom.id);
      return newRoom.id;

    } catch (err: any) {
      console.error('❌ Failed to create direct chat:', err);
      toast.error('Failed to create chat');
      return null;
    }
  }, [user]);

  const loadChatRooms = useCallback(async () => {
    if (!user) return;

    try {
      const { data: rooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          last_message:chat_messages(*)
        `)
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setChatRooms(rooms || []);
      console.log('✅ Chat rooms loaded:', rooms?.length);

    } catch (err: any) {
      console.error('❌ Failed to load chat rooms:', err);
      toast.error('Failed to load chats');
    }
  }, [user]);

  const sendTypingIndicator = useCallback((roomId: string, isTyping: boolean) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id, is_typing: isTyping }
      });
    }
  }, [user]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadChatRooms();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, loadChatRooms]);

  return {
    messages,
    chatRooms,
    activeRoom,
    isLoading,
    isTyping,
    connectToRoom,
    sendMessage,
    createDirectChat,
    loadChatRooms,
    sendTypingIndicator,
    markAsRead
  };
};