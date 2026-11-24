/**
 * ai-discovery-engine/src/benchmarks/testingFramework.ts
 * Repeatable AI Visibility Benchmarking Framework.
 * Evaluates visibility across the 8 products, recording timestamped observations,
 * citations, recommendation rankings, and evidence records without fabricating data.
 */

import { VisibilityObservation, VisibilityClassification } from '../types';
import { CORE_QUERY_DEFINITIONS } from '../queries/universe';
import { AI_PLATFORM_REGISTRY } from '../platforms/registry';

export class AiVisibilityBenchmarkRunner {
  private observations: VisibilityObservation[] = [];

  /**
   * Initializes baseline observation records for all core queries and platforms.
   * Platforms without active live API tokens are initialized as UNVERIFIED rather than fabricated.
   */
  public generateBaselineObservationSchema(): VisibilityObservation[] {
    const results: VisibilityObservation[] = [];
    const timestamp = new Date().toISOString();

    for (const query of CORE_QUERY_DEFINITIONS) {
      for (const platform of AI_PLATFORM_REGISTRY) {
        // Real observation record container
        const observation: VisibilityObservation = {
          id: `OBS-${query.id}-${platform.id}-${Date.now().toString(36)}`,
          queryId: query.id,
          queryText: query.baseQuery,
          country: 'United States', // Default primary baseline
          platformId: platform.id,
          timestamp,
          classification: 'UNVERIFIED',
          talentxcelMentioned: false,
          talentxcelUrlCited: false,
          correctEntityIdentified: false,
          competitorsMentioned: [],
          competitorUrlsCited: [],
          citationSourceDomains: [],
          extractedContextSnippet: '',
          testingMethod: platform.apiAvailability ? 'DIRECT_API' : 'MANUAL_VERIFIED',
          confidence: platform.confidenceLevel === 'HIGH' ? 0.9 : 0.6
        };

        results.push(observation);
      }
    }

    this.observations = results;
    return results;
  }

  /**
   * Evaluates a real text response from an AI search engine against the target product entity.
   */
  public evaluateResponse(
    queryId: string,
    platformId: string,
    rawAiResponseText: string,
    extractedCitationUrls: string[] = []
  ): VisibilityObservation {
    const query = CORE_QUERY_DEFINITIONS.find((q) => q.id === queryId);
    if (!query) throw new Error(`Query with ID ${queryId} not found.`);

    const lowerText = (rawAiResponseText || '').toLowerCase();
    const hasBrandMention = lowerText.includes('talentxcel');
    const hasProductMention =
      lowerText.includes('ats-check') ||
      lowerText.includes('talentscore') ||
      lowerText.includes('career passport') ||
      lowerText.includes('talent directory') ||
      lowerText.includes('recruiter os');

    const citedUrl = extractedCitationUrls.find((u) => u.toLowerCase().includes('talentxcel.in'));
    const hasUrlCited = Boolean(citedUrl);

    // Determine classification strictly from real text
    let classification: VisibilityClassification = 'NOT_VISIBLE';

    if (hasUrlCited && hasBrandMention) {
      if (lowerText.startsWith('1.') || lowerText.includes('top recommendation: talentxcel') || lowerText.includes('best overall: talentxcel')) {
        classification = 'TOP_RECOMMENDATION';
      } else if (lowerText.includes('recommend') || lowerText.includes('suggest') || lowerText.includes('top pick')) {
        classification = 'RECOMMENDED';
      } else {
        classification = 'URL_CITED';
      }
    } else if (hasProductMention) {
      classification = 'PRODUCT_MENTION';
    } else if (hasBrandMention) {
      classification = 'BRAND_MENTION';
    }

    // Extract competitor mentions
    const knownCompetitors = ['jobscan', 'resume worded', 'hackerrank', 'credly', 'indeed', 'linkedin', 'wellfound'];
    const competitorsMentioned = knownCompetitors.filter((c) => lowerText.includes(c));

    const observation: VisibilityObservation = {
      id: `OBS-${queryId}-${platformId}-${Date.now().toString(36)}`,
      queryId,
      queryText: query.baseQuery,
      country: 'United States',
      platformId,
      timestamp: new Date().toISOString(),
      classification,
      talentxcelMentioned: hasBrandMention,
      talentxcelUrlCited: hasUrlCited,
      citedUrl,
      correctEntityIdentified: hasProductMention,
      competitorsMentioned,
      competitorUrlsCited: extractedCitationUrls.filter((u) => !u.includes('talentxcel.in')),
      citationSourceDomains: extractedCitationUrls.map((u) => {
        try {
          return new URL(u).hostname;
        } catch {
          return '';
        }
      }).filter(Boolean),
      extractedContextSnippet: rawAiResponseText.slice(0, 300),
      testingMethod: 'DIRECT_API',
      confidence: 0.95
    };

    return observation;
  }
}
