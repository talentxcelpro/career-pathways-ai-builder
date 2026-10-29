/**
 * Hiring-platform/PAA query coverage & People Also Ask Intent Classification.
 *
 * This is a routing and classification layer for organic search queries. It maps
 * search demand to existing, verified product surfaces; it does not manufacture
 * competitor pages, doorway pages, or imply that TalentXcel provides an ATS unless
 * the live product does.
 */

export type HiringQueryIntent =
  | 'commercial'
  | 'comparison'
  | 'informational'
  | 'branded'
  | 'careers'
  | 'unrelated';

export type HiringQueryPage =
  | '/'
  | '/hire'
  | '/talent'
  | '/recruitment'
  | '/employers'
  | '/job-matching'
  | '/jobs'
  | '/resources'
  | '/salary'
  | '/careers'
  | null;

export type QuestionType =
  | 'who'
  | 'what'
  | 'why'
  | 'how'
  | 'when'
  | 'where'
  | 'which'
  | 'can'
  | 'is'
  | 'are'
  | 'does'
  | 'do'
  | 'should'
  | 'will'
  | 'comparison'
  | 'other';

export interface QuestionIntentResult {
  isQuestion: boolean;
  questionType: QuestionType | null;
  normalizedQuery: string;
}

export interface HiringQueryClassification {
  normalizedQuery: string;
  intent: HiringQueryIntent;
  isPeopleAlsoAsk: boolean;
  questionType: QuestionType | null;
  page: HiringQueryPage;
  eligibleForIndexablePage: boolean;
  reason: string;
}

