import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Monitor, 
  MonitorOff,
  Users,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const VideoCall: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join the video call",
        variant: "destructive"
      });
      navigate('/auth/login');
      return;
    }

    initializeCall();
    
    return () => {
      cleanup();
    };
  }, [user, roomId]);

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsConnected(true);
      
      toast({
        title: "Call Connected",
        description: "You've joined the video call",
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Camera/Microphone Error",
        description: "Failed to access camera or microphone",
        variant: "destructive"
      });
    }
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          initializeCall();
        };
      } else {
        setIsScreenSharing(false);
        initializeCall();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: "Screen Share Error",
        description: "Failed to share screen",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    cleanup();
    navigate('/network');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Video Call</h1>
          <p className="text-sm text-gray-300">Room: {roomId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm">{participants.length + 1} participants</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
          {/* Local Video */}
          <Card className="relative overflow-hidden bg-gray-800">
            <CardContent className="p-0 aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                You {!isVideoEnabled && '(Video Off)'}
              </div>
            </CardContent>
          </Card>

          {/* Remote Video */}
          <Card className="relative overflow-hidden bg-gray-800">
            <CardContent className="p-0 aspect-video flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="text-white text-center">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-50">Waiting for others to join...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
        <Button
          onClick={toggleVideo}
          variant={isVideoEnabled ? "secondary" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>

        <Button
          onClick={toggleAudio}
          variant={isAudioEnabled ? "secondary" : "destructive"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        <Button
          onClick={toggleScreenShare}
          variant={isScreenSharing ? "default" : "secondary"}
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>

        <Button
          onClick={endCall}
          variant="destructive"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
        >
          <Phone className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};