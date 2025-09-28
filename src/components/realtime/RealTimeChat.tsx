import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile,
  Users,
  MoreVertical 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'voice' | 'file';
  created_at: string;
  user_name: string;
  user_avatar?: string;
}

export const RealTimeChat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !chatId) return;

    // Subscribe to real-time messages
    const messagesChannel = supabase
      .channel(`chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = messagesChannel.presenceState();
        const users = Object.keys(presenceState).map(key => (presenceState[key][0] as any)?.user_id).filter(Boolean);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await messagesChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Load initial messages
    loadMessages();

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [user, chatId]);

  const loadMessages = async () => {
    if (!chatId) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_user_id_fkey(
          full_name,
          profile_picture_url
        )
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    const formattedMessages = data.map(msg => ({
      ...msg,
      user_name: msg.profiles?.full_name || 'Unknown User',
      user_avatar: msg.profiles?.profile_picture_url
    }));

    setMessages(formattedMessages);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !chatId) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: user.id,
        content: newMessage,
        message_type: 'text'
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return;
    }

    setNewMessage('');
    stopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing status via real-time
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        // Here you would upload the audio and send it as a voice message
        toast({
          title: "Voice Message",
          description: "Voice message recording completed (upload feature pending)",
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start voice recording",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Real-time Chat</CardTitle>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {onlineUsers.length} online
              </span>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.user_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.user_id !== user?.id && (
              <UserAvatar 
                src={message.user_avatar}
                userName={message.user_name}
                size="sm"
              />
            )}
            
            <div className={`max-w-[70%] ${message.user_id === user?.id ? 'text-right' : ''}`}>
              {message.user_id !== user?.id && (
                <p className="text-xs text-muted-foreground mb-1">
                  {message.user_name}
                </p>
              )}
              
              <div
                className={`rounded-lg px-3 py-2 ${
                  message.user_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </p>
            </div>

            {message.user_id === user?.id && (
              <UserAvatar 
                src={message.user_avatar}
                userName={message.user_name}
                size="sm"
              />
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3 justify-start">
            <UserAvatar 
              userName="..."
              size="sm"
            />
            <div className="bg-muted rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-t">
        <CardContent className="p-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="resize-none"
              />
            </div>
            
            <div className="flex gap-1">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <Smile className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={startVoiceRecording}
                onMouseUp={stopVoiceRecording}
                className={isRecording ? 'bg-red-100 text-red-600' : ''}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};