export const normalizeQuery = (query: string): string => (query || '')
  .toLowerCase()
  .normalize('NFKC')
  .replace(/[’']/g, '')
  .replace(/\b(naurkri|noukri|naukari|naukeri)\b/g, 'naukri')
  .replace(/\b(recuitment|recrutment|reqruitment|recuritment)\b/g, 'recruitment')
  .replace(/\b(platfrom|plaform)\b/g, 'platform')
  .replace(/\b(talant)\b/g, 'talent')
  .replace(/\b(applicante)\b/g, 'applicant')
  .replace(/\b(softwere|softwear)\b/g, 'software')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const has = (q: string, patterns: RegExp[]): boolean => patterns.some((p) => p.test(q));

export const QUESTION_REGEX = /^(who|what|why|how|when|where|which|can|is|are|does|do|should|will|difference between|meaning of|vs|versus)\b/;
export const COMMERCIAL_REGEX = /\b(hire|hiring|recruit|recruiter|recruitment|staffing|talent acquisition|talent discovery|find candidates|find talent|source candidates|post (a )?job|employer|ats|applicant tracking system|recruitment software|ai recruitment|recruiting app|free recruiting app|talent platform|hiring platform)\b/;
export const COMPARISON_REGEX = /\b(alternative|alternatives|competitor|competitors|vs|versus|compare|comparison|better|best|top|similar to|sites like|apps like|portal like)\b/;
export const PLATFORM_REGEX = /\b(naukri|indeed|linkedin|foundit|monster|workable|greenhouse|lever|zoho recruit|freshteam|recruit crm|bullhorn|hirevue|apna|internshala|shine|timesjobs|glassdoor)\b/;
export const CAREERS_REGEX = /\b(careers|career|jobs?|vacanc(y|ies)|opening|internship|fresher|work from home|from home|remote jobs?|earn .* home)\b/;
export const BRAND_REGEX = /\b(talentxcel|talent xcel|chatr|savantis)\b/;
export const INFORMATIONAL_REGEX = /\b(why|how does|what is|what are|meaning|definition|guide|tips|process|steps|work)\b/;

export const DOMAIN_RELEVANCE_REGEX = /\b(job|jobs|career|careers|hire|hiring|recruit|recruiter|recruitment|talent|staff|staffing|candidate|candidates|applicant|applicants|applicant tracking system|work|working|workplace|worker|workers|employer|employers|employee|employees|hr|ats|resume|cv|interview|interviews|salary|salaries|pay|compensation|stipend|earn|paid|money|daily|bonus|fresher|freshers|intern|interns|internship|internships|gen z|corporate|company|companies|college|colleges|university|course|courses|degree|skill|skills|remote|wfh|from home|office|profession|professional|professionals|app|apps|platform|platforms|software|ai|naukri|linkedin|indeed)\b/;

const TALENT_DISCOVERY_REGEX = /\b(talent discovery|find talent|discover talent|source talent|find candidates|source candidates)\b/;

/**
 * Dedicated People Also Ask (PAA) Question-Intent Classifier.
 * Detects whether a query follows interrogative question syntax and extracts question archetype.
 */
export function classifyQuestionIntent(rawQuery: string): QuestionIntentResult {
  const normalizedQuery = normalizeQuery(rawQuery);
  if (!normalizedQuery) {
    return { isQuestion: false, questionType: null, normalizedQuery: '' };
  }
  const match = normalizedQuery.match(QUESTION_REGEX);
  const endsWithQuestionMark = /\?$/.test((rawQuery || '').trim());

  if (match) {
    const matchedPrefix = match[1];
    let questionType: QuestionType = 'other';
    if (['who', 'what', 'why', 'how', 'when', 'where', 'which', 'can', 'is', 'are', 'does', 'do', 'should', 'will'].includes(matchedPrefix)) {
      questionType = matchedPrefix as QuestionType;
    } else if (['vs', 'versus', 'difference between'].includes(matchedPrefix)) {
      questionType = 'comparison';
    }
    return { isQuestion: true, questionType, normalizedQuery };
  }

  if (endsWithQuestionMark) {
    return { isQuestion: true, questionType: 'other', normalizedQuery };
  }

  return { isQuestion: false, questionType: null, normalizedQuery };
}

/**
 * Classifies search queries by intent, question type, and product routing.
 * Ensures zero thin doorway generation by mapping demand to existing canonical surfaces.
 */
export function classifyHiringQuery(rawQuery: string): HiringQueryClassification {
  const normalizedQuery = normalizeQuery(rawQuery);
  if (!normalizedQuery) {
    return {
      normalizedQuery,
      intent: 'unrelated',
      isPeopleAlsoAsk: false,
      questionType: null,
      page: null,
      eligibleForIndexablePage: false,
      reason: 'Empty query.',
    };
  }

  const questionResult = classifyQuestionIntent(rawQuery);
  const isPeopleAlsoAsk = questionResult.isQuestion;
  const questionType = questionResult.questionType;

  // Guard against fake/unsupported prediction tools
  if (/\b(prediction|fortune|horoscope)\b/.test(normalizedQuery)) {
    return {
      normalizedQuery,
      intent: 'unrelated',
      isPeopleAlsoAsk,
      questionType,
      page: null,
      eligibleForIndexablePage: false,
      reason: 'Unsupported feature; fake prediction tools are prohibited.',
    };
  }

  // Domain relevance check: exclude queries outside careers/recruitment/work domain
  const isDomainRelevant =
    COMMERCIAL_REGEX.test(normalizedQuery) ||
    PLATFORM_REGEX.test(normalizedQuery) ||
    CAREERS_REGEX.test(normalizedQuery) ||
    BRAND_REGEX.test(normalizedQuery) ||
    DOMAIN_RELEVANCE_REGEX.test(normalizedQuery);

  if (!isDomainRelevant) {
    return {
      normalizedQuery,
      intent: 'unrelated',
      isPeopleAlsoAsk,
      questionType,
      page: null,
      eligibleForIndexablePage: false,
      reason: 'No supported TalentXcel product or useful content match.',
    };
  }

  const isPlatformComparison = has(normalizedQuery, [COMPARISON_REGEX]) && has(normalizedQuery, [PLATFORM_REGEX]);

  if (BRAND_REGEX.test(normalizedQuery)) {
    const brandedPage: HiringQueryPage = /\bsalary\b/.test(normalizedQuery)
      ? '/salary'
      : /\bcareers?\b/.test(normalizedQuery)
      ? '/careers'
      : '/';
    return {
      normalizedQuery,
      intent: 'branded',
      isPeopleAlsoAsk,
      questionType,
      page: brandedPage,
      eligibleForIndexablePage: false,
      reason: 'Branded demand maps to an existing canonical TalentXcel surface; no new brand doorway.',
    };
  }

  if (isPlatformComparison || (COMPARISON_REGEX.test(normalizedQuery) && COMMERCIAL_REGEX.test(normalizedQuery))) {
    const talentComparison = TALENT_DISCOVERY_REGEX.test(normalizedQuery) || /\b(find|discover|source)\b.*\btalent\b/.test(normalizedQuery);
    return {
      normalizedQuery,
      intent: 'comparison',
      isPeopleAlsoAsk,
      questionType,
      page: talentComparison ? '/talent' : '/hire',
      eligibleForIndexablePage: false,
      reason: 'Competitor/platform comparison is routed to an existing hiring surface; no fabricated comparison page.',
    };
  }

  if (isPeopleAlsoAsk && INFORMATIONAL_REGEX.test(normalizedQuery) && !/from home|remote|earn .* home/.test(normalizedQuery)) {
    return {
      normalizedQuery,
      intent: 'informational',
      isPeopleAlsoAsk,
      questionType,
      page: '/resources',
      eligibleForIndexablePage: false,
      reason: 'Question-form demand is routed to the existing resource hub; no thin PAA doorway.',
    };
  }

  if (CAREERS_REGEX.test(normalizedQuery) && !COMMERCIAL_REGEX.test(normalizedQuery)) {
    return {
      normalizedQuery,
      intent: 'careers',
      isPeopleAlsoAsk,
      questionType,
      page: '/jobs',
      eligibleForIndexablePage: false,
      reason: 'Existing jobs surface already serves career-seeking demand.',
    };
  }

  if (COMMERCIAL_REGEX.test(normalizedQuery)) {
    const candidateDiscovery = TALENT_DISCOVERY_REGEX.test(normalizedQuery) || /\b(find|discover|source)\b.*\btalent\b/.test(normalizedQuery);
    return {
      normalizedQuery,
      intent: 'commercial',
      isPeopleAlsoAsk,
      questionType,
      page: candidateDiscovery ? '/talent' : '/hire',
      eligibleForIndexablePage: false,
      reason: 'Existing verified employer/talent surface is sufficient; no duplicate URL.',
    };
  }

  if (INFORMATIONAL_REGEX.test(normalizedQuery) || isPeopleAlsoAsk) {
    return {
      normalizedQuery,
      intent: 'informational',
      isPeopleAlsoAsk,
      questionType,
      page: '/resources',
      eligibleForIndexablePage: false,
      reason: 'Informational/PAA demand maps to the existing resource hub; page creation requires separately verified original content.',
    };
  }

  return {
    normalizedQuery,
    intent: 'unrelated',
    isPeopleAlsoAsk,
    questionType,
    page: null,
    eligibleForIndexablePage: false,
    reason: 'No supported TalentXcel product or useful content match.',
  };
}

export const hiringQueryTestPhrases = [
  'best hiring platform for startups',
  'talent discovery platform',
  'recruitment software for small business',
  'applicant tracking system for free',
  'AI recruitment software',
  'free recruiting app',
  'Naukri alternative',
  'how does an ATS work?',
  'what is talent discovery?',
  'LinkedIn vs Naukri',
  'TalentXcel hiring platform',
  'software engineer jobs',
  'weather tomorrow',
  'best salary prediction tool',
  'recuitment software',
  'Naukri alternatives!!!',
] as const;
