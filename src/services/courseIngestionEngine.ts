import { supabase } from '@/integrations/supabase/client';
import { AggregatedCourse } from '@/types/learningAggregator';

export type IngestionStage = 
  | 'IMPORTED'
  | 'NEEDS_REVIEW'
  | 'METADATA_VALIDATED'
  | 'SOURCE_CHECKED'
  | 'FREE_STATUS_CHECKED'
  | 'CERTIFICATE_STATUS_CHECKED'
  | 'VERIFIED'
  | 'REJECTED';

export interface RawCoursePayload {
  title: string;
  provider_name: string;
  source_url: string;
  short_description: string;
  category: string;
  domain: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_text?: string;
  claimed_free_type?: string;
  claimed_certificate_type?: string;
  skills?: string[];
}

export interface VerificationAuditResult {
  passed: boolean;
  stage: IngestionStage;
  canonical_url: string;
  rejection_reason?: string;
  audited_course?: Partial<AggregatedCourse>;
}

export const courseIngestionEngine = {

  /**
   * Normalize and sanitize canonical URL to prevent duplication
   */
  normalizeCanonicalUrl(url: string): string {
    try {
      const parsed = new URL(url.trim());
      parsed.searchParams.delete('utm_source');
      parsed.searchParams.delete('utm_medium');
      parsed.searchParams.delete('utm_campaign');
      parsed.searchParams.delete('ref');
      parsed.searchParams.delete('fbclid');
      parsed.searchParams.delete('gclid');
      
      let clean = parsed.toString();
      if (clean.endsWith('/')) {
        clean = clean.slice(0, -1);
      }
      return clean;
    } catch {
      return url.trim().toLowerCase();
    }
  },

  /**
   * Strict Ingestion Pipeline:
   * Newly ingested course payloads ALWAYS DEFAULT TO 'NEEDS_REVIEW'!
   * Lifecycle: RAW PAYLOAD -> IMPORTED -> NEEDS_REVIEW -> METADATA_VALIDATED -> SOURCE_CHECKED
   */
  async processRawCourse(payload: RawCoursePayload): Promise<VerificationAuditResult> {
    // Stage 1: IMPORTED
    if (!payload.title || !payload.source_url || !payload.provider_name) {
      return {
        passed: false,
        stage: 'REJECTED',
        canonical_url: '',
        rejection_reason: 'Missing core metadata: title, source_url, or provider_name required.'
      };
    }

    const canonicalUrl = this.normalizeCanonicalUrl(payload.source_url);

    // Stage 2: Canonical Deduplication Check
    try {
      const { data: existing } = await supabase
        .from('aggregated_courses' as any)
        .select('id, canonical_url, verification_status')
        .eq('canonical_url', canonicalUrl)
        .maybeSingle();

      if (existing) {
        return {
          passed: false,
          stage: 'REJECTED',
          canonical_url: canonicalUrl,
          rejection_reason: `Duplicate course canonical URL already exists in database (ID: ${(existing as any).id}).`
        };
      }
    } catch (err) {
      console.warn("Canonical check DB notice:", err);
    }

    // Stage 3: METADATA_VALIDATED
    const cleanTitle = payload.title.trim();
    const cleanSlug = payload.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const category = payload.category || 'General Skill';
    const domain = payload.domain || 'Technology & Business';
    const level = payload.level || 'Beginner';

    // Stage 4: SOURCE_CHECKED (Valid HTTP URL Format)
    const isUrlValid = payload.source_url.startsWith('http://') || payload.source_url.startsWith('https://');
    if (!isUrlValid) {
      return {
        passed: false,
        stage: 'REJECTED',
        canonical_url: canonicalUrl,
        rejection_reason: 'Invalid HTTP source_url endpoint.'
      };
    }

    // Stage 5: Placed in NEEDS_REVIEW (DO NOT auto-promote to VERIFIED)
    const pendingCourse: Partial<AggregatedCourse> = {
      id: `course-${cleanSlug}`,
      title: cleanTitle,
      slug: cleanSlug,
      provider_name: payload.provider_name,
      source_url: payload.source_url,
      canonical_url: canonicalUrl,
      short_description: payload.short_description,
      category,
      domain,
      level,
      duration_text: payload.duration_text || 'Self-Paced',
      free_type: payload.claimed_free_type || '100% FREE',
      certificate_type: payload.claimed_certificate_type || 'NO_CERTIFICATE',
      skills: payload.skills || [cleanTitle],
      career_relevance: [category],
      verification_status: 'NEEDS_REVIEW', // Strict Default = NEEDS_REVIEW
      last_verified_at: new Date().toISOString()
    };

    return {
      passed: true,
      stage: 'NEEDS_REVIEW', // Successfully ingested into NEEDS_REVIEW queue
      canonical_url: canonicalUrl,
      audited_course: pendingCourse
    };
  },

  /**
   * Explicit Administrative Promotion from NEEDS_REVIEW -> VERIFIED
   */
  async promoteToVerified(courseId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('aggregated_courses' as any)
        .update({
          verification_status: 'VERIFIED',
          last_verified_at: new Date().toISOString()
        })
        .eq('id', courseId);

      return !error;
    } catch {
      return false;
    }
  }
};
