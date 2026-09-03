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
  ]
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
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

  // 1. Call timer (only increments when call is actually connected)
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

  // 2. Play ringtone during ringing state
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

  const playChime = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isIncoming ? 523.25 : 440, audioCtx.currentTime); // C5 incoming, A4 outgoing
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();

      setTimeout(() => {
        try { osc.stop(); } catch (_) {}
      }, 900);
    } catch (_) {}
  }, [isIncoming]);

  useEffect(() => {
    if (!isOpen || callState !== 'ringing') {
      stopRingtone();
      return;
    }

    playChime();
    ringtoneIntervalRef.current = setInterval(playChime, 3000);

    return () => stopRingtone();
  }, [isOpen, callState, playChime, stopRingtone]);

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

    pendingIceCandidates.current = [];
    setHasRemoteStream(false);
  }, [stopRingtone]);

  // 3. Acquire Local Media Stream
  const acquireLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video'
      });
      localStreamRef.current = stream;

      // Bind to local PIP preview
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.warn('Media devices capture warning:', err);
      toast.error('Microphone or Camera access is needed for the call.');
      return null;
    }
  }, [callType]);

  // 4. Create and configure RTCPeerConnection
  const createPeerConnection = useCallback((stream: MediaStream) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnectionRef.current = pc;

    // Add local audio and video tracks to the peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle remote track arrival
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setHasRemoteStream(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
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
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        toast.info('Call connection interrupted');
      }
    };

    return pc;
  }, [sendSignalingEvent]);

  // 5. Handle Caller flow (outgoing call initialization)
  useEffect(() => {
    if (!isOpen) return;

    setCallState('ringing');
    setCallDuration(0);
    setHasRemoteStream(false);

    // If caller (outgoing), acquire local media immediately so preview is ready
    if (!isIncoming) {
      acquireLocalMedia();

      // Ringing timeout: if callee doesn't answer in 45 seconds, cancel call
      const ringTimeout = setTimeout(() => {
        if (callState === 'ringing') {
          toast.info(`${targetName} is unavailable right now.`);
          handleEndCall();
        }
      }, 45000);

      return () => clearTimeout(ringTimeout);
    }
  }, [isOpen, isIncoming]);

  // 6. Listen for WebRTC Signaling Events
  useEffect(() => {
    if (!isOpen || !currentUserId) return;

    const channel = supabase.channel('talentxcel-global-broadcast-v1', {
      config: { broadcast: { self: true } }
    });

    channel
      .on('broadcast', { event: 'CLIENT_CALL_ACCEPTED' }, async (payload: any) => {
        const data = payload.payload;
        // Verify signal is meant for this user and this call session
        if (data.targetUserId === currentUserId || (data.callerId === currentUserId && data.callId === activeCallId)) {
          stopRingtone();
          setCallState('connected');
          toast.success(`Connected with ${targetName}`);

          // Caller initiates WebRTC handshake by sending SDP offer
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

              // Drain any early ICE candidates
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

  // 7. Callee explicitly clicks "Accept Call"
  const handleAcceptCall = async () => {
    stopRingtone();
    setCallState('connected');
    if (onAccept) onAccept();

    const stream = await acquireLocalMedia();
    if (stream) {
      // Notify caller that call was accepted
      sendSignalingEvent('CLIENT_CALL_ACCEPTED', {
        callerId: targetUserId,
        calleeId: currentUserId
      });
      toast.success(`Call connected with ${targetName}`);
    }
  };

  // 8. Callee or Caller declines/ends call
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
    }, 600);
  };

  // 9. Audio Mute Toggle
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

  // 10. Video Camera Toggle
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
        <div className="relative min-h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden p-6">
          
          {/* Active Call Remote Video Stream */}
          {callState === 'connected' && callType === 'video' && hasRemoteStream ? (
            <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-extrabold text-white flex items-center gap-2 border border-white/10 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{targetName} (Live HD)</span>
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
                    : (callType === 'audio' ? 'Encrypted HD Voice Connected' : 'HD Video Connected')}
                </p>
              </div>

              {/* Hidden audio element to ensure remote sound plays even when video avatar is displayed */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={callState === 'connected' && hasRemoteStream && callType === 'video' ? 'hidden' : 'hidden'}
              />
            </div>
          )}

          {/* Self View PIP Video (Only when connected or video is active) */}
          {callState === 'connected' && callType === 'video' && (
            <div className="absolute bottom-4 right-4 w-36 h-28 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
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

        </div>

        {/* Call Controls Bar */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-6">
          
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

