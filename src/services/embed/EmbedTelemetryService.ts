// src/services/embed/EmbedTelemetryService.ts
// TalentXcel Embed & Distribution Engine â€” Privacy-Conscious Telemetry & Attribution Tracker

import { EmbedAssetCategory, EmbedEventPayload, PublisherStats } from '@/types/embed';

class EmbedTelemetryService {
  private static instance: EmbedTelemetryService;
  private endpoint = '/api/embed/telemetry';

  private constructor() {}

  public static getInstance(): EmbedTelemetryService {
    if (!EmbedTelemetryService.instance) {
      EmbedTelemetryService.instance = new EmbedTelemetryService();
    }
    return EmbedTelemetryService.instance;
  }

  /**
   * Safely sanitize and extract the publisher's root domain without capturing paths or query strings
   */
  public extractPublisherDomain(): string {
    if (typeof window === 'undefined') return 'direct';

    // 1. Check parent window or document.referrer
    let rawReferrer = document.referrer;
    if (!rawReferrer) {
      // 2. Check query param if injected by JS wrapper: ?pub_ref=domain.com
      const params = new URLSearchParams(window.location.search);
      rawReferrer = params.get('pub_ref') || params.get('ref') || '';
    }

    if (!rawReferrer) return 'unknown_host';

    try {
      const url = new URL(rawReferrer.startsWith('http') ? rawReferrer : `https://${rawReferrer}`);
      return url.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      return 'invalid_referrer';
    }
  }

  /**
   * Fire a privacy-conscious embed telemetry event
   */
  public trackEvent(
    assetId: string,
    assetCategory: EmbedAssetCategory,
    eventType: EmbedEventPayload['eventType'],
    options: { theme?: string; layout?: string } = {}
  ): void {
    if (typeof window === 'undefined') return;

    const payload: EmbedEventPayload = {
      assetId,
      assetCategory,
      eventType,
      publisherDomain: this.extractPublisherDomain(),
      theme: options.theme,
      layout: options.layout,
      timestamp: new Date().toISOString()
    };

    // Store in session storage for local debugging / admin dashboard verification
    this.recordLocalEvent(payload);

    // Dispatch using sendBeacon for non-blocking reliability
    const serialized = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([serialized], { type: 'application/json' });
      navigator.sendBeacon(this.endpoint, blob);
    } else {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
        keepalive: true
      }).catch(() => {
        // Silent fail: Embed must NEVER disrupt host or throw unhandled exceptions
      });
    }
  }

  private recordLocalEvent(payload: EmbedEventPayload): void {
    try {
      const key = 'txc_embed_telemetry_recent';
      const raw = localStorage.getItem(key);
      const existing: EmbedEventPayload[] = raw ? JSON.parse(raw) : [];
      existing.unshift(payload);
      if (existing.length > 50) existing.pop();
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {
      // Ignore quota errors
    }
  }

  public getRecentLocalEvents(): EmbedEventPayload[] {
    try {
      const key = 'txc_embed_telemetry_recent';
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getPublisherDomainInsights(): PublisherStats[] {
    const events = this.getRecentLocalEvents();
    const map = new Map<string, { impressions: number; clicks: number; lastSeen: string }>();

    for (const ev of events) {
      const domain = ev.publisherDomain || 'direct';
      const current = map.get(domain) || { impressions: 0, clicks: 0, lastSeen: ev.timestamp };
      if (ev.eventType === 'impression' || ev.eventType === 'render') {
        current.impressions++;
      } else if (ev.eventType === 'attribution_click' || ev.eventType === 'cta_click') {
        current.clicks++;
      }
      current.lastSeen = ev.timestamp;
      map.set(domain, current);
    }

    return Array.from(map.entries()).map(([domain, data]) => ({
      domain,
      firstSeenAt: data.lastSeen,
      lastSeenAt: data.lastSeen,
      totalImpressions: data.impressions,
      totalClicks: data.clicks,
      activeAssetsCount: 1,
      status: 'active'
    }));
  }
}

export const embedTelemetry = EmbedTelemetryService.getInstance();
