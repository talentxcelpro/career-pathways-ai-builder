// src/utils/referralTracker.ts
// Client-side referral capture, link telemetry, and attribution bridge.
// Compliant with 30-day attribution window and India DPDP privacy norms.

import { supabase } from '@/integrations/supabase/client';
import { ReferralChannel } from '@/types/growthEngine';

const STORAGE_KEY_CODE = 'txc_referral_code';
const STORAGE_KEY_CHANNEL = 'txc_referral_channel';
const STORAGE_KEY_CAMPAIGN = 'txc_referral_campaign';
const STORAGE_KEY_TIMESTAMP = 'txc_referral_timestamp';
const STORAGE_KEY_VISITOR = 'txc_visitor_id';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let vid = localStorage.getItem(STORAGE_KEY_VISITOR);
  if (!vid) {
    vid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY_VISITOR, vid);
  }
  return vid;
}

export function getStoredReferral(): { code: string | null; channel: ReferralChannel; campaignId: string | null } {
  if (typeof window === 'undefined') {
    return { code: null, channel: 'direct', campaignId: null };
  }

  const code = localStorage.getItem(STORAGE_KEY_CODE);
  const tsStr = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
  const channel = (localStorage.getItem(STORAGE_KEY_CHANNEL) as ReferralChannel) || 'direct';
  const campaignId = localStorage.getItem(STORAGE_KEY_CAMPAIGN);

  if (!code || !tsStr) {
    return { code: null, channel: 'direct', campaignId: null };
  }

  const ts = parseInt(tsStr, 10);
  if (Date.now() - ts > THIRTY_DAYS_MS) {
    clearStoredReferral();
    return { code: null, channel: 'direct', campaignId: null };
  }

  return { code, channel, campaignId };
}

export function clearStoredReferral(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_CODE);
  localStorage.removeItem(STORAGE_KEY_CHANNEL);
  localStorage.removeItem(STORAGE_KEY_CAMPAIGN);
  localStorage.removeItem(STORAGE_KEY_TIMESTAMP);
}

/**
 * Initializes incoming referral link capture on route/landing mount.
 * Persists parameter for 30 days and sends link_open event once per session.
 */
export async function initReferralCapture(): Promise<void> {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref') || params.get('referral');
  const source = (params.get('utm_source') as ReferralChannel) || 'direct';
  const campaign = params.get('utm_campaign');

  if (ref && ref.trim()) {
    const cleanCode = ref.trim().toUpperCase();
    localStorage.setItem(STORAGE_KEY_CODE, cleanCode);
    localStorage.setItem(STORAGE_KEY_CHANNEL, source);
    if (campaign) localStorage.setItem(STORAGE_KEY_CAMPAIGN, campaign);
    localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString());

    // Record link_open telemetry
    const visitorId = getOrCreateVisitorId();
    try {
      await supabase.functions.invoke('track-referral-event', {
        body: {
          referral_code: cleanCode,
          event_type: 'link_open',
          channel: source,
          campaign_id: campaign || null,
          visitor_id: visitorId,
        },
      });
    } catch {
      // Non-blocking telemetry
    }
  }
}

/**
 * Records a share click event when a user clicks any sharing button.
 */
export async function trackShareClick(code: string, channel: ReferralChannel, campaignId?: string | null): Promise<void> {
  if (!code) return;
  const visitorId = getOrCreateVisitorId();
  try {
    await supabase.functions.invoke('track-referral-event', {
      body: {
        referral_code: code.trim().toUpperCase(),
        event_type: 'share_click',
        channel,
        campaign_id: campaignId || null,
        visitor_id: visitorId,
      },
    });
  } catch {
    // Non-blocking
  }
}

/**
 * Triggered after user login / registration to attribute the stored referral.
 */
export async function attributeStoredReferral(): Promise<boolean> {
  const { code, channel, campaignId } = getStoredReferral();
  if (!code) return false;

  const visitorId = getOrCreateVisitorId();

  try {
    const { data, error } = await supabase.functions.invoke('attribute-referral', {
      body: {
        referral_code: code,
        channel,
        campaign_id: campaignId,
        visitor_id: visitorId,
      },
    });

    if (!error && data?.success) {
      clearStoredReferral();
      return true;
    }
  } catch {
    // Non-blocking
  }

  return false;
}
