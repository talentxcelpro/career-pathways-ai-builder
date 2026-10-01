type BrandReplacement = [RegExp, string];

export const TALENTXCEL_NAMING_MAP = [
  ['Career Operating System', 'TalentXcel Platform'],
  ['Career OS', 'TalentXcel Core'],
  ['Signal OS', 'TalentXcel Platform'],
  ['AI Coach', 'TalentXcel Navigator'],
  ['SI Career Coach', 'TalentXcel Navigator'],
  ['SI Assistant', 'TalentXcel Navigator'],
  ['AI Insights', 'Talent Signals'],
  ['AI Recommendations', 'Career Moves'],
  ['AI Suggestions', 'Smart Moves'],
  ['Smart AI', 'Talent Engine'],
  ['AI Powered', 'Talent Engine'],
  ['AI Engine', 'Talent Engine'],
  ['AI Matching', 'Precision Match'],
  ['TalentScore', 'TalentScore'],
  ['Progress Tracking', 'Growth Path'],
] as const;

const LEGAL_MARK_PATTERN = new RegExp('[\\u2122\\u00ae]|\\u00e2\\u201e\\u00a2|\\u00c2\\u00ae', 'gi');

const BRAND_REPLACEMENTS: BrandReplacement[] = [
  [LEGAL_MARK_PATTERN, ''],
  [/\bCareer Operating System\b/gi, 'TalentXcel Platform'],
  [/\bCareer OS\b/gi, 'TalentXcel Core'],
  [/\bSignal OS\b/gi, 'TalentXcel Platform'],
  [/\bAI Resume Builder\b/gi, 'SI Resume Builder'],
  [/\bAI Job Matching\b/gi, 'SI Job Matching'],
  [/\bAI Career Coach\b/gi, 'SI Career Coach'],
  [/\bAI Job Search\b/gi, 'SI Job Search'],
  [/\bAI Career Assistant\b/gi, 'TalentXcel SI Career Assistant'],
  [/\bAI Application Assistant\b/gi, 'SI Application Assistant'],
  [/\bAI Insights\b/gi, 'SI Insights'],
  [/\bAI Recommendations\b/gi, 'SI Recommendations'],
  [/\bAI Suggestions\b/gi, 'SI Suggestions'],
  [/\bSmart AI\b/gi, 'TalentXcel SI'],
  [/\bAI[-\s]?Powered\b/gi, 'SI-Powered'],
  [/\bAI Engine\b/gi, 'SI Engine'],
  [/\bAI Matching\b/gi, 'SI Job Matching'],
  [/\bAI Score\b/gi, 'TalentScore powered by TalentXcel SI'],
  [/\bAI Education Intelligence\b/gi, 'SI Education Intelligence'],
];

export function applyTalentXcelLanguage(value: string) {
  return BRAND_REPLACEMENTS.reduce((current, [pattern, replacement]) => {
    pattern.lastIndex = 0;
    return current.replace(pattern, replacement);
  }, value);
}

export function hasLegacyTalentXcelLanguage(value: string) {
  return BRAND_REPLACEMENTS.some(([pattern]) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}
