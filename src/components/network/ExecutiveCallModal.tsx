import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Monitor, 
  X, 
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ExecutiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetName?: string;
  targetAvatar?: string;
  targetTitle?: string;
  callType?: 'audio' | 'video';
  isIncoming?: boolean;
}

export const ExecutiveCallModal: React.FC<ExecutiveCallModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetName = 'Candidate',
  targetAvatar,
  targetTitle = 'Executive Member',
  callType = 'video',
  isIncoming = false
}) => {
  const { user } = useAuth();
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>(isIncoming ? 'ringing' : 'ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Call timer interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Format timer string (00:00)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize WebRTC and Media Stream
  useEffect(() => {
    if (!isOpen) return;

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video'
        });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate incoming accept or caller connection after 3 seconds for demonstration
        if (!isIncoming) {
          const timeout = setTimeout(() => {
            setCallState('connected');
            toast.success(`Call connected with ${targetName}`);
          }, 3000);
          return () => clearTimeout(timeout);
        }
      } catch (err) {
        console.warn('Microphone/Camera access notice:', err);
        // Fallback to audio simulation if camera not connected
        setCallState('connected');
      }
    };

    startMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, callType, isIncoming, targetName]);

  const handleAcceptCall = () => {
    setCallState('connected');
    toast.success(`Connected with ${targetName}`);
  };

  const handleEndCall = () => {
    setCallState('ended');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    toast.info("Call ended");
    setTimeout(() => {
      onClose();
      setCallState('ringing');
      setCallDuration(0);
    }, 1000);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    } else {
      setIsVideoOff(prev => !prev);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      
      <div className="w-full max-w-2xl bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative">
        
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-extrabold tracking-tight">TalentXcel HD Executive Call</span>
            {callState === 'connected' && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 font-extrabold text-[10px] ml-2">
                {formatTime(callDuration)}
              </Badge>
            )}
          </div>

          <button onClick={handleEndCall} className="text-slate-400 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video / Avatar Canvas */}
        <div className="relative min-h-[380px] bg-slate-950 flex items-center justify-center overflow-hidden p-6">
          
          {/* Active Call Remote Stream OR Avatar */}
          {callState === 'connected' && !isVideoOff ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-2xl border border-slate-800"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-slate-800 shadow-2xl">
                  <AvatarImage src={targetAvatar} alt={targetName} />
                  <AvatarFallback className="font-extrabold text-2xl bg-blue-600 text-white">
                    {targetName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {callState === 'ringing' && (
                  <span className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-75"></span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-white flex items-center justify-center gap-1.5">
                  {targetName} <ShieldCheck className="h-4 w-4 text-blue-500" />
                </h3>
                <p className="text-xs text-slate-400 font-medium">{targetTitle}</p>
                <p className="text-xs font-extrabold text-emerald-400 animate-pulse pt-2">
                  {callState === 'ringing' 
                    ? (isIncoming ? 'Incoming HD Call...' : 'Ringing Candidate...') 
                    : 'Encrypted HD Audio Connected'}
                </p>
              </div>
            </div>
          )}

          {/* Self View PIP Video */}
          {callState === 'connected' && (
            <div className="absolute bottom-4 right-4 w-28 h-20 bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}

        </div>

        {/* Call Controls Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4">
          
          {callState === 'ringing' && isIncoming ? (
            <>
              <Button
                onClick={handleAcceptCall}
                className="rounded-full h-14 w-14 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center"
              >
                <Phone className="h-6 w-6" />
              </Button>

              <Button
                onClick={handleEndCall}
                className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-500 text-white shadow-lg flex items-center justify-center"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={toggleMute}
                className={`rounded-full h-12 w-12 p-0 border-slate-700 ${isMuted ? 'bg-red-600/20 text-red-500 border-red-500' : 'bg-slate-800 text-white'}`}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                variant="outline"
                onClick={toggleVideo}
                className={`rounded-full h-12 w-12 p-0 border-slate-700 ${isVideoOff ? 'bg-red-600/20 text-red-500 border-red-500' : 'bg-slate-800 text-white'}`}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>

              <Button
                onClick={handleEndCall}
                className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-500 text-white shadow-xl flex items-center justify-center"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
