/**
 * TalentXcel Global Jobs Network — Master Government Source Discovery Coordinator
 * Coordinates discovery across jurisdictional seeds, verifies domains,
 * detects endpoints, and enqueues prospective sources to candidate queue.
 */

import { CountrySourceDiscovery } from './CountrySourceDiscovery';
import { SourceVerifier } from './SourceVerifier';
import { SourceCandidateQueue, SourceCandidate } from './SourceCandidateQueue';

export class GovernmentSourceDiscovery {
  /**
   * Run automated discovery scan across country seeds
   */
  public static async discoverSeeds(): Promise<SourceCandidate[]> {
    const seeds = CountrySourceDiscovery.getSeeds();
    const discovered: SourceCandidate[] = [];

    for (const seed of seeds) {
      const verification = SourceVerifier.verifyDomain(seed.primaryGovDomain);
      if (verification.isOfficialGovDomain) {
        const cand = SourceCandidateQueue.addCandidate({
          portalName: `National Portal (${seed.countryCode})`,
          countryCode: seed.countryCode,
          sourceUrl: seed.primaryGovDomain,
          detectedType: 'PORTAL',
          verificationScore: verification.score,
        });
        discovered.push(cand);
      }
    }

    return discovered;
  }
}
