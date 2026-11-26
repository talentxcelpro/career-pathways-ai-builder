import type {
  ActivityFilter,
  ParsedSearchIntent,
  QueryComplexity,
  RelationshipFilter,
  SearchEntityType,
  SearchPrimaryIntent,
  SearchSortBy,
  TimeRangeFilter,
} from './types';

// ── Normalization Dictionaries ───────────────────────────────────────────────

const CITY_SYNONYMS: Record<string, string> = {
  bangalore: 'Bengaluru',
  bengaluru: 'Bengaluru',
  blr: 'Bengaluru',
  gurgaon: 'Gurugram',
  gurugram: 'Gurugram',
  bombay: 'Mumbai',
  mumbai: 'Mumbai',
  calcutta: 'Kolkata',
  kolkata: 'Kolkata',
  madras: 'Chennai',
  chennai: 'Chennai',
  delhi: 'Delhi',
  'new delhi': 'Delhi',
  'delhi ncr': 'Delhi NCR',
  ncr: 'Delhi NCR',
  noida: 'Noida',
  hyderabad: 'Hyderabad',
  hyd: 'Hyderabad',
  pune: 'Pune',
  dubai: 'Dubai',
  uae: 'UAE',
  'middle east': 'Middle East',
  india: 'India',
  singapore: 'Singapore',
  london: 'London',
  'san francisco': 'San Francisco',
  'new york': 'New York',
  remote: 'Remote',
};

const DELHI_NCR_CITIES = ['Delhi', 'Noida', 'Gurugram', 'Faridabad', 'Ghaziabad'];

const SKILL_SYNONYMS: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  py: 'Python',
  python: 'Python',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  aws: 'AWS',
  'amazon web services': 'AWS',
  gcp: 'Google Cloud',
  azure: 'Azure',
  java: 'Java',
  sap: 'SAP',
  sql: 'SQL',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  k8s: 'Kubernetes',
  ai: 'AI',
  'artificial intelligence': 'AI',
  ml: 'Machine Learning',
  'machine learning': 'Machine Learning',
  'data engineering': 'Data Engineering',
  'data analytics': 'Data Analytics',
  'data science': 'Data Science',
  'digital marketing': 'Digital Marketing',
  'supply chain': 'Supply Chain Management',
  'supply chain management': 'Supply Chain Management',
  figma: 'Figma',
  ats: 'ATS',
  seo: 'SEO',
  devops: 'DevOps',
  salesforce: 'Salesforce',
  excel: 'Excel',
  tableau: 'Tableau',
  powerbi: 'Power BI',
  'power bi': 'Power BI',
};

const ROLE_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\b(hr\s*managers?|human\s*resources?\s*managers?)\b/i, canonical: 'HR Manager' },
  { pattern: /\b(hr\s*professionals?|human\s*resources?|hr)\b/i, canonical: 'HR' },
  { pattern: /\b(recruiters?|talent\s*acquisition|ta\s*specialist)\b/i, canonical: 'Recruiter' },
  { pattern: /\b(software\s*engineers?|software\s*developers?|swe|sde)\b/i, canonical: 'Software Engineer' },
  { pattern: /\b(full\s*stack\s*developers?|fullstack\s*engineers?)\b/i, canonical: 'Full Stack Developer' },
  { pattern: /\b(frontend\s*developers?|frontend\s*engineers?)\b/i, canonical: 'Frontend Developer' },
  { pattern: /\b(backend\s*developers?|backend\s*engineers?)\b/i, canonical: 'Backend Developer' },
  { pattern: /\b(data\s*analysts?)\b/i, canonical: 'Data Analyst' },
  { pattern: /\b(data\s*scientists?)\b/i, canonical: 'Data Scientist' },
  { pattern: /\b(data\s*engineers?)\b/i, canonical: 'Data Engineer' },
  { pattern: /\b(product\s*managers?|pm)\b/i, canonical: 'Product Manager' },
  { pattern: /\b(marketing\s*managers?)\b/i, canonical: 'Marketing Manager' },
  { pattern: /\b(sales\s*professionals?|sales\s*managers?|sales)\b/i, canonical: 'Sales' },
  { pattern: /\b(ui\/?ux\s*designers?|product\s*designers?)\b/i, canonical: 'UI/UX Designer' },
  { pattern: /\b(startup\s*founders?|founders?|co-?founders?)\b/i, canonical: 'Founder' },
  { pattern: /\b(consultants?)\b/i, canonical: 'Consultant' },
  { pattern: /\b(developers?|engineers?)\b/i, canonical: 'Developer' },
  { pattern: /\b(managers?)\b/i, canonical: 'Manager' },
];

