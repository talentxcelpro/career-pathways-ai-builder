// distribution-engine/src/ai/aiDistributionManager.cjs
// Orchestrates AI distribution scoring, opportunity ranking, and asset pairing.

const fs = require('fs');
const path = require('path');
const factualAssets = require('./factualDistributionAssets.cjs');
const { scoreDistributionOpportunity } = require('./aiPriorityScorer.cjs');

// Verified candidate platforms across legitimate directories, developer hubs, and editorial outlets
const CANDIDATE_PLATFORMS = [
  {
    id: 'plat-github-ecosystem',
    name: 'GitHub Organization & Topic Registry',
    domain: 'github.com',
    category: 'DEVELOPER_COMMUNITY',
    domainAuthority: 96,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-mcp-integration'
  },
  {
    id: 'plat-product-hunt',
    name: 'Product Hunt Developer & SaaS Discovery',
    domain: 'producthunt.com',
    category: 'SAAS_DIRECTORY',
    domainAuthority: 91,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-platform-overview'
  },
  {
    id: 'plat-dev-to',
    name: 'Dev.to Technical Engineering Publications',
    domain: 'dev.to',
    category: 'TECH_COMMUNITY',
    domainAuthority: 87,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-ats-guide'
  },
  {
    id: 'plat-crunchbase',
    name: 'Crunchbase Company Knowledge Base',
    domain: 'crunchbase.com',
    category: 'STARTUP_REGISTRY',
    domainAuthority: 90,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-platform-overview'
  },
  {
    id: 'plat-alternativeto',
    name: 'AlternativeTo Software Recommendations',
    domain: 'alternativeto.net',
    category: 'SAAS_DIRECTORY',
    domainAuthority: 83,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-ats-guide'
  },
  {
    id: 'plat-saashub',
    name: 'SaaSHub Software Architecture Alternatives',
    domain: 'saashub.com',
    category: 'SAAS_DIRECTORY',
    domainAuthority: 74,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-recruiter-os-doc'
  },
  {
    id: 'plat-hashnode',
    name: 'Hashnode Engineering Community',
    domain: 'hashnode.com',
    category: 'TECH_COMMUNITY',
    domainAuthority: 84,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-talentscore-methodology'
  },
  {
    id: 'plat-wellfound',
    name: 'Wellfound (AngelList) Talent & Hiring Hub',
    domain: 'wellfound.com',
    category: 'HR_TECH_DIRECTORY',
    domainAuthority: 88,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-recruiter-os-doc'
  },
  {
    id: 'plat-huggingface',
    name: 'Hugging Face Model & Agent Spaces',
    domain: 'huggingface.co',
    category: 'AI_DEVELOPER_DIRECTORY',
    domainAuthority: 89,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-mcp-integration'
  },
  {
    id: 'plat-hackernews-showhn',
    name: 'Hacker News (Y Combinator) Technical Showcase',
    domain: 'news.ycombinator.com',
    category: 'TECH_COMMUNITY',
    domainAuthority: 92,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: false,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-career-passport-spec'
  },
  {
    id: 'plat-freecodecamp',
    name: 'freeCodeCamp Developer News & Guides',
    domain: 'freecodecamp.org',
    category: 'STUDENT_COMMUNITY',
    domainAuthority: 89,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-freshers-guide'
  },
  {
    id: 'plat-kaggle',
    name: 'Kaggle Datasets & Community',
    domain: 'kaggle.com',
    category: 'AI_DEVELOPER_DIRECTORY',
    domainAuthority: 88,
    aiCrawled: true,
    indexedInGoogleSearch: true,
    schemaEnabled: true,
    hasRegisteredUsers: true,
    moderatedEditorial: true,
    hasDirectLinks: true,
    pairedAssetId: 'asset-salary-intelligence'
  }
];

function processAiDistributionOpportunities() {
  const scoredOpportunities = CANDIDATE_PLATFORMS.map((platform) => {
    const scoreResult = scoreDistributionOpportunity(platform);
    const asset = factualAssets.find((a) => a.assetId === platform.pairedAssetId) || factualAssets[0];

    return {
      platformId: platform.id,
      platformName: platform.name,
      domain: platform.domain,
      category: platform.category,
      domainAuthority: platform.domainAuthority,
      priorityScore: scoreResult.finalScore,
      priorityTier: scoreResult.tier,
      scoringMetrics: scoreResult.metrics,
      distributionAction: {
        targetAssetId: asset.assetId,
        assetTitle: asset.title,
        canonicalUrl: asset.canonicalSource,
        formatType: asset.formatType,
        summary: asset.summary
      }
    };
  });

  // Sort descending by priority score
  scoredOpportunities.sort((a, b) => b.priorityScore - a.priorityScore);

  const exportsDir = path.resolve('distribution-engine/data/exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  const exportPath = path.join(exportsDir, 'ai_distribution_priority_queue.json');
  fs.writeFileSync(exportPath, JSON.stringify(scoredOpportunities, null, 2), 'utf-8');

  return {
    totalEvaluated: scoredOpportunities.length,
    tier1Count: scoredOpportunities.filter((o) => o.priorityTier === 'TIER_1_PRIORITY').length,
    tier2Count: scoredOpportunities.filter((o) => o.priorityTier === 'TIER_2_VALUABLE').length,
    exportPath,
    queue: scoredOpportunities
  };
}

module.exports = {
  processAiDistributionOpportunities,
  CANDIDATE_PLATFORMS
};
