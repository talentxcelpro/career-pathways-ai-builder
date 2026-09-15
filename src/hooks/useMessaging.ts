import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
}

interface ChatContact {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  unreadCount: number;
  lastMessage?: string;
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    fetchContacts();
  }, [user?.id]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(
            id, full_name, headline, company, location, profile_picture_url
          ),
          recipient:profiles!connections_recipient_id_fkey(
            id, full_name, headline, company, location, profile_picture_url
          )
        `)
        .or(`requester_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .eq('status', 'accepted')
        .limit(10);

      if (error) throw error;

      const contactsList = data?.map(connection => {
        const otherUser = connection.requester_id === user?.id 
          ? connection.recipient 
          : connection.requester;
        
        return {
          id: otherUser.id,
          name: otherUser.full_name || 'Unknown User',
          title: otherUser.headline || 'Professional',
          company: otherUser.company || 'Not specified',
          location: otherUser.location || '',
          avatar: otherUser.profile_picture_url,
          isOnline: Math.random() > 0.5, // Simulate online status
          lastSeen: new Date(Date.now() - Math.random() * 86400000),
          unreadCount: Math.floor(Math.random() * 3),
          lastMessage: 'Thanks for connecting!'
        };
      }) || [];

      setContacts(contactsList);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      // In a real implementation, this would fetch from a messages table
      // For now, return mock conversation data
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: contactId,
          senderName: contacts.find(c => c.id === contactId)?.name || 'Contact',
          content: 'Hi! Thanks for connecting. I saw your profile and was impressed by your expertise.',
          timestamp: new Date(Date.now() - 3600000),
          status: 'read',
          type: 'text'
        },
        {
          id: '2',
          senderId: user?.id || 'current-user',
          senderName: 'You',
          content: 'Thank you! I\'d love to learn more about your experience. How did you transition into your current role?',
          timestamp: new Date(Date.now() - 3000000),
          status: 'read',
          type: 'text'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (contactId: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      senderName: 'You',
      content,
      timestamp: new Date(),
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate delivery and read status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'read' as const }
            : msg
        )
      );
    }, 3000);

    // Simulate response
    setTimeout(() => {
      const contact = contacts.find(c => c.id === contactId);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: contactId,
        senderName: contact?.name || 'Contact',
        content: "That's a great question! I'd be happy to share my experience with you.",
        timestamp: new Date(),
        status: 'sent',
        type: 'text'
      };
      setMessages(prev => [...prev, response]);
    }, 5000);
  };

  return {
    contacts,
    messages,
    isLoading,
    fetchMessages,
    sendMessage,
    refreshContacts: fetchContacts
  };
};