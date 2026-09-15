import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, MicOff, VideoOff, Phone, PhoneOff, Users, Settings, MoreVertical, MessageCircle, Hand, Share2 } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { toast } from 'sonner';

interface LiveNetworkingEvent {
  id: string;
  title: string;
  host: {
    id: string;
    name: string;
    avatar: string;
    title: string;
  };
  participants: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    isMuted: boolean;
    isVideoOn: boolean;
    isHandRaised: boolean;
    isPresenting: boolean;
  }[];
  type: 'presentation' | 'discussion' | 'networking' | 'interview';
  category: 'career' | 'tech' | 'business' | 'startup';
  duration: string;
  maxParticipants: number;
  isLive: boolean;
  isRecording: boolean;
  chatEnabled: boolean;
  breakoutRooms: boolean;
}

interface LiveNetworkingProps {
  className?: string;
}

export const LiveNetworking: React.FC<LiveNetworkingProps> = ({ className = '' }) => {
  const [currentEvent, setCurrentEvent] = useState<LiveNetworkingEvent>({
    id: '1',
    title: 'Professional Networking Session',
    host: {
      id: 'host1',
      name: 'Host',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
      title: 'Session Host'
    },
    participants: [
      // Empty array - will be populated with real participants
    ],
    type: 'discussion',
    category: 'tech',
    duration: '45 min',
    maxParticipants: 20,
    isLive: true,
    isRecording: true,
    chatEnabled: true,
    breakoutRooms: false
  });

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    // Empty array - will be populated with real chat messages
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { triggerHaptic } = useHapticFeedback();
  const { sync, isOnline } = useRealtimeSync();

  useEffect(() => {
    // Initialize video stream
    if (videoRef.current && isVideoOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(error => {
          console.error('Error accessing media devices:', error);
          toast.error('Unable to access camera/microphone');
        });
    }
  }, [isVideoOn]);

  const toggleVideo = async () => {
    triggerHaptic('light');
    setIsVideoOn(!isVideoOn);
    await sync('networking', { action: 'toggle_video', eventId: currentEvent.id, videoOn: !isVideoOn });
  };

  const toggleMute = async () => {
    triggerHaptic('light');
    setIsMuted(!isMuted);
    await sync('networking', { action: 'toggle_mute', eventId: currentEvent.id, muted: !isMuted });
  };

  const raiseHand = async () => {
    triggerHaptic('medium');
    setIsHandRaised(!isHandRaised);
    await sync('networking', { action: 'raise_hand', eventId: currentEvent.id, handRaised: !isHandRaised });
    toast.success(isHandRaised ? 'Hand lowered' : 'Hand raised');
  };

  const leaveEvent = async () => {
    triggerHaptic('success');
    await sync('networking', { action: 'leave', eventId: currentEvent.id });
    toast.success('Left the networking event');
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setChatMessage('');
    await sync('networking', { action: 'send_message', eventId: currentEvent.id, message: newMessage });
  };

  const getCategoryColor = (category: LiveNetworkingEvent['category']) => {
    switch (category) {
      case 'tech': return 'bg-blue-100 text-blue-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'career': return 'bg-purple-100 text-purple-800';
      case 'startup': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`h-full bg-black ${className}`}>
      {/* Event Header */}
      <div className="bg-black/80 backdrop-blur-sm text-white p-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <Badge className={getCategoryColor(currentEvent.category)}>
                {currentEvent.category}
              </Badge>
              {currentEvent.isRecording && (
                <Badge className="bg-red-100 text-red-800">
                  Recording
                </Badge>
              )}
            </div>
            <h2 className="text-sm font-semibold truncate">{currentEvent.title}</h2>
            <p className="text-xs text-white/70">
              Hosted by {currentEvent.host.name} • {currentEvent.participants.length + 1}/{currentEvent.maxParticipants} participants
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Host/Presenter View */}
        <div className="relative w-full h-64 bg-gray-800">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-2 py-1">
            <p className="text-white text-xs font-medium">{currentEvent.host.name}</p>
            <p className="text-white/70 text-xs">{currentEvent.host.title}</p>
          </div>
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/api/placeholder/64/64" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  You
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Participants Grid */}
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {currentEvent.participants.map(participant => (
              <div key={participant.id} className="relative bg-gray-800 rounded-lg aspect-video">
                {participant.isVideoOn ? (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {participant.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="bg-gray-600 text-white text-xs">
                        {participant.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                {/* Participant Status */}
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-black/60 rounded px-1 py-0.5">
                    <p className="text-white text-xs truncate">{participant.name.split(' ')[0]}</p>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="absolute top-1 right-1 flex space-x-1">
                  {participant.isMuted && (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <MicOff className="w-2 h-2 text-white" />
                    </div>
                  )}
                  {participant.isHandRaised && (
                    <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Hand className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/90 backdrop-blur-sm p-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className={`rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVideo}
            className={`rounded-full ${!isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={raiseHand}
            className={`rounded-full ${isHandRaised ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-white/20 hover:bg-white/30'} text-white`}
          >
            <Hand className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={leaveEvent}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat Overlay */}
      {showChat && (
        <div className="absolute right-0 top-16 bottom-20 w-80 bg-background border-l border-border shadow-lg z-20">
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">Event Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className="text-xs">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="font-medium text-foreground">{msg.user}</span>
                    <span className="text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-border">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={!chatMessage.trim()}
                  className="text-xs"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};