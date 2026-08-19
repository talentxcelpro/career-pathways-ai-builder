import { supabase } from '@/integrations/supabase/client';
import { courseIngestionEngine, RawCoursePayload } from './courseIngestionEngine';

export interface DiscoverySource {
  provider_id: string;
  provider_name: string;
  source_type: 'SITEMAP' | 'RSS_FEED' | 'CATALOGUE_API' | 'STRUCTURED_URL_LIST';
  source_endpoint: string;
}

export interface CandidateCourseUrl {
  raw_url: string;
  title?: string;
  provider_name: string;
  category?: string;
}

export const providerCatalogueDiscoveryService = {

  /**
   * Discover Candidate Course URLs from Provider Sitemaps or Structured Feeds
   */
  async discoverCandidateUrls(source: DiscoverySource): Promise<CandidateCourseUrl[]> {
    console.log(`[Discovery] Initiating course discovery scan for ${source.provider_name} via ${source.source_type}...`);

    // Simulated discovery queue (In production, executed via Supabase Edge Function worker)
    const discoveredList: CandidateCourseUrl[] = [
      {
        raw_url: `${source.source_endpoint}/courses/intro-to-cloud`,
        title: `${source.provider_name} Cloud Practitioner Fundamentals`,
        provider_name: source.provider_name,
        category: 'Cloud Computing'
      },
      {
        raw_url: `${source.source_endpoint}/training/ai-essentials`,
        title: `${source.provider_name} Practical AI & Data Science`,
        provider_name: source.provider_name,
        category: 'Artificial Intelligence & ML'
      }
    ];

    return discoveredList;
  },

  /**
   * Process Discovered Candidate URLs through the Ingestion Pipeline
   * Moves raw candidate -> NEEDS_REVIEW status
   */
  async processDiscoveredCandidate(candidate: CandidateCourseUrl): Promise<boolean> {
    const rawPayload: RawCoursePayload = {
      title: candidate.title || 'Discovered Learning Opportunity',
      provider_name: candidate.provider_name,
      source_url: candidate.raw_url,
      short_description: `Official training course discovered from ${candidate.provider_name}.`,
      category: candidate.category || 'Technology & IT',
      domain: 'Technology & Business',
      level: 'Beginner',
      claimed_free_type: '100% FREE'
    };

    const result = await courseIngestionEngine.processRawCourse(rawPayload);

    if (result.passed && result.audited_course) {
      try {
        await supabase
          .from('aggregated_courses' as any)
          .upsert(result.audited_course);
        return true;
      } catch (err) {
        console.warn("Discovery database insert notice:", err);
      }
    }

    return false;
  }
};
