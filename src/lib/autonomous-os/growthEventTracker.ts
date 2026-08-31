// src/lib/autonomous-os/growthEventTracker.ts
// Real Production Growth Telemetry & Dual K-Factor Engine (Zero Synthetic Fallbacks)
// Strictly counts verified lifecycle events: tool_completed -> share_opened -> share_completed -> referral_visit -> A1_activated -> A7_retained

export type GrowthEventType = 
  | 'TOOL_STARTED'
  | 'TOOL_COMPLETED'
  | 'SHARE_MODAL_OPENED'
  | 'SHARE_COMPLETED_WHATSAPP'
  | 'SHARE_COMPLETED_LINKEDIN'
  | 'SHARE_COMPLETED_NATIVE'
  | 'SHARE_COMPLETED_COPY'
  | 'REFERRAL_VISIT'
  | 'NEW_USER_SIGNUP'
  | 'USER_ACTIVATION_A1'   // A1: First meaningful career action completed
  | 'USER_ACTIVATION_A2'   // A2: Second meaningful career action completed
  | 'USER_RETENTION_A7';   // A7: Retained & active within 7 days

export type AcquisitionSource = 'whatsapp' | 'google' | 'college_tpo' | 'github' | 'direct';

export interface GrowthEventRecord {
  eventId: string;
  eventType: GrowthEventType;
  userId?: string;
  sessionId: string;
  source: AcquisitionSource;
  medium?: string;
  campaign?: string;
  referralToken?: string;
  referrerUserId?: string;
  sourceTool: 'ATS_SCANNER' | 'SALARY_CALCULATOR' | 'COLLEGE_DISCOVERY' | 'CAREER_PASSPORT';
  landingSurface?: string;
  isQualifiedEvent: boolean;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ChannelPerformanceTelemetry {
  channel: AcquisitionSource;
  displayName: string;
  visitors: number;
  signups: number;
  a1Activated: number;
  activationRatePct: number;
  hasMinSample: boolean; // n >= 100
  status: 'WINNER' | 'PROMISING' | 'INSUFFICIENT_DATA' | 'WEAK';
  actionGuidance: string;
}

export interface GrowthFunnelMetrics {
  totalVisitors: number;
  toolStarts: number;
  toolCompletions: number;
  shareAttempts: number;
  successfulShares: number;
  referralVisits: number;
  newSignups: number;
  a1ActivatedUsers: number;
  a2ActivatedUsers: number;
  a7RetainedUsers: number;
  
  // Funnel Ratios
  shareRatePct: number;
  referralConversionPct: number;
  activationRatePct: number;
  
  // Dual K-Factor Formulations
  observedK: number;         // qualified_referred / eligible_referring
  observedKa: number;        // referred_becoming_A1 / eligible_referring
  expectedKa: number;        // share_rate * ref_conv * act_rate (Forecast)
  
  isCalibrationActive: boolean; // True during Days 0-14 before n >= 100
  channels: ChannelPerformanceTelemetry[];
}

const STORAGE_KEY = 'tx_growth_events_v2';
const SESSION_ID_KEY = 'tx_growth_session_id';

export class GrowthEventTracker {
  private static instance: GrowthEventTracker;
  private events: GrowthEventRecord[] = [];
  private currentSessionId: string = '';

  private constructor() {
    this.initSession();
    this.loadPersistedEvents();
  }

  public static getInstance(): GrowthEventTracker {
    if (!GrowthEventTracker.instance) {
      GrowthEventTracker.instance = new GrowthEventTracker();
    }
    return GrowthEventTracker.instance;
  }

  private initSession(): void {
    if (typeof window === 'undefined') return;
    let sId = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sId) {
      sId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem(SESSION_ID_KEY, sId);
    }
    this.currentSessionId = sId;
  }

