import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Monitor,
  Hand,
  Settings,
  Phone,
  Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar?: string;
}

interface Participant {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  is_host: boolean;
  is_speaker: boolean;
  hand_raised: boolean;
}

export const LiveEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showChat, setShowChat] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !eventId) {
      navigate('/network');
      return;
    }

    initializeEvent();
    joinEventRoom();

    return () => {
      leaveEvent();
    };
  }, [user, eventId]);

  const initializeEvent = async () => {
    // Load event details
    const { data: eventData, error } = await supabase
      .from('live_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !eventData) {
      toast({
        title: "Event Not Found",
        description: "The live event could not be found",
        variant: "destructive"
      });
      navigate('/network');
      return;
    }

    setEvent(eventData);
    setIsHost(eventData.host_id === user?.id);
  };

  const joinEventRoom = () => {
    if (!user || !eventId) return;

    // Subscribe to real-time updates
    const eventChannel = supabase
      .channel(`live_event_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          const newMsg = payload.new as EventMessage;
          setMessages(prev => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const presenceState = eventChannel.presenceState();
        const activeParticipants = Object.values(presenceState).flat().map((p: any) => ({
          user_id: p.user_id,
          user_name: p.user_name,
          user_avatar: p.user_avatar,
          is_host: p.is_host || false,
          is_speaker: p.is_speaker || false,
          hand_raised: p.hand_raised || false
        }));
        setParticipants(activeParticipants);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await eventChannel.track({
            user_id: user.id,
            user_name: user.email,
            user_avatar: null,
            is_host: isHost,
            is_speaker: false,
            hand_raised: false,
            joined_at: new Date().toISOString(),
          });
        }
      });

    // Load existing messages
    loadEventMessages();
  };

  const loadEventMessages = async () => {
    const { data, error } = await supabase
      .from('event_messages')
      .select(`
        *,
        profiles!event_messages_user_id_fkey(
          full_name,
          profile_picture_url
        )
      `)
      .eq('event_id', eventId)
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
    if (!newMessage.trim() || !user || !eventId) return;

    const { error } = await supabase
      .from('event_messages')
      .insert({
        event_id: eventId,
        user_id: user.id,
        content: newMessage
      });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setNewMessage('');
  };

  const toggleAudio = async () => {
    try {
      if (!isAudioEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Handle audio stream
        setIsAudioEnabled(true);
      } else {
        // Stop audio
        setIsAudioEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to access microphone",
        variant: "destructive"
      });
    }
  };

  const toggleVideo = async () => {
    try {
      if (!isVideoEnabled) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsVideoEnabled(true);
      } else {
        if (localVideoRef.current && localVideoRef.current.srcObject) {
          const stream = localVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          localVideoRef.current.srcObject = null;
        }
        setIsVideoEnabled(false);
      }
    } catch (error) {
      console.error('Error toggling video:', error);
      toast({
        title: "Video Error",
        description: "Failed to access camera",
        variant: "destructive"
      });
    }
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    // Update presence with hand raised status
  };

  const leaveEvent = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/network');
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Event Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{event.title}</h1>
            <p className="text-sm text-gray-300">
              {event.is_live && (
                <Badge variant="destructive" className="animate-pulse mr-2">
                  LIVE
                </Badge>
              )}
              {participants.length} participants
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChat(!showChat)}
              className="text-white"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Host/Speaker Video */}
          <div className="flex-1 bg-gray-800 relative">
            <div className="w-full h-full flex items-center justify-center">
              {isVideoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-white">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{event.host_name}</p>
                  <p className="text-sm opacity-75">Camera is off</p>
                </div>
              )}
            </div>

            {/* Participants Grid */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex gap-2 overflow-x-auto">
                {participants.slice(0, 6).map((participant) => (
                  <div
                    key={participant.user_id}
                    className="flex-shrink-0 w-20 h-20 bg-gray-700 rounded-lg overflow-hidden relative"
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage src={participant.user_avatar} />
                      <AvatarFallback className="text-xs">
                        {participant.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {participant.hand_raised && (
                      <div className="absolute top-1 right-1">
                        <Hand className="h-3 w-3 text-yellow-400" />
                      </div>
                    )}
                    
                    {participant.is_host && (
                      <Badge className="absolute bottom-0 left-0 right-0 text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            <Button
              onClick={toggleHandRaise}
              variant={handRaised ? "default" : "secondary"}
              size="lg"
              className="rounded-full w-12 h-12 p-0"
            >
              <Hand className="h-6 w-6" />
            </Button>

            {isHost && (
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                <Monitor className="h-6 w-6" />
              </Button>
            )}

            <Button
              onClick={leaveEvent}
              variant="destructive"
              size="lg"
              className="rounded-full w-12 h-12 p-0"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <Card className="w-80 rounded-none border-l">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Event Chat
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={message.user_avatar} />
                        <AvatarFallback className="text-xs">
                          {message.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {message.user_name}
                        </p>
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="text-sm"
                  />
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
        )}
      </div>
    </div>
  );
};