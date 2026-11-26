import type { ParsedSearchIntent, UniversalSearchItem } from './types';

/**
 * Explainable Multi-Signal Relevance Ranker.
 * Computes transparent match scores & data-backed matchReasons without using sensitive attributes.
 */
export class RelevanceRanker {
  static rank(items: UniversalSearchItem[], intent: ParsedSearchIntent): UniversalSearchItem[] {
    const queryLower = intent.normalizedQuery;
    const keywords = intent.keywords;

    const scored = items.map((item) => {
      let score = item.score || 0;
      const reasons = new Set<string>(item.matchReasons || []);

      const titleLower = (item.title || '').toLowerCase();
      const subtitleLower = (item.subtitle || '').toLowerCase();
      const snippetLower = (item.snippet || '').toLowerCase();
      const combined = `${titleLower} ${subtitleLower} ${snippetLower}`;

      // 0. Primary Intent Alignment Boost (+25)
      // Ensures target entity types dominate topResults over incidental keyword mentions in secondary scopes
      if (
        (intent.primaryIntent === 'people_search' && (item.type === 'people' || item.type === 'talent' || item.type === 'connections')) ||
        (intent.primaryIntent === 'job_search' && item.type === 'jobs') ||
        (intent.primaryIntent === 'post_search' && item.type === 'posts') ||
        (intent.primaryIntent === 'company_search' && item.type === 'companies') ||
        (intent.primaryIntent === 'community_search' && item.type === 'communities') ||
        (intent.primaryIntent === 'learning_search' && (item.type === 'courses' || item.type === 'articles'))
      ) {
        score += 25;
      }

      // 1. Exact & Prefix Title Match
      if (queryLower && titleLower === queryLower) {
        score += 40;
        reasons.add('Exact match');
      } else if (queryLower && titleLower.startsWith(queryLower)) {
        score += 25;
      } else if (queryLower && titleLower.includes(queryLower)) {
        score += 18;
      }

      // 2. Keyword coverage
      if (keywords.length > 0) {
        let matchedKeywords = 0;
        for (const kw of keywords) {
          if (titleLower.includes(kw)) {
            score += 8;
            matchedKeywords++;
          } else if (combined.includes(kw)) {
            score += 4;
            matchedKeywords++;
          }
        }
        if (matchedKeywords === keywords.length && keywords.length > 1) {
          score += 10;
        }
      }

      // 3. Entity-specific explainable signals
      const metaSkills = Array.isArray(item.metadata?.skills)
        ? (item.metadata.skills as string[]).map((s) => s.toLowerCase())
        : [];

      for (const skill of intent.entities.skills) {
        const skillLower = skill.toLowerCase();
        if (metaSkills.some((ms) => ms.includes(skillLower)) || combined.includes(skillLower)) {
          score += 12;
          reasons.add(`Matches ${skill}`);
        }
      }

      for (const loc of intent.entities.locations) {
        const locLower = loc.toLowerCase();
        const itemLoc = String(item.metadata?.location || subtitleLower).toLowerCase();
        if (itemLoc.includes(locLower)) {
          score += 10;
          reasons.add(`Located in ${loc}`);
        }
      }

      if (intent.filters.isRemote && (item.metadata?.is_remote === true || combined.includes('remote'))) {
        score += 10;
        reasons.add('Remote');
      }

      for (const comp of intent.entities.companies) {
        if (combined.includes(comp.toLowerCase())) {
          score += 12;
          reasons.add(`Company: ${comp}`);
        }
      }

      for (const ind of intent.entities.industries) {
        if (combined.includes(ind.toLowerCase())) {
          score += 8;
          reasons.add(`Industry: ${ind}`);
        }
      }

      // 4. Experience match
      const expYears = typeof item.metadata?.experience_years === 'number' ? item.metadata.experience_years : undefined;
      if (expYears !== undefined && intent.filters.experienceMin !== undefined) {
        if (expYears >= intent.filters.experienceMin) {
          score += 10;
          reasons.add(`${expYears} yrs experience`);
        }
      }

      // 5. Recency & freshness (gentle decay, doesn't permanently bury older high-match items)
      if (item.createdAt) {
        const ageDays = Math.max(0, (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        if (ageDays <= 1) score += 8;
        else if (ageDays <= 7) score += 5;
        else if (ageDays <= 30) score += 2;
      }

      // 6. Verification / Profile completeness boost (non-discriminatory)
      if (item.metadata?.is_verified === true) {
        score += 4;
      }

      return {
        ...item,
        score: Math.round(score * 10) / 10,
        matchReasons: Array.from(reasons).slice(0, 4),
      };
    });

    // Sort based on intent.sortBy
    return scored.sort((a, b) => {
      if (intent.sortBy === 'recent') {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
      }
      if (intent.sortBy === 'salary_desc') {
        const sa = Number(a.metadata?.salary_max || a.metadata?.salary_min || 0);
        const sb = Number(b.metadata?.salary_max || b.metadata?.salary_min || 0);
        if (sb !== sa) return sb - sa;
      }
      return b.score - a.score;
    });
  }
}
