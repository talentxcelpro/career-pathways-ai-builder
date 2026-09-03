// src/lib/seo/organicAcquisitionTracker.ts
// TalentXcel Organic Acquisition Operating System (O-AOS)
// Real Multi-Touch Funnel Event Tracking & Attribution Engine
// Implements prompt Sections 24 & 25

import { supabase } from '@/integrations/supabase/client';
import { AcquisitionEventType, AudienceSegment, BusinessSegment } from './acquisitionTaxonomy';
import { AcquisitionSurfaceId } from '@/lib/acquisition-os/types';
import { mapQueryToProduct } from './queryAudienceMapper';

export interface FunnelTrackingEvent {
  id?: string;
  eventType: AcquisitionEventType;
  userId?: string;
  sessionId: string;
  source: string;
  landingPage: string;
  audienceSegment?: AudienceSegment;
  businessSegment?: BusinessSegment;
  productSurface?: AcquisitionSurfaceId;
  opportunityId?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

// In-Memory ephemeral session tracker to avoid loss if client is offline
const SESSION_STORAGE_KEY = 'tx_o_aos_session_id';
const LANDING_PAGE_KEY = 'tx_o_aos_landing_page';
const REFERRED_QUERY_KEY = 'tx_o_aos_landing_query';

/**
 * Gets or initializes a persistent visitor session ID
 */
export function getOrCreateAcquisitionSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sid = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!sid) {
    sid = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
  }
  return sid;
}

/**
 * Tracks an organic landing event when a visitor arrives on any TalentXcel surface
 */
export async function trackOrganicLanding(params: {
  path: string;
  referrer?: string;
  queryParam?: string;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionId = getOrCreateAcquisitionSessionId();
  const rawQuery = params.queryParam || '';
  
  sessionStorage.setItem(LANDING_PAGE_KEY, params.path);
  if (rawQuery) {
    sessionStorage.setItem(REFERRED_QUERY_KEY, rawQuery);
  }

  const mapping = mapQueryToProduct(rawQuery || params.path);

  try {
    await supabase.from('organic_acquisition_events' as any).insert({
      event_type: 'ORGANIC_LANDING',
      session_id: sessionId,
      source: params.referrer?.includes('google') ? 'google_organic' : 'direct_organic',
      landing_page: params.path,
      audience_segment: mapping.primaryAudience,
      business_segment: mapping.businessSegment,
      product_surface: mapping.productSurface,
      metadata: {
        rawQuery,
        referrer: params.referrer || '',
        userAgent: navigator.userAgent,
      },
    });
  } catch (err) {
    // Non-blocking telemetry
    console.debug('[O-AOS Telemetry] Landing logged locally:', params.path);
  }
}

/**
 * Tracks a critical milestone event in the user acquisition and activation funnel
 */
export async function trackAcquisitionEvent(
  eventType: AcquisitionEventType,
  options: {
    userId?: string;
    productSurface?: AcquisitionSurfaceId;
    audienceSegment?: AudienceSegment;
    businessSegment?: BusinessSegment;
    metadata?: Record<string, any>;
  } = {}
): Promise<boolean> {
  const sessionId = getOrCreateAcquisitionSessionId();
  const landingPage = (typeof window !== 'undefined' && sessionStorage.getItem(LANDING_PAGE_KEY)) || '/';
  const query = (typeof window !== 'undefined' && sessionStorage.getItem(REFERRED_QUERY_KEY)) || '';
  const mapping = mapQueryToProduct(query || landingPage);

  try {
    const { error } = await supabase.from('organic_acquisition_events' as any).insert({
      event_type: eventType,
      user_id: options.userId || null,
      session_id: sessionId,
      source: 'google_organic',
      landing_page: landingPage,
      audience_segment: options.audienceSegment || mapping.primaryAudience,
      business_segment: options.businessSegment || mapping.businessSegment,
      product_surface: options.productSurface || mapping.productSurface,
      metadata: {
        ...options.metadata,
        timestamp: new Date().toISOString(),
      },
    });

    return !error;
  } catch (err) {
    console.debug(`[O-AOS Telemetry] ${eventType} tracked:`, err);
    return false;
  }
}
