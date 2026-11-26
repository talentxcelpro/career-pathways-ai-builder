// src/lib/seo/demandIntelligence/fastMatcher.ts
// O(1) N-gram Map-based entity lookup capable of matching 170k+ GeoNames cities,
// 50k+ O*NET/ESCO job titles, and 35k+ skills without regex backtracking.

export interface FastGeoCityEntry {
  geonameId: number;
  name: string;
  slug: string;
  countryCode: string;
  admin1Code: string | null;
  population: number;
  isEmploymentHub: boolean;
}

export interface FastGeoRegionEntry {
  regionCode: string;
  countryCode: string;
  name: string;
}

export interface FastGeoCountryEntry {
  countryCode: string;
  iso3: string;
  name: string;
  slug: string;
}

export interface FastJobTitleEntry {
  titleId: string;
  canonicalTitle: string;
  slug: string;
  socCode: string | null;
  industrySlug: string | null;
}

export interface FastSkillEntry {
  skillId: string;
  canonicalSkill: string;
  slug: string;
  category: string;
}

// Common English words that match obscure towns worldwide unless contextualized by preposition "in <city>"
const AMBIGUOUS_SINGLE_WORD_GEO = new Set([
  'job', 'jobs', 'work', 'career', 'hire', 'best', 'good', 'new', 'old', 'real', 'top',
  'nice', 'reading', 'bath', 'mobile', 'java', 'oracle', 'agile', 'spark', 'ruby',
  'go', 'of', 'in', 'at', 'for', 'to', 'on', 'as', 'is', 'it', 'by', 'or', 'us', 'uk',
  'lead', 'manager', 'nurse', 'teacher', 'data', 'sales', 'remote', 'hybrid', 'intern',
  'fresher', 'salary', 'resume', 'code', 'cloud', 'ai', 'ml', 'hr', 'qa', 'ui', 'ux',
  'man', 'men', 'city', 'port', 'york', 'union', 'hope', 'grace', 'grant', 'victor',
]);

export class FastTaxonomyMatcher {
  private readonly cityMap = new Map<string, FastGeoCityEntry>();
  private readonly regionMap = new Map<string, FastGeoRegionEntry>();
  private readonly countryMap = new Map<string, FastGeoCountryEntry>();
  private readonly titleMap = new Map<string, FastJobTitleEntry>();
  private readonly skillMap = new Map<string, FastSkillEntry>();

  public addCity(key: string, entry: FastGeoCityEntry): void {
    const k = key.trim().toLowerCase();
    if (!k || k.length < 3) return;
    if (AMBIGUOUS_SINGLE_WORD_GEO.has(k) && entry.population < 500000) return;
    const prev = this.cityMap.get(k);
    if (!prev || entry.population > prev.population) {
      this.cityMap.set(k, entry);
    }
  }

  public addRegion(key: string, entry: FastGeoRegionEntry): void {
    const k = key.trim().toLowerCase();
    if (!k || k.length < 3 || AMBIGUOUS_SINGLE_WORD_GEO.has(k)) return;
    if (!this.regionMap.has(k)) this.regionMap.set(k, entry);
  }

  public addCountry(key: string, entry: FastGeoCountryEntry): void {
    const k = key.trim().toLowerCase();
    if (!k || k.length < 2) return;
    if (!this.countryMap.has(k)) this.countryMap.set(k, entry);
  }

  public addJobTitle(key: string, entry: FastJobTitleEntry): void {
    const k = key.trim().toLowerCase();
    if (!k || k.length < 3) return;
    if (!this.titleMap.has(k)) this.titleMap.set(k, entry);
  }

  public addSkill(key: string, entry: FastSkillEntry): void {
    const k = key.trim().toLowerCase();
    if (!k || k.length < 2) return;
    if (!this.skillMap.has(k)) this.skillMap.set(k, entry);
  }

  /**
   * Generates longest-first n-grams (up to 4 words) from pre-tokenized query.
   */
  public matchEntities(tokens: string[]): {
    city: FastGeoCityEntry | null;
    region: FastGeoRegionEntry | null;
    country: FastGeoCountryEntry | null;
    jobTitle: FastJobTitleEntry | null;
    skill: FastSkillEntry | null;
  } {
    const n = tokens.length;
    let city: FastGeoCityEntry | null = null;
    let region: FastGeoRegionEntry | null = null;
    let country: FastGeoCountryEntry | null = null;
    let jobTitle: FastJobTitleEntry | null = null;
    let skill: FastSkillEntry | null = null;

    // Search longest phrases (4 -> 1 tokens), right-to-left for geography, left-to-right for role/skill
    for (let len = Math.min(4, n); len >= 1; len -= 1) {
      // Right-to-left geo search ensures "jobs in los angeles" prioritizes trailing geo phrases
      if (!city || !region || !country) {
        for (let i = n - len; i >= 0; i -= 1) {
          const phrase = len === 1 ? tokens[i] : tokens.slice(i, i + len).join(' ');
          if (!city) {
            const c = this.cityMap.get(phrase);
            if (c) {
              // For single-word ambiguous town names (e.g. mobile, java, reading), require preceding "in"
              if (len === 1 && AMBIGUOUS_SINGLE_WORD_GEO.has(phrase)) {
                if (i > 0 && tokens[i - 1] === 'in') city = c;
              } else {
                city = c;
              }
            }
          }
          if (!country) {
            const co = this.countryMap.get(phrase);
            if (co) country = co;
          }
          if (!region) {
            const reg = this.regionMap.get(phrase);
            if (reg) region = reg;
          }
        }
      }

      if (!jobTitle || !skill) {
        for (let i = 0; i <= n - len; i += 1) {
          const phrase = len === 1 ? tokens[i] : tokens.slice(i, i + len).join(' ');
          if (!jobTitle) {
            const jt = this.titleMap.get(phrase);
            if (jt) jobTitle = jt;
          }
          if (!skill) {
            const sk = this.skillMap.get(phrase);
            if (sk) skill = sk;
          }
        }
      }
    }

    return { city, region, country, jobTitle, skill };
  }

  public stats() {
    return {
      citiesIndexed: this.cityMap.size,
      regionsIndexed: this.regionMap.size,
      countriesIndexed: this.countryMap.size,
      jobTitlesIndexed: this.titleMap.size,
      skillsIndexed: this.skillMap.size,
    };
  }
}
