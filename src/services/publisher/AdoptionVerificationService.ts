// src/services/publisher/AdoptionVerificationService.ts
// TalentXcel Global Embed Adoption Engine — Multi-Level Adoption Verification Engine

import { AdoptionVerificationLevel, PublisherPipelineStage } from '@/types/publisherAdoption';
import { embedTelemetry } from '@/services/embed/EmbedTelemetryService';
import { supabase } from '@/integrations/supabase/client';

export interface VerificationResult {
  publisherDomain: string;
  adoptionLevel: AdoptionVerificationLevel;
  stage: PublisherPipelineStage;
  hasTelemetryObservation: boolean;
  domVerified: boolean;
  verifiedAt: string;
  notes: string;
  isTestFixture?: boolean;
}

export class AdoptionVerificationService {
  private static instance: AdoptionVerificationService;
  private verifiedDomains: Map<string, VerificationResult> = new Map();
  private isTestMode: boolean = false;

  private constructor() {
    // Clean production default: Do NOT seed mock fixtures in operational constructor!
    // Test environments or sandbox toggles must explicitly call loadTestFixtures().
  }

  public static getInstance(): AdoptionVerificationService {
    if (!AdoptionVerificationService.instance) {
      AdoptionVerificationService.instance = new AdoptionVerificationService();
    }
    return AdoptionVerificationService.instance;
  }

  /**
   * Explicitly load test fixtures for unit tests or isolated demonstration sandboxes.
   * NEVER called in production operational workflows.
   */
  public loadTestFixtures(): void {
    this.isTestMode = true;
    const pilots = [
      { domain: 'iitm.ac.in', level: 5 as AdoptionVerificationLevel, notes: '[TEST FIXTURE] Official Placement Cell verified embed' },
      { domain: 'careers360.com', level: 5 as AdoptionVerificationLevel, notes: '[TEST FIXTURE] Higher Ed article editorial link verified' },
      { domain: 'peoplematters.in', level: 5 as AdoptionVerificationLevel, notes: '[TEST FIXTURE] HR Tech workforce article verified' },
      { domain: 'dev.to', level: 4 as AdoptionVerificationLevel, notes: '[TEST FIXTURE] Observed telemetry impressions from post' }
    ];

    for (const p of pilots) {
      this.verifiedDomains.set(p.domain, {
        publisherDomain: p.domain,
        adoptionLevel: p.level,
        stage: p.level === 5 ? 'adoption_verified' : 'embed_adopted',
        hasTelemetryObservation: true,
        domVerified: p.level === 5,
        verifiedAt: new Date().toISOString(),
        notes: p.notes,
        isTestFixture: true
      });
    }
  }

  /**
   * Clear all verified domains (for testing clean slate or resetting cache)
   */
  public clearVerifications(): void {
    this.verifiedDomains.clear();
    this.isTestMode = false;
  }

  public isUsingTestFixtures(): boolean {
    return this.isTestMode;
  }

  public listVerifiedAdoptions(): VerificationResult[] {
    return Array.from(this.verifiedDomains.values());
  }

  /**
   * Evaluates telemetry activity against publisher domains
   */
  public verifyDomainAdoption(domain: string): VerificationResult {
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Check existing
    if (this.verifiedDomains.has(cleanDomain)) {
      return this.verifiedDomains.get(cleanDomain)!;
    }

    // Check telemetry
    const publishers = embedTelemetry.getPublisherDomainInsights();
    const telemetryMatch = publishers.find((p) => p.domain.toLowerCase().includes(cleanDomain));

    if (telemetryMatch && telemetryMatch.totalImpressions > 0) {
      const res: VerificationResult = {
        publisherDomain: cleanDomain,
        adoptionLevel: 4, // Observed
        stage: 'embed_adopted',
        hasTelemetryObservation: true,
        domVerified: false,
        verifiedAt: new Date().toISOString(),
        notes: `Observed ${telemetryMatch.totalImpressions} live renders via embed telemetry`
      };
      this.verifiedDomains.set(cleanDomain, res);
      return res;
    }

    const res: VerificationResult = {
      publisherDomain: cleanDomain,
      adoptionLevel: 1, // Offered
      stage: 'contact_ready',
      hasTelemetryObservation: false,
      domVerified: false,
      verifiedAt: new Date().toISOString(),
      notes: 'No live telemetry observed yet'
    };
    return res;
  }

  /**
   * Manually confirm verified level 5 adoption after inspecting publisher page
   */
  public markVerified(domain: string, notes: string = 'Manually audited & confirmed'): VerificationResult {
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const res: VerificationResult = {
      publisherDomain: cleanDomain,
      adoptionLevel: 5,
      stage: 'adoption_verified',
      hasTelemetryObservation: true,
      domVerified: true,
      verifiedAt: new Date().toISOString(),
      notes
    };
    this.verifiedDomains.set(cleanDomain, res);
    return res;
  }

  /**
   * Asynchronously load verified adoptions from Supabase `embed_adoptions` table
   */
  public async fetchVerifiedAdoptionsFromDb(): Promise<VerificationResult[]> {
    try {
      const { data, error } = await supabase
        .from('embed_adoptions' as any)
        .select('*');

      if (error || !data) {
        return this.listVerifiedAdoptions();
      }

      for (const row of (data as any[])) {
        const cleanDomain = String(row.domain).toLowerCase();
        this.verifiedDomains.set(cleanDomain, {
          publisherDomain: cleanDomain,
          adoptionLevel: Number(row.verification_level) as AdoptionVerificationLevel,
          stage: Number(row.verification_level) >= 5 ? 'adoption_verified' : 'embed_adopted',
          hasTelemetryObservation: Boolean(row.has_telemetry),
          domVerified: Boolean(row.dom_verified),
          verifiedAt: row.verified_at || row.created_at || new Date().toISOString(),
          notes: row.notes || 'Persisted from Supabase embed_adoptions'
        });
      }

      return this.listVerifiedAdoptions();
    } catch {
      return this.listVerifiedAdoptions();
    }
  }

  /**
   * Persist a verified adoption to Supabase
   */
  public async persistAdoption(params: {
    publisherId?: string;
    domain: string;
    assetId: string;
    targetPageUrl?: string;
    level: AdoptionVerificationLevel;
    domVerified?: boolean;
    hasTelemetry?: boolean;
    notes?: string;
    verifiedBy?: string;
  }): Promise<VerificationResult> {
    const cleanDomain = params.domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const result = this.markVerified(cleanDomain, params.notes || 'Verified placement confirmed');

    try {
      await supabase
        .from('embed_adoptions' as any)
        .upsert({
          publisher_id: params.publisherId || null,
          domain: cleanDomain,
          asset_id: params.assetId,
          target_page_url: params.targetPageUrl || null,
          verification_level: params.level,
          dom_verified: params.domVerified ?? true,
          has_telemetry: params.hasTelemetry ?? false,
          notes: params.notes || null,
          verified_by: params.verifiedBy || 'system_admin',
          verified_at: new Date().toISOString()
        }, { onConflict: 'domain' });
    } catch {
      // In offline or preview sandbox, local Map stores result
    }

    return result;
  }
}

export const adoptionVerifier = AdoptionVerificationService.getInstance();
