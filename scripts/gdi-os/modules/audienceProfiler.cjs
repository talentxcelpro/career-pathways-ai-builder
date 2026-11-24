const COUNTRY_TIERS = {
  IND: { tier: 'Tier 1: Core Domestic Volume', region: 'India', primaryLanguage: 'English / Hindi', intent: 'Local & Metro Employment, Freshers, Government Exams' },
  USA: { tier: 'Tier 2: High-Latent Anglo Tech', region: 'North America', primaryLanguage: 'English', intent: 'Remote AI/ML, High-CTC Benchmarks, Software Engineering' },
  GBR: { tier: 'Tier 2: High-Latent Anglo Tech', region: 'Europe', primaryLanguage: 'English', intent: 'Engineering Openings, Remote Tech, System Architecture' },
  CAN: { tier: 'Tier 2: High-Latent Anglo Tech', region: 'North America', primaryLanguage: 'English', intent: 'Global Remote, Tech Relocation' },
  AUS: { tier: 'Tier 2: High-Latent Anglo Tech', region: 'Asia-Pacific', primaryLanguage: 'English', intent: 'Remote Contract, Data Roles' },
  ARE: { tier: 'Tier 3: Diaspora & Relocation', region: 'Middle East', primaryLanguage: 'English / Arabic', intent: 'Gulf Jobs, Tax-Free Tech Roles, Relocation Sponsorship' },
  SAU: { tier: 'Tier 3: Diaspora & Relocation', region: 'Middle East', primaryLanguage: 'English / Arabic', intent: 'Engineering & Construction Tech, Executive Roles' },
  SGP: { tier: 'Tier 3: Diaspora & Relocation', region: 'Southeast Asia', primaryLanguage: 'English', intent: 'Fintech, Regional Product Management' },
  NLD: { tier: 'Tier 3: Diaspora & Relocation', region: 'Europe', primaryLanguage: 'English', intent: 'EU Tech Sponsorship, 30% Ruling Roles' },
  DEU: { tier: 'Tier 3: Diaspora & Relocation', region: 'Europe', primaryLanguage: 'English / German', intent: 'Software Engineering, European Blue Card' },
  PHL: { tier: 'Tier 4: Global High-Engagement Talent', region: 'Southeast Asia', primaryLanguage: 'English', intent: 'BPO Tech, Customer Operations, Remote AI Annotation' },
  BGD: { tier: 'Tier 4: Global High-Engagement Talent', region: 'South Asia', primaryLanguage: 'English / Bengali', intent: 'Junior Software, Fresher Tech, Freelance' },
  FRA: { tier: 'Tier 4: Global High-Engagement Talent', region: 'Europe', primaryLanguage: 'English / French', intent: 'Data Science, Specialized Engineering' },
  JPN: { tier: 'Tier 4: Global High-Engagement Talent', region: 'East Asia', primaryLanguage: 'English / Japanese', intent: 'English-Speaking Tech, Tokyo Software Openings' }
};

function profileAudience(query, clusterName, rawCountry = 'IND') {
  const countryCode = (rawCountry || 'IND').toUpperCase();
  const meta = COUNTRY_TIERS[countryCode] || {
    tier: 'Tier 4: General International Audience',
    region: 'Global',
    primaryLanguage: 'English',
    intent: 'General Career & Jobs Search'
  };

  let persona = 'Mid-Level Professional';
  if (/fresher|intern|graduate|entry|2025|2026/i.test(query)) {
    persona = 'Fresher / College Graduate';
  } else if (/architect|lead|principal|director|manager|executive/i.test(query)) {
    persona = 'Senior / Executive Leader';
  } else if (/ats|resume|cv/i.test(query)) {
    persona = 'Active Job Seeker / Career Transitioner';
  } else if (/interview|question/i.test(query)) {
    persona = 'Interview Candidate';
  }

  return {
    targetCountry: countryCode,
    marketTier: meta.tier,
    region: meta.region,
    audiencePersona: persona,
    primaryLanguage: meta.primaryLanguage,
    regionalSearchIntent: meta.intent
  };
}

module.exports = { profileAudience, COUNTRY_TIERS };
