// distribution-engine/src/ai/aiPriorityScorer.cjs
// Multi-factor algorithmic priority scorer for external distribution opportunities.
// Enforces quality, editorial legitimacy, AI discovery value, and strict anti-spam penalties.

/**
 * Calculates a 100-point priority score for an external platform opportunity.
 *
 * Formula:
 * Score = (AIDiscovery * 0.25) + (DomainAuthority * 0.20) + (TopicalRelevance * 0.20)
 *       + (AudienceQuality * 0.15) + (Sustainability * 0.10) + (ConversionPotential * 0.10)
 *       - RiskPenalty
 */
function scoreDistributionOpportunity(platform) {
  // 1. AI Discovery Potential (0 - 100 scaled, weight 0.25)
  // Evaluates whether Tier 1/2 AI search bots (ChatGPT Search, Perplexity, Gemini, Claude) crawl & cite this domain.
  let aiDiscoveryScore = platform.aiCrawled ? 85 : 40;
  if (platform.indexedInGoogleSearch) aiDiscoveryScore += 10;
  if (platform.schemaEnabled) aiDiscoveryScore += 5;
  aiDiscoveryScore = Math.min(100, Math.max(0, aiDiscoveryScore));

  // 2. Search Visibility & Domain Authority (0 - 100, weight 0.20)
  const da = platform.domainAuthority || 50;
  const domainAuthorityScore = Math.min(100, Math.max(10, da));

  // 3. Topical Relevance (0 - 100, weight 0.20)
  // How closely aligned is the platform with HRTech, Careers, Tech Engineering, Jobs, or Developer Tools?
  const relevanceMap = {
    'HR_TECH_DIRECTORY': 95,
    'CAREER_BLOG': 90,
    'TECH_COMMUNITY': 90,
    'DEVELOPER_COMMUNITY': 88,
    'SAAS_DIRECTORY': 85,
    'STUDENT_COMMUNITY': 85,
    'RECRUITMENT_PUBLICATION': 90,
    'STARTUP_REGISTRY': 80,
    'AI_DEVELOPER_DIRECTORY': 92,
    'GENERAL_DIRECTORY': 40,
    'LOW_QUALITY_LISTING': 10
  };
  const topicalRelevanceScore = relevanceMap[platform.category] || 50;

  // 4. Audience Quality (0 - 100, weight 0.15)
  // Practitioners, recruiters, and genuine job seekers vs bot/scraper traffic
  let audienceQualityScore = 70;
  if (platform.hasRegisteredUsers) audienceQualityScore += 15;
  if (platform.moderatedEditorial) audienceQualityScore += 15;
  audienceQualityScore = Math.min(100, audienceQualityScore);

  // 5. Sustainability & Editorial Legitimacy (0 - 100, weight 0.10)
  // Permanent do-follow/editorial indexing vs transient unmoderated submissions
  let sustainabilityScore = platform.moderatedEditorial ? 90 : 50;
  if (platform.requiresManualReview) sustainabilityScore += 10;

  // 6. Referral & Conversion Potential (0 - 100, weight 0.10)
  const conversionScore = (platform.hasDirectLinks ? 80 : 40);

  // 7. Risk Penalty (Subtracted directly)
  // Penalizes low-tier automated directories, link farms, scrapers, or sites requiring bot evasion
  let riskPenalty = 0;
  if (platform.isLinkFarm) riskPenalty += 50;
  if (platform.isAutomatedSubmissionProhibited) riskPenalty += 30;
  if (platform.requiresCaptcha) riskPenalty += 20;
  if (platform.category === 'LOW_QUALITY_LISTING') riskPenalty += 40;

  const rawWeightedScore =
    (aiDiscoveryScore * 0.25) +
    (domainAuthorityScore * 0.20) +
    (topicalRelevanceScore * 0.20) +
    (audienceQualityScore * 0.15) +
    (sustainabilityScore * 0.10) +
    (conversionScore * 0.10);

  const finalScore = Math.max(0, Math.min(100, Math.round(rawWeightedScore - riskPenalty)));

  let tier = 'LOW';
  if (finalScore >= 80) tier = 'TIER_1_PRIORITY';
  else if (finalScore >= 65) tier = 'TIER_2_VALUABLE';
  else if (finalScore >= 45) tier = 'TIER_3_SECONDARY';
  else tier = 'DISQUALIFIED_RISK';

  return {
    finalScore,
    tier,
    metrics: {
      aiDiscoveryScore,
      domainAuthorityScore,
      topicalRelevanceScore,
      audienceQualityScore,
      sustainabilityScore,
      conversionScore,
      riskPenalty
    }
  };
}

module.exports = {
  scoreDistributionOpportunity
};
