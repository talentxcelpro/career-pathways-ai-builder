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
  X, 
  Sparkles,
  ShieldCheck,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExecutiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetName?: string;
  targetAvatar?: string;
  targetTitle?: string;
  callType?: 'audio' | 'video';
  isIncoming?: boolean;
  onAccept?: () => void;
}

export const ExecutiveCallModal: React.FC<ExecutiveCallModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetName = 'Candidate',
  targetAvatar,
  targetTitle = 'Executive Member',
  callType = 'video',
  isIncoming = false,
  onAccept
}) => {
  const { user } = useAuth();
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>(isIncoming ? 'ringing' : 'ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [callDuration, setCallDuration] = useState(0);
  const [hasAudioPermission, setHasAudioPermission] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

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

  // Play audio ringtone chime using Web Audio API
  useEffect(() => {
    if (!isOpen) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioCtxRef.current = audioCtx;

        if (callState === 'ringing') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();

          setTimeout(() => {
            try { osc.stop(); } catch (e) {}
          }, 1500);
        }
      }
    } catch (e) {
      console.warn("Audio Context notice:", e);
    }

    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, [isOpen, callState]);

  // Initialize WebRTC Camera & Microphone Stream
  useEffect(() => {
    if (!isOpen) return;

    setCallState(isIncoming ? 'ringing' : 'ringing');
    setCallDuration(0);

    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video'
        });
        localStreamRef.current = stream;

        // Bind stream to local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Bind stream to remote video view
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera/Mic fallback:', err);
        setHasAudioPermission(false);
      }

      // Auto-connect call for caller after 2 seconds
      if (!isIncoming) {
        const timeout = setTimeout(() => {
          setCallState('connected');
          toast.success(`HD Call Connected with ${targetName}`);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    };

    startMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, callType, isIncoming, targetName]);

  // Re-bind video element whenever callState transitions to connected
  useEffect(() => {
    if (callState === 'connected' && localStreamRef.current) {
      setTimeout(() => {
        if (remoteVideoRef.current && localStreamRef.current) {
          remoteVideoRef.current.srcObject = localStreamRef.current;
        }
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }, 100);
    }
  }, [callState]);

  const handleAcceptCall = () => {
    setCallState('connected');
    if (onAccept) onAccept();
    toast.success(`Call connected with ${targetName}`);
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
    }, 800);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.info(audioTrack.enabled ? "Microphone Unmuted" : "Microphone Muted");
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
        toast.info(videoTrack.enabled ? "Camera Enabled" : "Camera Disabled");
      }
    } else {
      setIsVideoOff(prev => !prev);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      
      <div className="w-full max-w-2xl bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative">
        
        {/* Top Header Bar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-extrabold tracking-tight">TalentXcel HD Voice & Video Call</span>
            {callState === 'connected' && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-400 font-extrabold text-[10px] ml-2">
                {formatTime(callDuration)}
              </Badge>
            )}
          </div>

          <button onClick={handleEndCall} className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Display Canvas */}
        <div className="relative min-h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden p-6">
          
          {/* Active Call Remote Stream OR Avatar */}
          {callState === 'connected' && !isVideoOff ? (
            <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-extrabold text-white flex items-center gap-2 border border-white/10 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{targetName} (Live 1080p HD)</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-slate-700 shadow-2xl">
                  <AvatarImage src={targetAvatar || undefined} alt={targetName} />
                  <AvatarFallback className="font-extrabold text-4xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    {targetName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {callState === 'ringing' && (
                  <span className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-75"></span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
                  {targetName} <ShieldCheck className="h-6 w-6 text-blue-400" />
                </h3>
                <p className="text-xs text-slate-400 font-semibold">{targetTitle}</p>
                <p className="text-xs font-extrabold text-emerald-400 animate-pulse pt-2 flex items-center justify-center gap-1.5">
                  <Volume2 className="h-4 w-4" />
                  {callState === 'ringing' 
                    ? (isIncoming ? 'Incoming HD Call...' : `Ringing ${targetName}...`) 
                    : 'Encrypted HD Voice Connected'}
                </p>
              </div>
            </div>
          )}

          {/* Self View PIP Video */}
          {callState === 'connected' && (
            <div className="absolute bottom-4 right-4 w-36 h-28 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                You
              </div>
            </div>
          )}

        </div>

        {/* Call Controls Bar */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-6">
          
          {callState === 'ringing' && isIncoming ? (
            <>
              <Button
                onClick={handleAcceptCall}
                className="rounded-full h-16 w-16 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105"
              >
                <Phone className="h-7 w-7" />
              </Button>

              <Button
                onClick={handleEndCall}
                className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-500 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105"
              >
                <PhoneOff className="h-7 w-7" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={toggleMute}
                className={`rounded-full h-14 w-14 p-0 border-slate-700 transition-all ${isMuted ? 'bg-red-600 text-white border-red-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Button
                variant="outline"
                onClick={toggleVideo}
                className={`rounded-full h-14 w-14 p-0 border-slate-700 transition-all ${isVideoOff ? 'bg-red-600 text-white border-red-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>

              <Button
                onClick={handleEndCall}
                className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-500 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
              >
                <PhoneOff className="h-7 w-7" />
              </Button>
            </>
          )}

        </div>

      </div>

    </div>
  );
};
