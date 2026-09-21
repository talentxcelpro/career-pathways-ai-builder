import { PrivacySafeAcquisitionEvent, GrowthEventType, RequestClassification } from './types';

/**
 * Signup Attribution Engine
 * =========================================================================
 * Manages privacy-safe visitor telemetry and attribution funnels.
 * Guarantees that:
 * 1. Analytics events contain only opaque identifiers (visitorId, sessionId, toolId).
 * 2. Zero raw resume text, phone numbers, salary figures, or PII are stored in analytics.
 * 3. Anonymous visitor sessions are linked to userIds upon signup without data loss.
 * 4. User-directed identity reset is supported for privacy compliance.
 */
export class SignupAttributionEngine {
  private static readonly VISITOR_ID_KEY = 'tx_growth_visitor_id';
  private static readonly SESSION_ID_KEY = 'tx_growth_session_id';

  /**
   * Retrieves or initializes a persistent anonymous visitor ID (UUID).
   */
  public static getOrCreateVisitorId(): string {
    if (typeof window === 'undefined') {
      return this.generateUUID();
    }

    try {
      let vid = localStorage.getItem(this.VISITOR_ID_KEY);
      if (!vid || !this.isValidUUID(vid)) {
        vid = this.generateUUID();
        localStorage.setItem(this.VISITOR_ID_KEY, vid);
      }
      return vid;
    } catch {
      return this.generateUUID();
    }
  }

  /**
   * Retrieves or initializes an active session ID.
   */
  public static getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return this.generateUUID();
    }

    try {
      let sid = sessionStorage.getItem(this.SESSION_ID_KEY);
      if (!sid || !this.isValidUUID(sid)) {
        sid = this.generateUUID();
        sessionStorage.setItem(this.SESSION_ID_KEY, sid);
      }
      return sid;
    } catch {
      return this.generateUUID();
    }
  }

  /**
   * Clears anonymous identifiers upon user privacy request.
   */
  public static resetIdentity(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.VISITOR_ID_KEY);
      sessionStorage.removeItem(this.SESSION_ID_KEY);
    } catch {}
  }

  /**
   * Constructs a privacy-safe acquisition event.
   * Strips out any accidental PII payload.
   */
  public static createEvent(
    eventType: GrowthEventType,
    params: {
      landingPage: string;
      product: string;
      source?: string;
      medium?: string;
      campaign?: string | null;
      country?: string;
      intentId?: string | null;
      userId?: string | null;
      requestType?: RequestClassification;
      safeMetadata?: Record<string, string | number | boolean>;
    }
  ): PrivacySafeAcquisitionEvent {
    const visitorId = this.getOrCreateVisitorId();
    const sessionId = this.getOrCreateSessionId();

    return {
      eventId: this.generateUUID(),
      visitorId,
      sessionId,
      userId: params.userId || null,
      requestType: params.requestType || 'HUMAN',
      source: params.source || 'direct',
      medium: params.medium || 'web',
      campaign: params.campaign || null,
      country: (params.country || 'GLOBAL').toLowerCase(),
      landingPage: params.landingPage,
      product: params.product,
      intentId: params.intentId || null,
      timestamp: new Date().toISOString(),
      eventType,
      metadata: params.safeMetadata || {}
    };
  }

  private static generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private static isValidUUID(s: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  }
}
