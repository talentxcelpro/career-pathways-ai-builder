/**
 * Engagement-to-Revenue Attribution & Growth Intelligence Engine
 * Mission: TXC-NOTIFICATIONS-004
 * Platform: TalentXcel (https://talentxcel.in)
 * 
 * Provides:
 * 1. Persistent touchpoint tracking across the conversion funnel
 * 2. Causal attribution window management (1h session, 24h immediate, 7d hiring, 30d commerce)
 * 3. Controlled deterministic A/B experimentation engine with mutual exclusivity layers
 * 4. Realized revenue tracking (never estimated) across 5 core paid product pillars
 */

import { supabase } from '@/integrations/supabase/client';

export type TouchpointType = 
  | 'generated'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'landing_view'
  | 'job_view'
  | 'application_start'
  | 'application_submit'
  | 'recruiter_contact'
  | 'candidate_shortlist'
  | 'registration_complete'
  | 'service_purchase';

export type ConversionEvent =
  | 'registration_completed'
  | 'job_application_submitted'
  | 'recruiter_candidate_contacted'
  | 'company_followed'
  | 'paid_service_purchased'
  | 'assessment_purchased'
  | 'staffing_inquiry_submitted';

export type ProductCategory =
  | 'resume_services'
  | 'career_services'
  | 'employer_recruitment'
  | 'staffing_inquiries'
  | 'training_assessment';

export type ExperimentLayer =
  | 'ranking_layer'
  | 'delivery_layer'
  | 'frequency_layer'
  | 'content_layer';

export interface AttributionTouchpointState {
  notificationId: string;
  clickedAt: string;
  entityType?: string;
  entityId?: string;
  campaign?: string;
}

const STORAGE_KEY_SESSION = 'txc_attr_session_id';
const STORAGE_KEY_ACTIVE_TOUCH = 'txc_active_notif_attribution';

export class AttributionGrowthEngine {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initUrlListener();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server_session';
    let sid = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(STORAGE_KEY_SESSION, sid);
    }
    return sid;
  }

  /**
   * Automatically captures notification click attribution when user lands via notification deep-link
   */
  private initUrlListener(): void {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const notifId = params.get('notif_id') || params.get('nid');
      const utmSource = params.get('utm_source');

      if (notifId || utmSource === 'talentxcel_notifications') {
        const attributionState: AttributionTouchpointState = {
          notificationId: notifId || 'external_link',
          clickedAt: new Date().toISOString(),
          campaign: params.get('utm_campaign') || undefined
        };

        sessionStorage.setItem(STORAGE_KEY_ACTIVE_TOUCH, JSON.stringify(attributionState));

        // Record landing view touchpoint
        if (notifId) {
          this.trackTouchpoint(notifId, 'landing_view', {
            url: window.location.pathname,
            referrer: document.referrer
          });
        }
      }
    } catch (_) {}
  }

  /**
   * Tracks an explicit milestone touchpoint in the notification attribution funnel
   */
  public async trackTouchpoint(
    notificationId: string,
    touchpointType: TouchpointType,
    metadata: Record<string, any> = {},
    entityType?: string,
    entityId?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('record_attribution_touchpoint', {
        p_notification_id: notificationId,
        p_session_id: this.sessionId,
        p_touchpoint_type: touchpointType,
        p_entity_type: entityType || null,
        p_entity_id: entityId || null,
        p_utm_campaign: metadata.campaign || null,
        p_metadata: metadata
      });

      if (error) {
        console.warn('Attribution touchpoint note:', error.message);
        return null;
      }

      // If user clicked or landed, persist to active touchpoint state
      if (touchpointType === 'clicked' || touchpointType === 'landing_view') {
        const activeState: AttributionTouchpointState = {
          notificationId,
          clickedAt: new Date().toISOString(),
          entityType,
          entityId,
          campaign: metadata.campaign
        };
        sessionStorage.setItem(STORAGE_KEY_ACTIVE_TOUCH, JSON.stringify(activeState));
      }

      return data as string;
    } catch (err) {
      console.warn('Track touchpoint exception:', err);
      return null;
    }
  }

  /**
   * Resolves causal attribution for an application, registration, contact, or purchase
   */
  public async trackConversion(
    conversionEvent: ConversionEvent,
    options: {
      entityType?: string;
      entityId?: string;
      revenueInr?: number;
      paymentId?: string;
      razorpayPaymentId?: string;
      metadata?: Record<string, any>;
      windowHours?: number;
    } = {}
  ): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const windowHours = options.windowHours || 24;
      const windowInterval = `${windowHours} hours`;

      const { data, error } = await supabase.rpc('resolve_attributed_conversion', {
        p_user_id: user.id,
        p_conversion_event: conversionEvent,
        p_entity_type: options.entityType || null,
        p_entity_id: options.entityId || null,
        p_revenue_inr: options.revenueInr || 0.00,
        p_attribution_window_interval: windowInterval,
        p_payment_id: options.paymentId || null,
        p_razorpay_payment_id: options.razorpayPaymentId || null,
        p_metadata: options.metadata || {}
      });

      if (error) {
        console.warn('Attributed conversion resolution note:', error.message);
        return null;
      }

      return data as string;
    } catch (err) {
      console.warn('Track conversion exception:', err);
      return null;
    }
  }

  /**
   * Controlled A/B Experiment Assignment (Deterministic & Flicker-Free)
   * Assigns user to variant based on hash of user_id and experiment_key
   */
  public async getExperimentCohort(
    experimentKey: string,
    fallbackVariant: string = 'control'
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Deterministic session fallback for unauthenticated users
        return this.deterministicHash(this.sessionId, experimentKey) === 0 ? 'control' : fallbackVariant;
      }

      const { data, error } = await supabase.rpc('evaluate_user_experiment_cohort', {
        p_user_id: user.id,
        p_experiment_key: experimentKey
      });

      if (error || !data) {
        return fallbackVariant;
      }

      return data as string;
    } catch (err) {
      console.warn('Experiment cohort evaluation note:', err);
      return fallbackVariant;
    }
  }

  private deterministicHash(seed: string, key: string): number {
    let hash = 0;
    const str = `${seed}:${key}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash % 2);
  }

  /**
   * Returns current active notification attribution touchpoint from session if within 24h
   */
  public getActiveAttribution(): AttributionTouchpointState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_ACTIVE_TOUCH);
      if (!raw) return null;
      const parsed: AttributionTouchpointState = JSON.parse(raw);
      
      const elapsed = Date.now() - new Date(parsed.clickedAt).getTime();
      if (elapsed > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem(STORAGE_KEY_ACTIVE_TOUCH);
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }
}

export const attributionGrowthEngine = new AttributionGrowthEngine();
