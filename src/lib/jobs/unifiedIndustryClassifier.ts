/**
 * src/lib/jobs/unifiedIndustryClassifier.ts
 *
 * TalentXcel Multi-Tier Industry Classification Engine
 * Layer 1: Corporate Entity & Organization Knowledge (e.g. JPMorgan -> Banking, Apollo -> Healthcare)
 * Layer 2: Deterministic Title & Subindustry Vocabulary Matching
 * Layer 3: Contextual Skill & Text Corpus Analysis
 * Layer 4: Canonical Fallback
 */

import { CANONICAL_20_INDUSTRIES, IndustryDefinition, getIndustryBySlug } from '@/config/jobs/industryTaxonomy';

export interface ClassificationResult {
  industryId: string;
  industrySlug: string;
  industryName: string;
  subindustrySlug?: string;
  subindustryName?: string;
  confidence: number; // 0.0 to 1.0
  layer: 'ORGANIZATION_KNOWLEDGE' | 'TITLE_MATCH' | 'CONTEXT_ANALYSIS' | 'CANONICAL_FALLBACK';
}

export class UnifiedIndustryClassifier {
  /**
   * Classify any job record into one of the canonical 20 industries.
   */
  public static classify(job: {
    title?: string;
    company_name?: string;
    description?: string;
    industry?: string;
    skills_required?: string[] | null;
  }): ClassificationResult {
    const title = (job.title || '').toLowerCase().trim();
    const company = (job.company_name || '').toLowerCase().trim();
    const existingInd = (job.industry || '').toLowerCase().trim();
    const desc = (job.description || '').toLowerCase();
    const skills = (job.skills_required || []).map(s => s.toLowerCase()).join(' ');

    // -------------------------------------------------------------
    // Layer 0: Direct Match with Existing Industry Name or Slug
    // -------------------------------------------------------------
    if (existingInd) {
      for (const ind of CANONICAL_20_INDUSTRIES) {
        if (
          existingInd === ind.name.toLowerCase() ||
          existingInd === ind.slug ||
          existingInd === ind.id
        ) {
          return {
            industryId: ind.id,
            industrySlug: ind.slug,
            industryName: ind.name,
            confidence: 0.98,
            layer: 'ORGANIZATION_KNOWLEDGE'
          };
        }
      }
    }

    // -------------------------------------------------------------
    // Layer 1: Organization Knowledge Match
    // -------------------------------------------------------------
    for (const ind of CANONICAL_20_INDUSTRIES) {
      for (const compIndicator of ind.companyIndicators) {
        if (company.includes(compIndicator)) {
          // If company is clearly identified, resolve subindustry by title
          const matchedSub = ind.subindustries.find(sub => 
            sub.jobFamilies.some(jf => title.includes(jf.toLowerCase())) ||
            title.includes(sub.name.toLowerCase())
          );

          return {
            industryId: ind.id,
            industrySlug: ind.slug,
            industryName: ind.name,
            subindustrySlug: matchedSub?.slug,
            subindustryName: matchedSub?.name,
            confidence: 0.95,
            layer: 'ORGANIZATION_KNOWLEDGE'
          };
        }
      }
    }

    // -------------------------------------------------------------
    // Layer 2: Deterministic Title & Job Family Match
    // -------------------------------------------------------------
    let bestTitleInd: IndustryDefinition | null = null;
    let bestTitleScore = 0;
    let matchedSubindustry: { slug: string; name: string } | undefined;

    for (const ind of CANONICAL_20_INDUSTRIES) {
      // Check canonical job titles
      for (const cTitle of ind.canonicalJobTitles) {
        const ctLower = cTitle.toLowerCase();
        if (title === ctLower || title.includes(ctLower)) {
          const score = ctLower.length;
          if (score > bestTitleScore) {
            bestTitleScore = score;
            bestTitleInd = ind;
          }
        }
      }

      // Check subindustry job families
      for (const sub of ind.subindustries) {
        for (const jf of sub.jobFamilies) {
          const jfLower = jf.toLowerCase();
          if (title.includes(jfLower)) {
            const score = jfLower.length;
            if (score > bestTitleScore) {
              bestTitleScore = score;
              bestTitleInd = ind;
              matchedSubindustry = { slug: sub.slug, name: sub.name };
            }
          }
        }
      }
    }

    if (bestTitleInd && bestTitleScore > 0) {
      return {
        industryId: bestTitleInd.id,
        industrySlug: bestTitleInd.slug,
        industryName: bestTitleInd.name,
        subindustrySlug: matchedSubindustry?.slug,
        subindustryName: matchedSubindustry?.name,
        confidence: 0.90,
        layer: 'TITLE_MATCH'
      };
    }

    // -------------------------------------------------------------
    // Layer 3: Contextual Keyword & Skill Corpus Analysis
    // -------------------------------------------------------------
    const combinedCorpus = `${title} ${desc.slice(0, 1500)} ${skills}`;
    let highestKeywordMatches = 0;
    let bestCorpusInd: IndustryDefinition | null = null;

    for (const ind of CANONICAL_20_INDUSTRIES) {
      let matches = 0;
      for (const kw of ind.entityKeywords) {
        const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(combinedCorpus)) {
          matches += (title.includes(kw) ? 3 : 1);
        }
      }

      if (matches > highestKeywordMatches) {
        highestKeywordMatches = matches;
        bestCorpusInd = ind;
      }
    }

    if (bestCorpusInd && highestKeywordMatches >= 2) {
      return {
        industryId: bestCorpusInd.id,
        industrySlug: bestCorpusInd.slug,
        industryName: bestCorpusInd.name,
        confidence: Math.min(0.65 + (highestKeywordMatches * 0.05), 0.85),
        layer: 'CONTEXT_ANALYSIS'
      };
    }

    // -------------------------------------------------------------
    // Layer 4: Canonical Fallback
    // If engineering or developer in title -> Information Technology, else general
    // -------------------------------------------------------------
    if (title.includes('engineer') || title.includes('developer') || title.includes('architect') || title.includes('lead')) {
      const it = getIndustryBySlug('information-technology')!;
      return {
        industryId: it.id,
        industrySlug: it.slug,
        industryName: it.name,
        confidence: 0.70,
        layer: 'CANONICAL_FALLBACK'
      };
    }

    // Default to Information Technology as legacy platform default
    const defaultInd = CANONICAL_20_INDUSTRIES[0];
    return {
      industryId: defaultInd.id,
      industrySlug: defaultInd.slug,
      industryName: defaultInd.name,
      confidence: 0.50,
      layer: 'CANONICAL_FALLBACK'
    };
  }
}
