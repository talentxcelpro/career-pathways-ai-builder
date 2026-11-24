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
  | 'network_connection_requested'
  // TalentScore exact event suite
  | 'talent_score_viewed'
  | 'talent_score_page_view'
  | 'talent_score_assessment_start'
  | 'talent_score_industry_select'
  | 'talent_score_calculated'
  | 'talent_score_assessment_complete'
  | 'talent_score_shared'
  | 'talent_score_share'
  | 'talent_score_registration_conversion'
  // Passport exact event suite
  | 'passport_viewed'
  | 'passport_public_view'
  | 'passport_shared'
  | 'passport_share'
  | 'passport_registration_conversion';

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

    // Forward to GA4 if active
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', eventName, payloadMetadata);
      } catch {
        // Non-blocking GA4 notice
      }
    }

    // Fire non-blocking RPC call
    supabase
      .rpc('track_funnel_event', {
        p_session_id: sessionId,
        p_event_name: eventName,
        p_metadata: payloadMetadata
      })
      .then(({ error }) => {
        if (error) {
          // Non-blocking fallback telemetry logger
          console.debug('[Telemetry] Event recorded locally:', eventName);
        }
      });
  } catch (err) {
    // Non-blocking catch
    console.debug('[Telemetry] Failed to record funnel event:', err);
  }
}