const INDUSTRY_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\b(fintech|financial\s*technology)\b/i, canonical: 'Fintech' },
  { pattern: /\b(finance|banking|investment)\b/i, canonical: 'Finance' },
  { pattern: /\b(healthcare|health\s*care|medical)\b/i, canonical: 'Healthcare' },
  { pattern: /\b(pharma|pharmaceuticals?)\b/i, canonical: 'Pharmaceuticals' },
  { pattern: /\b(it\s*industry|information\s*technology|\bit\b)\b/i, canonical: 'IT' },
  { pattern: /\b(manufacturing)\b/i, canonical: 'Manufacturing' },
  { pattern: /\b(e-?commerce|retail)\b/i, canonical: 'E-commerce' },
  { pattern: /\b(edtech|education)\b/i, canonical: 'Education' },
  { pattern: /\b(startups?|startup\s*ecosystem)\b/i, canonical: 'Startups' },
  { pattern: /\b(saas|software)\b/i, canonical: 'Software' },
  { pattern: /\b(marketing|advertising)\b/i, canonical: 'Marketing' },
];

const KNOWN_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Netflix',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'Paytm',
  'Infosys',
  'TCS',
  'Wipro',
  'Accenture',
  'Deloitte',
  'IBM',
  'Oracle',
  'SAP',
  'Uber',
  'Adobe',
  'Salesforce',
  'OpenAI',
  'Stripe',
  'Figma',
  'Databricks',
  'Datadog',
  'Snowflake',
  'Canva',
  'Meesho',
  'Groww',
  'CRED',
  'Cloudflare',
  'Airtable',
  'Notion',
  'HDFC Bank',
  'Tata Steel',
  'NTPC',
  'ServiceNow',
  'Perplexity AI',
  'Rubrik',
  'GitLab',
  'Zscaler',
  'Twilio',
  'Okta',
  'Palantir',
  'Cars24',
  'Canonical',
  'Bajaj Auto',
];

const EDUCATION_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\bmba\b/i, canonical: 'MBA' },
  { pattern: /\bb\.?tech\b|\bb\.?e\b|\bengineering\s*(graduates?|colleges?)\b/i, canonical: 'B.Tech / Engineering' },
  { pattern: /\bm\.?tech\b/i, canonical: 'M.Tech' },
  { pattern: /\bbca\b|\bmca\b/i, canonical: 'BCA / MCA' },
  { pattern: /\bphd\b|\bdoctorate\b/i, canonical: 'PhD' },
];

const STOP_WORDS = new Set([
  'find', 'show', 'me', 'get', 'search', 'for', 'in', 'at', 'with', 'who', 'are', 'is', 'the',
  'a', 'an', 'of', 'to', 'and', 'or', 'by', 'from', 'about', 'related', 'on', 'that', 'have',
  'has', 'been', 'working', 'work', 'works', 'currently', 'looking', 'open', 'suitable', 'containing',
  'people', 'professionals', 'candidates', 'jobs', 'job', 'positions', 'roles', 'opportunities',
  'posts', 'discussions', 'articles', 'guides', 'communities', 'companies', 'recruiters', 'connections',
  'talent', 'reels', 'videos', 'courses', 'messages', 'more', 'than', 'less', 'above', 'over', 'under',
  'years', 'year', 'yrs', 'yr', 'experience', 'experienced', 'paying', 'salary', 'posted', 'published',
  'shared', 'last', 'this', 'my', 'their', 'all', 'actively', 'recently', 'available', 'joining', 'joined',
  'talentxcel', 'platform',
]);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeRawQuery(raw: string): string {
  return (raw || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, 300);
}

