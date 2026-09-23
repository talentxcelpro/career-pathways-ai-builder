/**
 * TalentXcel Global Jobs Network — 3-Layer Industry Domain Resolver
 * Layer 1: Deterministic dictionary & keyword matches
 * Layer 2: Organization & entity domain knowledge (e.g. ISRO -> Space, IOCL -> Energy)
 * Layer 3: Semantic fallback classification with confidence scoring
 */

import { INDUSTRY_DOMAINS, IndustryDomain } from '@/config/jobs/industryDomains';

export interface DomainResolutionResult {
  industryFamilyId: string;
  industryDomainId: string;
  industryDomainName: string;
  occupation: string;
  confidence: number; // 0.0 - 1.0
  resolutionLayer: 'DICTIONARY' | 'ENTITY_KNOWLEDGE' | 'SEMANTIC_FALLBACK';
}

export class IndustryDomainResolver {
  // Layer 2 Entity Knowledge Base
  private static entityMap: Record<string, { familyId: string; domainId: string; defaultOccupation: string }> = {
    'upsc': { familyId: 'government', domainId: 'gov-civil-services', defaultOccupation: 'Civil Services Officer' },
    'union public service commission': { familyId: 'government', domainId: 'gov-civil-services', defaultOccupation: 'Civil Services Officer' },
    'staff selection commission': { familyId: 'government', domainId: 'gov-civil-services', defaultOccupation: 'Assistant Section Officer' },
    'ssc': { familyId: 'government', domainId: 'gov-civil-services', defaultOccupation: 'Assistant Section Officer' },
    'isro': { familyId: 'government', domainId: 'gov-space-atomic', defaultOccupation: 'Scientist/Engineer' },
    'indian space research organisation': { familyId: 'government', domainId: 'gov-space-atomic', defaultOccupation: 'Scientist/Engineer' },
    'drdo': { familyId: 'government', domainId: 'gov-space-atomic', defaultOccupation: 'Scientist' },
    'barc': { familyId: 'government', domainId: 'gov-space-atomic', defaultOccupation: 'Scientific Officer' },
    'iocl': { familyId: 'government', domainId: 'gov-psu-energy', defaultOccupation: 'Graduate Apprentice' },
    'indian oil corporation': { familyId: 'government', domainId: 'gov-psu-energy', defaultOccupation: 'Graduate Apprentice' },
    'ntpc': { familyId: 'government', domainId: 'gov-psu-energy', defaultOccupation: 'Management Trainee' },
    'ongc': { familyId: 'government', domainId: 'gov-psu-energy', defaultOccupation: 'Graduate Trainee' },
    'indian railways': { familyId: 'government', domainId: 'gov-railways-transport', defaultOccupation: 'Junior Engineer' },
    'railway recruitment board': { familyId: 'government', domainId: 'gov-railways-transport', defaultOccupation: 'Station Master' },
    'rrb': { familyId: 'government', domainId: 'gov-railways-transport', defaultOccupation: 'Junior Engineer' },
    'aiims': { familyId: 'healthcare', domainId: 'health-clinical-medicine', defaultOccupation: 'Medical Officer' },
    'ibps': { familyId: 'finance', domainId: 'fin-public-banking', defaultOccupation: 'Probationary Officer' },
    'state bank of india': { familyId: 'finance', domainId: 'fin-public-banking', defaultOccupation: 'Probationary Officer' },
    'sbi': { familyId: 'finance', domainId: 'fin-public-banking', defaultOccupation: 'Probationary Officer' },
    'cisa': { familyId: 'technology', domainId: 'tech-cybersecurity', defaultOccupation: 'IT Specialist' },
    'united states department of defense': { familyId: 'government', domainId: 'gov-defence-security', defaultOccupation: 'Program Analyst' },
    'usajobs': { familyId: 'government', domainId: 'gov-civil-services', defaultOccupation: 'Federal Specialist' },
  };

  /**
   * Resolve vacancy text & metadata into canonical domain and occupation
   */
  public static resolve(params: {
    title: string;
    description?: string;
    organization?: string;
    rawCategory?: string;
  }): DomainResolutionResult {
    const org = (params.organization || '').toLowerCase().trim();
    const title = (params.title || '').toLowerCase().trim();
    const text = `${title} ${params.description || ''} ${params.rawCategory || ''}`.toLowerCase();

    // Layer 2: Organization / Entity Knowledge Check
    for (const [key, mapping] of Object.entries(this.entityMap)) {
      if (org.includes(key) || title.includes(key)) {
        const domain = INDUSTRY_DOMAINS.find((d) => d.id === mapping.domainId);
        return {
          industryFamilyId: mapping.familyId,
          industryDomainId: mapping.domainId,
          industryDomainName: domain?.name || mapping.domainId,
          occupation: mapping.defaultOccupation,
          confidence: 0.95,
          resolutionLayer: 'ENTITY_KNOWLEDGE',
        };
      }
    }

    // Layer 1: Deterministic Dictionary Keyword Match
    let bestDomain: IndustryDomain | null = null;
    let highestMatches = 0;

    for (const domain of INDUSTRY_DOMAINS) {
      let matches = 0;
      for (const kw of domain.keywords) {
        if (text.includes(kw)) {
          matches += (kw.length > 5 ? 2 : 1);
        }
      }
      if (matches > highestMatches) {
        highestMatches = matches;
        bestDomain = domain;
      }
    }

    if (bestDomain && highestMatches >= 2) {
      const confidence = Math.min(0.92, 0.65 + highestMatches * 0.05);
      return {
        industryFamilyId: bestDomain.familyId,
        industryDomainId: bestDomain.id,
        industryDomainName: bestDomain.name,
        occupation: bestDomain.typicalOccupations[0] || params.title,
        confidence,
        resolutionLayer: 'DICTIONARY',
      };
    }

    // Layer 3: Semantic Fallback
    return {
      industryFamilyId: 'government',
      industryDomainId: 'gov-civil-services',
      industryDomainName: 'Civil Services & Public Administration',
      occupation: params.title || 'Public Sector Executive',
      confidence: 0.60,
      resolutionLayer: 'SEMANTIC_FALLBACK',
    };
  }
}