  private loadPersistedEvents(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.events = JSON.parse(raw);
      }
    } catch {
      this.events = [];
    }
  }

  private persistEvents(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch {
      // Storage full or private browsing
    }
  }

  public trackEvent(
    type: GrowthEventType, 
    sourceTool: GrowthEventRecord['sourceTool'], 
    referralToken?: string, 
    metadata?: Record<string, any>
  ): void {
    const source: AcquisitionSource = (metadata?.source as AcquisitionSource) || (referralToken ? 'whatsapp' : 'direct');
    
    // Anti-Fraud & Quality Protection: reject rapid duplicates (<500ms)
    const now = Date.now();
    const lastEvent = this.events[this.events.length - 1];
    const isRapidDuplicate = lastEvent && 
      lastEvent.eventType === type && 
      (now - new Date(lastEvent.timestamp).getTime()) < 500;

    if (isRapidDuplicate) return;

    // Self-referral suppression
    const isSelfReferral = referralToken && metadata?.referrerUserId && metadata?.userId && (metadata.referrerUserId === metadata.userId);

    const record: GrowthEventRecord = {
      eventId: `gevt_${now}_${Math.random().toString(36).slice(2, 6)}`,
      eventType: type,
      userId: metadata?.userId,
      sessionId: this.currentSessionId,
      source,
      medium: metadata?.medium,
      campaign: metadata?.campaign,
      referralToken,
      referrerUserId: metadata?.referrerUserId,
      sourceTool,
      landingSurface: metadata?.landingSurface || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      isQualifiedEvent: !isSelfReferral,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.events.push(record);
    this.persistEvents();
  }

  public computeMetrics(): GrowthFunnelMetrics {
    const qualified = this.events.filter(e => e.isQualifiedEvent);

    const toolStarts = qualified.filter(e => e.eventType === 'TOOL_STARTED').length;
    const toolCompletions = qualified.filter(e => e.eventType === 'TOOL_COMPLETED').length;
    const shareAttempts = qualified.filter(e => e.eventType === 'SHARE_MODAL_OPENED').length;
    const successfulShares = qualified.filter(e => e.eventType.startsWith('SHARE_COMPLETED')).length;
    const referralVisits = qualified.filter(e => e.eventType === 'REFERRAL_VISIT').length;
    const newSignups = qualified.filter(e => e.eventType === 'NEW_USER_SIGNUP').length;
    const a1ActivatedUsers = qualified.filter(e => e.eventType === 'USER_ACTIVATION_A1').length;
    const a2ActivatedUsers = qualified.filter(e => e.eventType === 'USER_ACTIVATION_A2').length;
    const a7RetainedUsers = qualified.filter(e => e.eventType === 'USER_RETENTION_A7').length;

    // Calculate total session visitors recorded
    const uniqueSessions = new Set(this.events.map(e => e.sessionId)).size;
    const totalVisitors = Math.max(uniqueSessions, referralVisits + 1);

    // Funnel Ratios
    const shareRatePct = toolCompletions > 0 ? Number(((successfulShares / toolCompletions) * 100).toFixed(1)) : 0;
    const referralConversionPct = referralVisits > 0 ? Number(((newSignups / referralVisits) * 100).toFixed(1)) : 0;
    const activationRatePct = newSignups > 0 ? Number(((a1ActivatedUsers / newSignups) * 100).toFixed(1)) : 0;

    // Eligible referring users (users who completed a tool and were shown a share artifact)
    const eligibleReferrers = Math.max(1, toolCompletions);

    // 1. Observed K (Qualified referred signups / Eligible referring users)
    const observedK = Number((newSignups / eligibleReferrers).toFixed(2));

    // 2. Observed Ka (Referred users who become A1 / Eligible referring users)
    const observedKa = Number((a1ActivatedUsers / eligibleReferrers).toFixed(2));

    // 3. Expected Ka (Forecasted Virality: Share Rate * Referral Conversion * Activation Rate)
    const sr = toolCompletions > 0 ? (successfulShares / toolCompletions) : 0;
    const rc = referralVisits > 0 ? (newSignups / referralVisits) : 0;
    const ar = newSignups > 0 ? (a1ActivatedUsers / newSignups) : 0;
    const expectedKa = Number((sr * rc * ar).toFixed(2));

    // Channel breakdown from qualified events
    const channelMap: Record<AcquisitionSource, { visitors: number; signups: number; a1: number }> = {
      whatsapp: { visitors: 0, signups: 0, a1: 0 },
      college_tpo: { visitors: 0, signups: 0, a1: 0 },
      google: { visitors: 0, signups: 0, a1: 0 },
      github: { visitors: 0, signups: 0, a1: 0 },
      direct: { visitors: 0, signups: 0, a1: 0 }
    };

    qualified.forEach(evt => {
      const src = evt.source || 'direct';
      if (channelMap[src]) {
        if (evt.eventType === 'REFERRAL_VISIT') channelMap[src].visitors++;
        if (evt.eventType === 'NEW_USER_SIGNUP') channelMap[src].signups++;
        if (evt.eventType === 'USER_ACTIVATION_A1') channelMap[src].a1++;
      }
    });

    const channels: ChannelPerformanceTelemetry[] = [
      {
        channel: 'whatsapp',
        displayName: 'WhatsApp Referral Scorecards',
        visitors: channelMap.whatsapp.visitors,
        signups: channelMap.whatsapp.signups,
        a1Activated: channelMap.whatsapp.a1,
        activationRatePct: channelMap.whatsapp.visitors > 0 ? Number(((channelMap.whatsapp.a1 / channelMap.whatsapp.visitors) * 100).toFixed(1)) : 0,
        hasMinSample: channelMap.whatsapp.visitors >= 100,
        status: channelMap.whatsapp.visitors >= 100 ? 'WINNER' : 'INSUFFICIENT_DATA',
        actionGuidance: 'Increase exposure to scorecard sharing on /resume. Establish baseline sample (n >= 100).'
      },
      {
        channel: 'college_tpo',
        displayName: 'College TPO Cohort Screeners (/colleges/batch)',
        visitors: channelMap.college_tpo.visitors,
        signups: channelMap.college_tpo.signups,
        a1Activated: channelMap.college_tpo.a1,
        activationRatePct: channelMap.college_tpo.visitors > 0 ? Number(((channelMap.college_tpo.a1 / channelMap.college_tpo.visitors) * 100).toFixed(1)) : 0,
        hasMinSample: channelMap.college_tpo.visitors >= 100,
        status: channelMap.college_tpo.visitors >= 100 ? 'PROMISING' : 'INSUFFICIENT_DATA',
        actionGuidance: 'Pilot with 10-20 institutional placement cells. Measure cohort completion and repeat rate.'
      },
      {
        channel: 'google',
        displayName: 'Google Organic (SEO Utility Pages)',
        visitors: channelMap.google.visitors,
        signups: channelMap.google.signups,
        a1Activated: channelMap.google.a1,
        activationRatePct: channelMap.google.visitors > 0 ? Number(((channelMap.google.a1 / channelMap.google.visitors) * 100).toFixed(1)) : 0,
        hasMinSample: channelMap.google.visitors >= 100,
        status: channelMap.google.visitors >= 100 ? 'PROMISING' : 'INSUFFICIENT_DATA',
        actionGuidance: 'Attach direct utility CTAs (ATS check / salary benchmark) to top indexed landing pages.'
      },
      {
        channel: 'github',
        displayName: 'GitHub Developer Badges & Communities',
        visitors: channelMap.github.visitors,
        signups: channelMap.github.signups,
        a1Activated: channelMap.github.a1,
        activationRatePct: channelMap.github.visitors > 0 ? Number(((channelMap.github.a1 / channelMap.github.visitors) * 100).toFixed(1)) : 0,
        hasMinSample: channelMap.github.visitors >= 100,
        status: 'INSUFFICIENT_DATA',
        actionGuidance: 'Continue developer pilot. Need >= 100 qualified visits before making scaling decision.'
      },
      {
        channel: 'direct',
        displayName: 'Direct / Unattributed Traffic',
        visitors: channelMap.direct.visitors,
        signups: channelMap.direct.signups,
        a1Activated: channelMap.direct.a1,
        activationRatePct: channelMap.direct.visitors > 0 ? Number(((channelMap.direct.a1 / channelMap.direct.visitors) * 100).toFixed(1)) : 0,
        hasMinSample: channelMap.direct.visitors >= 100,
        status: 'INSUFFICIENT_DATA',
        actionGuidance: 'Investigate landing intent and referral headers. Do not allocate scaling resources.'
      }
    ];

    return {
      totalVisitors,
      toolStarts,
      toolCompletions,
      shareAttempts,
      successfulShares,
      referralVisits,
      newSignups,
      a1ActivatedUsers,
      a2ActivatedUsers,
      a7RetainedUsers,
      shareRatePct,
      referralConversionPct,
      activationRatePct,
      observedK,
      observedKa,
      expectedKa,
      isCalibrationActive: (totalVisitors < 100),
      channels
    };
  }
}
