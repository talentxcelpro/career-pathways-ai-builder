import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Volume2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExecutiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId?: string;
  currentUserId?: string;
  targetUserId?: string;
  targetName?: string;
  targetAvatar?: string;
  targetTitle?: string;
  callType?: 'audio' | 'video';
  isIncoming?: boolean;
  onAccept?: () => void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
};

export const ExecutiveCallModal: React.FC<ExecutiveCallModalProps> = ({
  isOpen,
  onClose,
  callId: propCallId,
  currentUserId: propUserId,
  targetUserId,
  targetName = 'Member',
  targetAvatar,
  targetTitle = 'Executive Member',
  callType = 'video',
  isIncoming = false,
  onAccept
}) => {
  const { user } = useAuth();
  const currentUserId = propUserId || user?.id;
  const activeCallId = propCallId || `call_${targetUserId || 'session'}`;

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [callDuration, setCallDuration] = useState(0);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [hasRemoteAudio, setHasRemoteAudio] = useState(false);

  // Video and Stream Refs (Single persistent instances)
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Audio Context & Ringtone Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

  // 1. Call Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Audible Ringtone Engine (Guaranteed browser playback with auto-resume)
  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (_) {}
      audioCtxRef.current = null;
    }
  }, []);

  const playRingToneBurst = useCallback(async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      // Resume suspended context (required by Chrome autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.18, now); // Clearly audible volume
      gainNode.connect(ctx.destination);

      if (isIncoming) {
        // High-low cheerful chime for incoming call (D5 + A5)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now);
        osc1.connect(gainNode);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880.0, now + 0.38);
        osc2.connect(gainNode);
        osc2.start(now + 0.38);
        osc2.stop(now + 0.85);
      } else {
        // Dual-tone US/UK standard PBX ringing cadence (440Hz + 480Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      }
    } catch (e) {
      console.warn('Audio ringtone note:', e);
    }
  }, [isIncoming]);

  useEffect(() => {
    if (!isOpen || callState !== 'ringing') {
      stopRingtone();
      return;
    }

    // Play immediately and loop every 2.8 seconds
    playRingToneBurst();
    ringtoneIntervalRef.current = setInterval(playRingToneBurst, 2800);

    return () => stopRingtone();
  }, [isOpen, callState, playRingToneBurst, stopRingtone]);

  // 3. Persistent Video Sync Effect: ALWAYS binds streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
    }
  });

  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      if (remoteVideoRef.current.srcObject !== remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
    }
  });

  // Helper to send WebRTC signaling over Supabase Broadcast
  const sendSignalingEvent = useCallback((event: string, payload: Record<string, any>) => {
    try {
      supabase.channel('talentxcel-global-broadcast-v1').send({
        type: 'broadcast',
        event,
        payload: {
          callId: activeCallId,
          senderId: currentUserId,
          targetUserId,
          ...payload
        }
      });
    } catch (err) {
      console.warn('Signaling dispatch warning:', err);
    }
  }, [activeCallId, currentUserId, targetUserId]);

  // Clean up all media tracks and connections
  const cleanupMediaAndPeer = useCallback(() => {
    stopRingtone();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch (_) {}
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    remoteStreamRef.current = null;
    pendingIceCandidates.current = [];
    setHasRemoteVideo(false);
    setHasRemoteAudio(false);
  }, [stopRingtone]);

  // 4. Acquire Local Media Stream
  const acquireLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      });
      localStreamRef.current = stream;

      // Immediately bind to local preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      return stream;
    } catch (err) {
      console.warn('Media devices capture warning:', err);
      toast.error('Microphone or Camera access is required for the call.');
      return null;
    }
  }, [callType]);

  // 5. Create and configure RTCPeerConnection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch (_) {}
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;

    // Attach all local tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle remote track arrival
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        remoteStreamRef.current = remoteStream;

        const videoTracks = remoteStream.getVideoTracks();
        const audioTracks = remoteStream.getAudioTracks();

        setHasRemoteVideo(videoTracks.length > 0);
        setHasRemoteAudio(audioTracks.length > 0);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(e => console.warn('Remote video playback note:', e));
        }
      }
    };

    // Send local ICE candidates to the remote peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingEvent('CLIENT_CALL_ICE', { candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        toast.success(`HD Media Connected with ${targetName}`);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        toast.info('Connection interrupted. Reconnecting...');
      }
    };

    return pc;
  }, [sendSignalingEvent, targetName]);

  // 6. Outgoing Call Initialization (Caller)
  useEffect(() => {
    if (!isOpen) return;

    setCallState('ringing');
    setCallDuration(0);
    setHasRemoteVideo(false);
    setHasRemoteAudio(false);

    // If caller, acquire local media right away so self-preview is active
    if (!isIncoming) {
      acquireLocalMedia();

      // Ringing timeout (45 seconds)
      const ringTimeout = setTimeout(() => {
        if (callState === 'ringing') {
          toast.info(`${targetName} is unavailable right now.`);
          handleEndCall();
        }
      }, 45000);

      return () => clearTimeout(ringTimeout);
    }
  }, [isOpen, isIncoming]);

  // 7. Signaling Bus Listener
  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    const channel = supabase.channel('talentxcel-global-broadcast-v1', {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'CLIENT_CALL_ACCEPTED' }, async (payload: any) => {
        const data = payload.payload;
        if (data.targetUserId === currentUserId || (data.callerId === currentUserId && data.callId === activeCallId)) {
          stopRingtone();
          setCallState('connected');

          // Caller creates WebRTC Offer
          const stream = await acquireLocalMedia();
          if (stream) {
            const pc = createPeerConnection(stream);
            try {
              const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: callType === 'video'
              });
              await pc.setLocalDescription(offer);
              sendSignalingEvent('CLIENT_CALL_OFFER', { sdp: offer });
            } catch (offerErr) {
              console.error('Failed to create WebRTC offer:', offerErr);
            }
          }
        }
      })
      .on('broadcast', { event: 'CLIENT_CALL_OFFER' }, async (payload: any) => {
        const data = payload.payload;
        if (data.targetUserId === currentUserId && data.callId === activeCallId) {
          stopRingtone();
          setCallState('connected');

          const stream = await acquireLocalMedia();
          if (stream) {
            const pc = createPeerConnection(stream);
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

              // Drain queued ICE candidates
              while (pendingIceCandidates.current.length > 0) {
                const cand = pendingIceCandidates.current.shift();
                if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
              }

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendSignalingEvent('CLIENT_CALL_ANSWER', { sdp: answer });
            } catch (answerErr) {
              console.error('Failed to create WebRTC answer:', answerErr);
            }
          }
        }
      })
      .on('broadcast', { event: 'CLIENT_CALL_ANSWER' }, async (payload: any) => {
        const data = payload.payload;
        if (data.targetUserId === currentUserId && data.callId === activeCallId) {
          const pc = peerConnectionRef.current;
          if (pc && !pc.currentRemoteDescription) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              while (pendingIceCandidates.current.length > 0) {
                const cand = pendingIceCandidates.current.shift();
                if (cand) await pc.addIceCandidate(new RTCIceCandidate(cand));
              }
            } catch (remoteDescErr) {
              console.error('Failed to set WebRTC remote description:', remoteDescErr);
            }
          }
        }
      })
      .on('broadcast', { event: 'CLIENT_CALL_ICE' }, async (payload: any) => {
        const data = payload.payload;
        if (data.targetUserId === currentUserId && data.callId === activeCallId && data.candidate) {
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (iceErr) {
              console.warn('ICE candidate addition notice:', iceErr);
            }
          } else {
            pendingIceCandidates.current.push(data.candidate);
          }
        }
      })
      .on('broadcast', { event: 'CLIENT_CALL_REJECTED' }, (payload: any) => {
        const data = payload.payload;
        if (data.targetUserId === currentUserId && data.callId === activeCallId) {
          toast.info(`${targetName} declined the call`);
          cleanupMediaAndPeer();
          setCallState('ended');
          setTimeout(() => onClose(), 800);
        }
      })
      .on('broadcast', { event: 'CLIENT_CALL_ENDED' }, (payload: any) => {
        const data = payload.payload;
        if (data.targetUserId === currentUserId && data.callId === activeCallId) {
          toast.info('Call ended');
          cleanupMediaAndPeer();
          setCallState('ended');
          setTimeout(() => onClose(), 600);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUserId, activeCallId, targetName, callType, acquireLocalMedia, createPeerConnection, sendSignalingEvent, cleanupMediaAndPeer, stopRingtone, onClose]);

  // 8. Callee explicitly clicks "Accept Call"
  const handleAcceptCall = async () => {
    stopRingtone();
    setCallState('connected');
    if (onAccept) onAccept();

    const stream = await acquireLocalMedia();
    if (stream) {
      sendSignalingEvent('CLIENT_CALL_ACCEPTED', {
        callerId: targetUserId,
        calleeId: currentUserId
      });
      toast.success(`Call connected with ${targetName}`);
    }
  };

  // 9. Decline or End Call
  const handleEndCall = () => {
    stopRingtone();
    
    if (callState === 'ringing' && isIncoming) {
      sendSignalingEvent('CLIENT_CALL_REJECTED', {
        callerId: targetUserId,
        calleeId: currentUserId
      });
    } else {
      sendSignalingEvent('CLIENT_CALL_ENDED', {});
    }

    cleanupMediaAndPeer();
    setCallState('ended');
    toast.info('Call ended');
    setTimeout(() => {
      onClose();
      setCallState('ringing');
      setCallDuration(0);
    }, 500);
  };

  // 10. Mute Toggle
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.info(audioTrack.enabled ? 'Microphone Unmuted' : 'Microphone Muted');
      }
    } else {
      setIsMuted(prev => !prev);
    }
  };

  // 11. Video Toggle
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        toast.info(videoTrack.enabled ? 'Camera Enabled' : 'Camera Disabled');
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
            <span className="text-xs font-extrabold tracking-tight">
              TalentXcel {callType === 'audio' ? 'HD Voice' : 'HD Video'} Call
            </span>
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
        <div className="relative min-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden p-4">
          
          {/* 1. PERSISTENT REMOTE VIDEO ELEMENT (ALWAYS MOUNTED IN DOM) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className={`w-full h-full min-h-[380px] object-cover rounded-2xl ${
              callState === 'connected' && hasRemoteVideo && !isVideoOff ? 'block' : 'hidden'
            }`}
          />

          {/* 2. OVERLAY: SHOWN WHEN IN RINGING, VOICE CALL, OR BEFORE REMOTE VIDEO STARTS */}
          {!(callState === 'connected' && hasRemoteVideo && !isVideoOff) && (
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
                    : (callType === 'audio' ? 'Encrypted HD Voice Connected' : 'Connecting HD Video Feed...')}
                </p>
              </div>
            </div>
          )}

          {/* 3. PERSISTENT SELF-VIEW PIP VIDEO (ALWAYS MOUNTED IN DOM) */}
          {callType === 'video' && (
            <div className="absolute bottom-4 right-4 w-36 h-28 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
              />
              {isVideoOff && (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs text-slate-400 font-bold">
                  Camera Off
                </div>
              )}
              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md">
                You
              </div>
            </div>
          )}

          {/* Live indicator badge when remote video is streaming */}
          {callState === 'connected' && hasRemoteVideo && (
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-extrabold text-white flex items-center gap-2 border border-white/10 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{targetName} (Live HD)</span>
            </div>
          )}

        </div>

        {/* Call Controls Bar */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-5">
          
          {callState === 'ringing' && isIncoming ? (
            <>
              <Button
                onClick={handleAcceptCall}
                className="rounded-full h-16 w-16 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105"
                title="Accept Call"
              >
                <Phone className="h-7 w-7" />
              </Button>

              <Button
                onClick={handleEndCall}
                className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-500 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105"
                title="Decline Call"
              >
                <PhoneOff className="h-7 w-7" />
              </Button>
            </>
          ) : callState === 'ringing' && !isIncoming ? (
            <Button
              onClick={handleEndCall}
              className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-500 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
              title="Cancel Call"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={toggleMute}
                className={`rounded-full h-14 w-14 p-0 border-slate-700 transition-all ${isMuted ? 'bg-red-600 text-white border-red-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {callType === 'video' && (
                <Button
                  variant="outline"
                  onClick={toggleVideo}
                  className={`rounded-full h-14 w-14 p-0 border-slate-700 transition-all ${isVideoOff ? 'bg-red-600 text-white border-red-600' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                  title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
              )}

              <Button
                onClick={handleEndCall}
                className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-500 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
                title="End Call"
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
