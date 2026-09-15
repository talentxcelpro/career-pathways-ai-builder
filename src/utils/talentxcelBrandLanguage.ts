type BrandReplacement = [RegExp, string];

export const TALENTXCEL_NAMING_MAP = [
  ['Career Operating System', 'TalentXcel Platform'],
  ['Career OS', 'TalentXcel Core'],
  ['Signal OS', 'TalentXcel Platform'],
  ['AI Coach', 'TalentXcel Navigator'],
  ['AI Career Coach', 'TalentXcel Navigator'],
  ['AI Assistant', 'TalentXcel Navigator'],
  ['AI Insights', 'Talent Signals'],
  ['AI Recommendations', 'Career Moves'],
  ['AI Suggestions', 'Smart Moves'],
  ['Smart AI', 'Talent Engine'],
  ['AI Powered', 'Talent Engine'],
  ['AI Engine', 'Talent Engine'],
  ['AI Matching', 'Precision Match'],
  ['AI Score', 'TalentScore'],
  ['Progress Tracking', 'Growth Path'],
] as const;

const LEGAL_MARK_PATTERN = new RegExp('[\\u2122\\u00ae]|\\u00e2\\u201e\\u00a2|\\u00c2\\u00ae', 'gi');

const BRAND_REPLACEMENTS: BrandReplacement[] = [
  [LEGAL_MARK_PATTERN, ''],
  [/\bCareer Operating System\b/gi, 'TalentXcel Platform'],
  [/\bCareer OS\b/gi, 'TalentXcel Core'],
  [/\bSignal OS\b/gi, 'TalentXcel Platform'],
  [/\bAI Career Coach\b/gi, 'TalentXcel Navigator'],
  [/\bAI Coach\b/gi, 'TalentXcel Navigator'],
  [/\bAI Assistant\b/gi, 'TalentXcel Navigator'],
  [/\bAI Insights\b/gi, 'Talent Signals'],
  [/\bAI Recommendations\b/gi, 'Career Moves'],
  [/\bAI Suggestions\b/gi, 'Smart Moves'],
  [/\bSmart AI\b/gi, 'Talent Engine'],
  [/\bAI[-\s]?Powered\b/gi, 'Talent Engine'],
  [/\bAI Engine\b/gi, 'Talent Engine'],
  [/\bAI Matching\b/gi, 'Precision Match'],
  [/\bAI Score\b/gi, 'TalentScore'],
  [/\bProgress Tracking\b/gi, 'Growth Path'],
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
