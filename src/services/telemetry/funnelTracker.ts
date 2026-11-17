/**
 * TalentXcel High-Velocity Growth Telemetry & Funnel Instrumentation
 * Tracks critical PLG conversion events into public.funnel_events via Supabase RPC.
 */

import { supabase } from '@/integrations/supabase/client';

export type FunnelEventName =
  | 'tool_started'
  | 'ats_scan_completed'
  | 'oauth_gate_shown'
  | 'signup_completed'
  | 'passport_claimed'
  | 'endorsement_sent'
  | 'network_connection_requested';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr_session';
  let sid = sessionStorage.getItem('tx_funnel_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
    sessionStorage.setItem('tx_funnel_session_id', sid);
  }
  return sid;
}

export async function trackFunnelEvent(
  eventName: FunnelEventName,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';

    const payloadMetadata = {
      ...metadata,
      path: currentPath,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      timestamp: new Date().toISOString()
    };

    // Fire non-blocking RPC call
    supabase
      .rpc('track_funnel_event', {
        p_session_id: sessionId,
        p_event_name: eventName,
        p_metadata: payloadMetadata
      })
      .then(({ error }) => {
        if (error) {
          console.debug('[FunnelTracker] Event logged locally (RPC notice):', error.message);
        }
      })
      .catch((err) => {
        console.debug('[FunnelTracker] Async telemetry notice:', err);
      });
  } catch (err) {
    // Fail-open: Never block the user experience for telemetry
    console.debug('[FunnelTracker] Notice:', err);
  }
}
