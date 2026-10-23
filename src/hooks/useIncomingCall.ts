import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CallBridge, type IncomingCallPayload } from '@/plugins/call-bridge';

export function useIncomingCall() {
  const navigate = useNavigate();
  const [pendingCall, setPendingCall] = useState<IncomingCallPayload | null>(null);

  useEffect(() => {
    CallBridge.reportReady().catch(() => {});

    // 1. Listen for background VoIP pushes or simulated incoming calls
    const incomingSub = CallBridge.addListener('incomingCall', (data: IncomingCallPayload) => {
      console.log('[useIncomingCall] Call incoming:', data);
      setPendingCall(data);
    });

    // 2. Listen for native system Answer button click (CallKit or Android notification)
    const answerSub = CallBridge.addListener('callAnswered', (data: { callId: string }) => {
      console.log('[useIncomingCall] Call answered via native UI:', data.callId);
      setPendingCall(null);
      navigate(`/calls/${encodeURIComponent(data.callId)}?source=native_call`);
    });

    // 3. Listen for native system Decline button click
    const declineSub = CallBridge.addListener('callDeclined', (data: { callId: string }) => {
      console.log('[useIncomingCall] Call declined via native UI:', data.callId);
      setPendingCall(null);
    });

    return () => {
      incomingSub.then((h) => h.remove()).catch(() => {});
      answerSub.then((h) => h.remove()).catch(() => {});
      declineSub.then((h) => h.remove()).catch(() => {});
    };
  }, [navigate]);

  const answerCall = useCallback(
    (callId?: string) => {
      const targetId = callId || pendingCall?.callId;
      if (targetId) {
        CallBridge.dismissIncomingCall({ callId: targetId }).catch(() => {});
        setPendingCall(null);
        navigate(`/calls/${encodeURIComponent(targetId)}?source=in_app_call`);
      }
    },
    [navigate, pendingCall]
  );

  const declineCall = useCallback(
    (callId?: string) => {
      const targetId = callId || pendingCall?.callId;
      if (targetId) {
        CallBridge.dismissIncomingCall({ callId: targetId }).catch(() => {});
        setPendingCall(null);
      }
    },
    [pendingCall]
  );

  return {
    pendingCall,
    answerCall,
    declineCall,
    triggerTestIncomingCall: (payload: IncomingCallPayload) => CallBridge.showIncomingCall(payload),
  };
}