/**
 * Deterministic Natural Language Query Interpreter.
 * Converts human queries into structured intent, entities, filters, and target scopes
 * without external LLM latency or cost.
 */
export class QueryInterpreter {
  static parse(rawQuery: string): ParsedSearchIntent {
    const cleanRaw = sanitizeRawQuery(rawQuery);
    const normalizedQuery = cleanRaw.toLowerCase().replace(/\s+/g, ' ').trim();

    if (!normalizedQuery) {
      return {
        rawQuery: cleanRaw,
        normalizedQuery: '',
        cleanText: '',
        keywords: [],
        primaryIntent: 'universal',
        targetScopes: ['people', 'jobs', 'posts', 'companies', 'communities'],
        complexity: 'simple',
        entities: { roles: [], skills: [], locations: [], companies: [], industries: [], education: [] },
        filters: { cities: [], workModes: [], employmentTypes: [], activities: [] },
        sortBy: 'relevance',
        confidence: 1,
        explanationChips: [],
      };
    }

    const explanationChips: string[] = [];

    // 1. Extract Entities: Roles, Skills, Locations, Companies, Industries, Education
    const roles: string[] = [];
    for (const { pattern, canonical } of ROLE_PATTERNS) {
      if (pattern.test(normalizedQuery) && !roles.includes(canonical)) {
        roles.push(canonical);
      }
    }

    const skills: string[] = [];
    for (const [alias, canonical] of Object.entries(SKILL_SYNONYMS)) {
      const re = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
      if (re.test(normalizedQuery) && !skills.includes(canonical)) {
        skills.push(canonical);
      }
    }

    // Determine skill conjunction mode: AND vs OR
    let skillMatchMode: 'and' | 'or' | undefined;
    if (skills.length > 1) {
      if (/\b(?:and|both|with\s+both)\b/i.test(normalizedQuery)) {
        skillMatchMode = 'and';
      } else if (/\b(?:or|either)\b/i.test(normalizedQuery)) {
        skillMatchMode = 'or';
      }
    }

    const locations: string[] = [];
    const cities: string[] = [];
    for (const [alias, canonical] of Object.entries(CITY_SYNONYMS)) {
      const re = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
      if (re.test(normalizedQuery)) {
        if (canonical === 'Delhi NCR') {
          if (!locations.includes('Delhi NCR')) locations.push('Delhi NCR');
          for (const c of DELHI_NCR_CITIES) {
            if (!cities.includes(c)) cities.push(c);
          }
        } else if (canonical === 'Remote') {
          // handled in workModes
        } else {
          if (!locations.includes(canonical)) locations.push(canonical);
          if (!['India', 'UAE', 'Middle East'].includes(canonical) && !cities.includes(canonical)) {
            cities.push(canonical);
          }
        }
      }
    }

    const companies: string[] = [];
    for (const comp of KNOWN_COMPANIES) {
      const re = new RegExp(`\\b${escapeRegex(comp)}\\b`, 'i');
      if (re.test(normalizedQuery) && !companies.includes(comp)) {
        companies.push(comp);
      }
    }
    // Also detect "working at <Company>" or "at <Company>"
    const atCompanyMatch = cleanRaw.match(/\b(?:working\s+at|at)\s+([A-Za-z0-9&.-]{2,30})/i);
    if (atCompanyMatch?.[1]) {
      const candidate = atCompanyMatch[1].trim();
      const candidateLower = candidate.toLowerCase();
      const nonCompanyWords = new Set(['home', 'remote', 'least', 'once', 'all', 'any', 'first', 'last', 'night', 'work', 'times']);
      if (
        !CITY_SYNONYMS[candidateLower] &&
        !nonCompanyWords.has(candidateLower) &&
        !companies.some((c) => c.toLowerCase() === candidateLower)
      ) {
        companies.push(candidate);
      }
    }

    const industries: string[] = [];
    for (const { pattern, canonical } of INDUSTRY_PATTERNS) {
      if (pattern.test(normalizedQuery) && !industries.includes(canonical)) {
        industries.push(canonical);
      }
    }

    const education: string[] = [];
    for (const { pattern, canonical } of EDUCATION_PATTERNS) {
      if (pattern.test(normalizedQuery) && !education.includes(canonical)) {
        education.push(canonical);
      }
    }

    // 2. Seniority & Experience
    let seniority: ParsedSearchIntent['entities']['seniority'];
    let experienceMin: number | undefined;
    let experienceMax: number | undefined;
    let isFresher: boolean | undefined;

    if (/\b(fresher|freshers|fresh\s*graduates?|entry\s*level)\b/i.test(normalizedQuery)) {
      seniority = 'fresher';
      isFresher = true;
      experienceMin = 0;
      experienceMax = 1;
    } else if (/\b(senior|sr\.?|lead|principal|staff)\b/i.test(normalizedQuery)) {
      seniority = /\b(principal|staff)\b/i.test(normalizedQuery) ? 'lead' : 'senior';
    } else if (/\b(junior|jr\.?)\b/i.test(normalizedQuery)) {
      seniority = 'junior';
    } else if (/\b(vp|director|head\s+of|executive|chief|cxo)\b/i.test(normalizedQuery)) {
      seniority = 'executive';
    }

    // Numeric experience: "3 to 5 years", "3-5 yrs", "more than 10 years", "10+ years", "less than 3 years", "5 years"
    const rangeMatch = normalizedQuery.match(/(\d{1,2})\s*(?:to|-|–)\s*(\d{1,2})\s*(?:\+?\s*)?(?:years?|yrs?)\b/);
    const minMatch = normalizedQuery.match(/(?:more\s+than|above|over|at\s+least|min(?:imum)?)\s*(\d{1,2})\s*(?:\+?\s*)?(?:years?|yrs?)\b|(\d{1,2})\+\s*(?:years?|yrs?)\b/);
    const maxMatch = normalizedQuery.match(/(?:less\s+than|under|below|up\s+to|max(?:imum)?)\s*(\d{1,2})\s*(?:years?|yrs?)\b/);
    const exactExpMatch = normalizedQuery.match(/\b(\d{1,2})\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?\b/);

    if (rangeMatch) {
      experienceMin = Number(rangeMatch[1]);
      experienceMax = Number(rangeMatch[2]);
    } else if (minMatch) {
      experienceMin = Number(minMatch[1] || minMatch[2]);
    } else if (maxMatch) {
      experienceMax = Number(maxMatch[1]);
    } else if (exactExpMatch && !/\b(last|past)\s+\d+\s+years?\b/i.test(normalizedQuery)) {
      experienceMin = Number(exactExpMatch[1]);
    }

    // 3. Work Mode & Employment Type
    const workModes: ('remote' | 'hybrid' | 'onsite')[] = [];
    const isRemote = /\b(remote|work\s*from\s*home|wfh)\b/i.test(normalizedQuery) ? true : undefined;
    if (isRemote) workModes.push('remote');
    if (/\bhybrid\b/i.test(normalizedQuery)) workModes.push('hybrid');
    if (/\b(on-?site|in-?office)\b/i.test(normalizedQuery)) workModes.push('onsite');

    const employmentTypes: string[] = [];
    let isInternship: boolean | undefined;
    if (/\b(internships?|interns?)\b/i.test(normalizedQuery)) {
      isInternship = true;
      employmentTypes.push('internship');
    }
    if (/\bfull[\s-]*time\b/i.test(normalizedQuery)) employmentTypes.push('full-time');
    if (/\bpart[\s-]*time\b/i.test(normalizedQuery)) employmentTypes.push('part-time');
    if (/\b(freelance|freelancer)\b/i.test(normalizedQuery)) employmentTypes.push('freelance');
    if (/\b(contract|contractor)\b/i.test(normalizedQuery)) employmentTypes.push('contract');

    // 4. Salary Intent (keep currency separate)
    let salaryMinAnnual: number | undefined;
    let salaryMaxAnnual: number | undefined;
    let salaryCurrency: ParsedSearchIntent['filters']['salaryCurrency'];

    const lpaMatch = normalizedQuery.match(/(?:above|over|more\s+than|>|>=|min(?:imum)?\s*)?\b(\d{1,3}(?:\.\d+)?)\s*(?:lpa|lakhs?\s*(?:per\s*annum)?|l\b)/i);
    if (lpaMatch) {
      salaryMinAnnual = Math.round(parseFloat(lpaMatch[1]) * 100000);
      salaryCurrency = 'INR';
    } else {
      const usdMatch = normalizedQuery.match(/\$\s*(\d{2,3})\s*k\b/i);
      if (usdMatch) {
        salaryMinAnnual = Number(usdMatch[1]) * 1000;
        salaryCurrency = 'USD';
      }
    }

    // 5. Time Intent
    let timeRange: TimeRangeFilter | undefined;
    if (/\b(last\s*24\s*hours?|today|yesterday|24h)\b/i.test(normalizedQuery)) {
      timeRange = '24h';
    } else if (/\b(last\s*7\s*days?|this\s*week|past\s*week|7d)\b/i.test(normalizedQuery)) {
      timeRange = '7d';
    } else if (/\b(last\s*30\s*days?|this\s*month|recently|recent)\b/i.test(normalizedQuery)) {
      timeRange = '30d';
    }

    // 6. Relationship Intent
    let relationship: RelationshipFilter | undefined;
    if (/\b(pending\s*(?:connection\s*)?requests?)\b/i.test(normalizedQuery)) {
      relationship = 'pending_requests';
    } else if (/\b(haven'?t\s*connected|not\s*connected|outside\s*my\s*network)\b/i.test(normalizedQuery)) {
      relationship = 'not_connected';
    } else if (/\b(people\s*i\s*follow|following)\b/i.test(normalizedQuery)) {
      relationship = 'following';
    } else if (/\bfollowers\b/i.test(normalizedQuery)) {
      relationship = 'followers';
    } else if (/\b(my\s*connections?|in\s*my\s*network|by\s*my\s*connections?|connections?)\b/i.test(normalizedQuery)) {
      relationship = 'connections';
    }

    // 7. Activity & Passport Intent
    const activities: ActivityFilter[] = [];
    if (/\b(actively\s*hiring|currently\s*hiring|hiring\s*for|posting\s*jobs?)\b/i.test(normalizedQuery)) {
      activities.push('actively_hiring');
    }
    if (/\b(recently\s*joined|new\s*members?|joined\s*talentxcel)\b/i.test(normalizedQuery)) {
      activities.push('recently_joined');
    }
    if (/\b(immediate\s*joining|immediately\s*available|immediate\s*joiner)\b/i.test(normalizedQuery)) {
      activities.push('immediate_joining');
    }
    if (/\b(career\s*passport|completed\s*(?:their\s*)?passport)\b/i.test(normalizedQuery)) {
      activities.push('career_passport_completed');
    }
    if (/\b(high\s*talentscore|top\s*talentscore|talentscore)\b/i.test(normalizedQuery)) {
      activities.push('high_talentscore');
    }
    if (/\b(recently\s*active|active\s*on\s*the\s*platform)\b/i.test(normalizedQuery)) {
      activities.push('recently_active');
    }

    const isFree = /\bfree\b/i.test(normalizedQuery) ? true : undefined;

    // 8. Determine Primary Intent & Target Scopes
    const { primaryIntent, targetScopes } = this.classifyIntent(normalizedQuery, {
      roles,
      skills,
      locations,
      companies,
      industries,
      isRemote,
      isFresher,
      isInternship,
      salaryMinAnnual,
      relationship,
      activities,
    });

    // 9. Extract clean keywords (minus stop words)
    const keywords = normalizedQuery
      .replace(/[^\w\s+#.-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !STOP_WORDS.has(w))
      .slice(0, 10);

    const cleanText = keywords.join(' ') || cleanRaw;

    // 10. Determine Complexity & Sort
    const filterCount =
      roles.length +
      skills.length +
      locations.length +
      companies.length +
      industries.length +
      (experienceMin !== undefined ? 1 : 0) +
      (experienceMax !== undefined ? 1 : 0) +
      (isRemote ? 1 : 0) +
      (salaryMinAnnual !== undefined ? 1 : 0) +
      (timeRange ? 1 : 0) +
      (relationship ? 1 : 0) +
      activities.length;

    const complexity: QueryComplexity =
      filterCount === 0 ? 'simple' : filterCount <= 3 ? 'filtered' : 'complex';

    let sortBy: SearchSortBy = 'relevance';
    if (timeRange === '24h' || timeRange === '7d' || activities.includes('recently_joined')) {
      sortBy = 'recent';
    } else if (salaryMinAnnual !== undefined) {
      sortBy = 'salary_desc';
    } else if (/\btrending\b/i.test(normalizedQuery)) {
      sortBy = 'popular';
    }

    // 11. Build human-readable explanation chips
    if (roles.length) explanationChips.push(`Role: ${roles.join(', ')}`);
    if (skills.length) explanationChips.push(`Skills: ${skills.join(', ')}`);
    if (locations.length) explanationChips.push(`Location: ${locations.join(', ')}`);
    if (isRemote) explanationChips.push('Remote');
    if (isFresher) explanationChips.push('Fresher');
    if (isInternship) explanationChips.push('Internship');
    if (experienceMin !== undefined || experienceMax !== undefined) {
      const expStr =
        experienceMin !== undefined && experienceMax !== undefined
          ? `${experienceMin}-${experienceMax} yrs`
          : experienceMin !== undefined
            ? `${experienceMin}+ yrs`
            : `<${experienceMax} yrs`;
      explanationChips.push(`Exp: ${expStr}`);
    }
    if (salaryMinAnnual !== undefined) {
      explanationChips.push(
        salaryCurrency === 'INR'
          ? `Salary ≥ ₹${(salaryMinAnnual / 100000).toFixed(0)} LPA`
          : `Salary ≥ $${Math.round(salaryMinAnnual / 1000)}k`
      );
    }
    if (companies.length) explanationChips.push(`Company: ${companies.join(', ')}`);
    if (industries.length) explanationChips.push(`Industry: ${industries.join(', ')}`);
    if (timeRange) explanationChips.push(`Time: Last ${timeRange}`);
    if (relationship) explanationChips.push(`Network: ${relationship.replace(/_/g, ' ')}`);
    if (activities.length) explanationChips.push(activities[0].replace(/_/g, ' '));

    return {
      rawQuery: cleanRaw,
      normalizedQuery,
      cleanText,
      keywords,
      primaryIntent,
      targetScopes,
      complexity,
      entities: {
        roles,
        skills,
        locations,
        companies,
        industries,
        education,
        seniority,
      },
      filters: {
        location: locations[0],
        cities,
        isRemote,
        workModes,
        experienceMin,
        experienceMax,
        isFresher,
        isInternship,
        employmentTypes,
        salaryMinAnnual,
        salaryMaxAnnual,
        salaryCurrency,
        timeRange,
        relationship,
        activities,
        isFree,
        skillMatchMode,
      },
      sortBy,
      confidence: filterCount > 0 ? 0.9 : 0.75,
      explanationChips,
    };
  }

  private static classifyIntent(
    q: string,
    signals: {
      roles: string[];
      skills: string[];
      locations: string[];
      companies: string[];
      industries: string[];
      isRemote?: boolean;
      isFresher?: boolean;
      isInternship?: boolean;
      salaryMinAnnual?: number;
      relationship?: RelationshipFilter;
      activities: ActivityFilter[];
    }
  ): { primaryIntent: SearchPrimaryIntent; targetScopes: SearchEntityType[] } {
    // Explicit private message intent (only searched if user explicitly asks for messages)
    if (/\b(my\s+messages?|direct\s+messages?|dms?|chat\s+with)\b/i.test(q)) {
      return { primaryIntent: 'message_search', targetScopes: ['messages'] };
    }

    // Explicit connection / network relationship intent
    if (signals.relationship === 'pending_requests' || signals.relationship === 'following' || signals.relationship === 'followers') {
      return { primaryIntent: 'connection_search', targetScopes: ['connections', 'people'] };
    }
    if (signals.relationship === 'connections' && /\b(posts?|shared)\b/i.test(q)) {
      return { primaryIntent: 'post_search', targetScopes: ['posts', 'connections'] };
    }
    if (signals.relationship === 'connections') {
      return { primaryIntent: 'connection_search', targetScopes: ['connections', 'people'] };
    }

    // Explicit community intent
    if (/\b(communit(?:y|ies)|groups?|forums?)\b/i.test(q)) {
      return { primaryIntent: 'community_search', targetScopes: ['communities'] };
    }

    // Explicit posts / discussions intent
    if (/\b(posts?|discussions?|feed|threads?|discussing)\b/i.test(q)) {
      return { primaryIntent: 'post_search', targetScopes: ['posts'] };
    }

    // Explicit articles / guides intent
    if (/\b(articles?|guides?|blog|career\s*advice|tips|resume\s*writing)\b/i.test(q)) {
      return { primaryIntent: 'article_search', targetScopes: ['articles', 'courses', 'posts'] };
    }

    // Explicit courses / learning intent
    if (/\b(courses?|learn|learning|bootcamp|certifications?|tutorials?)\b/i.test(q)) {
      return { primaryIntent: 'learning_search', targetScopes: ['courses', 'articles'] };
    }

    // Explicit reels / video intent
    if (/\b(reels?|videos?)\b/i.test(q)) {
      return { primaryIntent: 'reel_search', targetScopes: ['reels'] };
    }

    // Explicit companies intent
    if (/\b(companies|employers?|startups?\s+hiring|organizations?)\b/i.test(q) && !/\b(people|professionals|candidates|jobs?)\b/i.test(q)) {
      return { primaryIntent: 'company_search', targetScopes: ['companies', 'jobs'] };
    }

    // Explicit talent / candidate intent
    if (/\b(candidates?|talent|immediate\s*join|available\s*for\s*immediate)\b/i.test(q)) {
      return { primaryIntent: 'talent_search', targetScopes: ['talent', 'people'] };
    }

    // Explicit jobs intent
    if (
      /\b(jobs?|openings?|vacancies|hiring\s+for|internships?|freelance|part[\s-]*time|opportunities|positions?)\b/i.test(q) ||
      signals.salaryMinAnnual !== undefined ||
      signals.isInternship
    ) {
      if (/\b(recruiters?)\b/i.test(q)) {
        return { primaryIntent: 'people_search', targetScopes: ['people', 'jobs'] };
      }
      return { primaryIntent: 'job_search', targetScopes: ['jobs', 'companies'] };
    }

    // Explicit people / professionals / recruiters intent
    if (
      /\b(people|professionals?|recruiters?|hr\s*managers?|managers?|engineers?|developers?|analysts?|founders?|someone|who)\b/i.test(q) ||
      signals.relationship === 'not_connected' ||
      signals.activities.includes('recently_joined') ||
      signals.activities.includes('career_passport_completed') ||
      signals.activities.includes('high_talentscore')
    ) {
      return { primaryIntent: 'people_search', targetScopes: ['people', 'talent', 'connections'] };
    }

    // Broad / ambiguous query (e.g. "Data analyst", "Python", "AI") -> cross-module universal search
    return {
      primaryIntent: 'universal',
      targetScopes: ['people', 'jobs', 'posts', 'companies', 'communities', 'articles', 'courses'],
    };
  }
}
