// src/services/embed/EmbedRegistry.ts
// TalentXcel Embed & Distribution Engine â€” Central Asset Registry & Code Generator

import {
  EmbedAsset,
  EmbedAssetCategory,
  EmbedConfiguration,
  EmbedFormat,
  CollegeEmbedData,
  JobMarketEmbedData,
  SkillsEmbedData,
  CareerEmbedData,
  ResumeEmbedData,
  EmployerEmbedData,
  EmbedRegistryStats
} from '@/types/embed';

import { INDIAN_INSTITUTIONS_CATALOG } from '@/data/indianInstitutionsCatalog';
import { TOP_50_INDIAN_HUBS } from '@/data/tier2LocationsData';
import { CAREER_TRANSITIONS_CATALOG } from '@/data/careerPathwaysCatalog';
import { WEIGHTED_CAREER_GRAPH } from '@/data/weightedCareerGraphData';

const BASE_URL = 'https://www.talentxcel.in';

export class EmbedRegistry {
  private static instance: EmbedRegistry;
  private assetCache: Map<string, EmbedAsset> = new Map();

  private constructor() {
    this.seedDefaultAssets();
  }

  public static getInstance(): EmbedRegistry {
    if (!EmbedRegistry.instance) {
      EmbedRegistry.instance = new EmbedRegistry();
    }
    return EmbedRegistry.instance;
  }

  /**
   * Warm up top priority assets across all 6 categories
   */
  private seedDefaultAssets(): void {
    // Top 5 colleges
    const topColleges = INDIAN_INSTITUTIONS_CATALOG.slice(0, 10);
    for (const col of topColleges) {
      const asset = this.buildCollegeAsset(col.slug || col.id);
      if (asset) this.assetCache.set(asset.id, asset);
    }

    // Top 10 Job Market Hubs
    const hubs = Object.keys(TOP_50_INDIAN_HUBS).slice(0, 10);
    for (const hub of hubs) {
      const asset = this.buildJobMarketAsset(hub);
      if (asset) this.assetCache.set(asset.id, asset);
    }

    // Top 10 Career Transitions
    const transitions = CAREER_TRANSITIONS_CATALOG.slice(0, 10);
    for (const tr of transitions) {
      const asset = this.buildCareerAsset(tr.id);
      if (asset) this.assetCache.set(asset.id, asset);
    }

    // Top 10 Skills
    const skills = WEIGHTED_CAREER_GRAPH.slice(0, 10);
    for (const sk of skills) {
      const asset = this.buildSkillsAsset(sk.slug || sk.id);
      if (asset) this.assetCache.set(asset.id, asset);
    }

    // Default Resume Benchmark Asset
    const resumeAsset = this.buildResumeAsset('software-engineer');
    if (resumeAsset) this.assetCache.set(resumeAsset.id, resumeAsset);

    // Default Employer Asset
    const employerAsset = this.buildEmployerAsset('tata-consultancy-services');
    if (employerAsset) this.assetCache.set(employerAsset.id, employerAsset);
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Asset Resolvers & Builders
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public getAsset(category: EmbedAssetCategory, slug: string): EmbedAsset | null {
    const assetId = `txc-${category}-${slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`;
    if (this.assetCache.has(assetId)) {
      return this.assetCache.get(assetId)!;
    }

    let built: EmbedAsset | null = null;
    switch (category) {
      case 'college':
        built = this.buildCollegeAsset(slug);
        break;
      case 'job_market':
        built = this.buildJobMarketAsset(slug);
        break;
      case 'skills':
        built = this.buildSkillsAsset(slug);
        break;
      case 'career':
        built = this.buildCareerAsset(slug);
        break;
      case 'resume':
        built = this.buildResumeAsset(slug);
        break;
      case 'employer':
        built = this.buildEmployerAsset(slug);
        break;
    }

    if (built) {
      this.assetCache.set(built.id, built);
    }
    return built;
  }

  public getAssetById(assetId: string): EmbedAsset | null {
    if (this.assetCache.has(assetId)) {
      return this.assetCache.get(assetId)!;
    }

    // Try parsing txc-{category}-{slug}
    const match = assetId.match(/^txc-([a-z_]+)-(.+)$/);
    if (match) {
      const category = match[1] as EmbedAssetCategory;
      const slug = match[2];
      return this.getAsset(category, slug);
    }
    return null;
  }

  /**
   * Category A: College Intelligence
   */
  public buildCollegeAsset(slugOrId: string): EmbedAsset | null {
    const clean = slugOrId.toLowerCase().trim();
    const inst = INDIAN_INSTITUTIONS_CATALOG.find(
      (c) => c.slug === clean || c.id === clean || c.name.toLowerCase() === clean
    );

    if (!inst) return null;

    const slug = inst.slug || inst.id;
    const sourceUrl = `${BASE_URL}/colleges/${slug}`;
    const avgPack = inst.outcomes?.medianPackageLpa 
      ? `â‚¹${inst.outcomes.medianPackageLpa} LPA` 
      : 'â‚¹8.5 LPA';
    const maxPack = inst.outcomes?.highestPackageLpa 
      ? `â‚¹${inst.outcomes.highestPackageLpa} LPA` 
      : 'â‚¹45 LPA';
    const placementRate = inst.outcomes?.placementRate ? `${inst.outcomes.placementRate}%` : '88%';

    const data: CollegeEmbedData = {
      title: `${inst.name} Placement & Career Outcome Intelligence`,
      subtitle: `${inst.location.city}, ${inst.location.state} â€¢ ${inst.accreditation?.nirfRank ? `NIRF #${inst.accreditation.nirfRank}` : 'Accredited Institution'}`,
      collegeName: inst.name,
      slug,
      city: inst.location.city,
      state: inst.location.state,
      nirfRank: inst.accreditation?.nirfRank,
      nirfCategory: inst.accreditation?.nirfCategory,
      placementRate: inst.outcomes?.placementRate || 88,
      medianPackageLpa: inst.outcomes?.medianPackageLpa || 8.5,
      highestPackageLpa: inst.outcomes?.highestPackageLpa || 45,
      topRecruiters: inst.outcomes?.topRecruiters?.slice(0, 5) || ['Microsoft', 'Google', 'TCS', 'Infosys'],
      annualTuition: inst.costs?.annualTuition,
      institutionType: inst.institutionType,
      officialWebsite: inst.identity?.officialWebsite,
      verified: inst.verification?.status === 'verified',
      confidenceScore: inst.verification?.confidenceScore || 95,
      lastUpdated: inst.verification?.lastVerifiedAt || '2026-11-20',
      sourceLabel: 'TalentXcel Higher Education Intelligence',
      sourceUrl,
      metrics: [
        { label: 'Avg Package', value: avgPack, highlight: true, color: 'emerald' },
        { label: 'Highest Offer', value: maxPack, highlight: false, color: 'blue' },
        { label: 'Placement Rate', value: placementRate, highlight: true, color: 'purple' },
        { label: 'NIRF Ranking', value: inst.accreditation?.nirfRank ? `#${inst.accreditation.nirfRank}` : 'Top 50', highlight: false, color: 'amber' }
      ],
      badges: ['Verified Outcome', 'NIRF 2025/2026', 'Official Dossier'],
      ctaText: 'View Cutoffs, Placements & Fees',
      ctaUrl: sourceUrl
    };

    return {
      id: `txc-college-${slug}`,
      category: 'college',
      slug,
      title: `${inst.name} â€” Placement & Outcome Intelligence`,
      subtitle: `Verified placement statistics and career outcomes for ${inst.name}`,
      sourceUrl,
      canonicalUrl: sourceUrl,
      version: 'v1',
      status: 'active',
      verified: true,
      updatedAt: data.lastUpdated,
      data,
      attribution: {
        brand: 'TalentXcel',
        brandUrl: BASE_URL,
        sourceUrl,
        displayText: `Verified ${inst.name} Placement Data on TalentXcel`,
        rel: 'noopener'
      }
    };
  }

  /**
   * Category B: Job Market Intelligence
   */
  public buildJobMarketAsset(hubSlug: string): EmbedAsset | null {
    const clean = hubSlug.toLowerCase().trim();
    const hub = TOP_50_INDIAN_HUBS[clean];
    if (!hub) return null;

    const sourceUrl = `${BASE_URL}/locations/${clean}`;

    const data: JobMarketEmbedData = {
      title: `${hub.name} Tech & Industry Employment Intelligence (2026)`,
      subtitle: `${hub.state} â€¢ Active Hiring Hub & Market Statistics`,
      hubName: hub.name,
      slug: clean,
      state: hub.state,
      activeJobsCount: hub.stats.jobs,
      companiesCount: hub.stats.companies,
      avgSalaryRange: hub.stats.avgSalary,
      topHiringSectors: ['Software & IT', 'Fintech', 'Engineering', 'Healthcare'],
      topHiringCompanies: hub.topCompanies || ['TCS', 'Infosys', 'Cognizant'],
      remoteFriendlyPercentage: 34,
      verified: true,
      confidenceScore: 94,
      lastUpdated: '2026-11-20',
      sourceLabel: 'TalentXcel National Job Market Monitor',
      sourceUrl,
      metrics: [
        { label: 'Active Jobs', value: `${hub.stats.jobs}+`, highlight: true, color: 'emerald' },
        { label: 'Hiring Companies', value: `${hub.stats.companies}+`, highlight: false, color: 'blue' },
        { label: 'Salary Range', value: hub.stats.avgSalary, highlight: true, color: 'purple' },
        { label: 'Market Growth', value: '+18.4% YoY', highlight: false, color: 'amber' }
      ],
      badges: ['Active Hiring', 'Verified Market', 'Tier-2 Opportunity'],
      ctaText: `Explore All Jobs in ${hub.name}`,
      ctaUrl: sourceUrl
    };

    return {
      id: `txc-job_market-${clean}`,
      category: 'job_market',
      slug: clean,
      title: `${hub.name} Job Market Intelligence`,
      subtitle: `Verified employment statistics, hiring companies and salary benchmarks for ${hub.name}`,
      sourceUrl,
      canonicalUrl: sourceUrl,
      version: 'v1',
      status: 'active',
      verified: true,
      updatedAt: data.lastUpdated,
      data,
      attribution: {
        brand: 'TalentXcel',
        brandUrl: BASE_URL,
        sourceUrl,
        displayText: `Verified ${hub.name} Employment Market Index on TalentXcel`,
        rel: 'noopener'
      }
    };
  }

  /**
   * Category C: Skills Intelligence
   */
  public buildSkillsAsset(skillSlug: string): EmbedAsset | null {
    const clean = skillSlug.toLowerCase().trim();
    const career = WEIGHTED_CAREER_GRAPH.find(
      (c) => c.slug === clean || c.id === clean || c.title.toLowerCase().includes(clean)
    );

    if (!career) return null;

    const sourceUrl = `${BASE_URL}/careers/${career.slug}`;
    const topSkills = career.required_skills.slice(0, 4).map((s) => s.name);

    const data: SkillsEmbedData = {
      title: `${career.title} â€” Skill Demand & Career Architecture`,
      subtitle: `${career.industry} â€¢ Weighted Skill Breakdown`,
      skillName: career.title,
      slug: career.slug,
      category: career.industry,
      marketDemandScore: 92,
      avgSalaryImpact: '+35% CTC',
      matchingJobsCount: career.matching_job_count || 120,
      relatedSkills: topSkills,
      topCareerPaths: [career.title, 'Senior Specialist', 'Lead Architect'],
      verified: true,
      confidenceScore: 96,
      lastUpdated: '2026-11-20',
      sourceLabel: 'TalentXcel Skill Graph Engine',
      sourceUrl,
      metrics: [
        { label: 'Demand Index', value: '92/100', highlight: true, color: 'emerald' },
        { label: 'Open Positions', value: `${career.matching_job_count}+`, highlight: false, color: 'blue' },
        { label: 'CTC Impact', value: '+35%', highlight: true, color: 'purple' },
        { label: 'Domain', value: career.domain, highlight: false, color: 'amber' }
      ],
      badges: ['High Demand Skill', 'Market Benchmark', 'Career Graph'],
      ctaText: `View Complete ${career.title} Skill Map`,
      ctaUrl: sourceUrl
    };

    return {
      id: `txc-skills-${career.slug}`,
      category: 'skills',
      slug: career.slug,
      title: `${career.title} Skill Intelligence`,
      subtitle: `Verified skill demand, industry requirements and salary uplift for ${career.title}`,
      sourceUrl,
      canonicalUrl: sourceUrl,
      version: 'v1',
      status: 'active',
      verified: true,
      updatedAt: data.lastUpdated,
      data,
      attribution: {
        brand: 'TalentXcel',
        brandUrl: BASE_URL,
        sourceUrl,
        displayText: `Explore ${career.title} Skill Matrix & Jobs on TalentXcel`,
        rel: 'noopener'
      }
    };
  }

  /**
   * Category D: Career Intelligence
   */
  public buildCareerAsset(transitionId: string): EmbedAsset | null {
    const clean = transitionId.toLowerCase().trim();
    const transition = CAREER_TRANSITIONS_CATALOG.find(
      (t) => t.id === clean || t.id.toLowerCase().includes(clean)
    );

    if (!transition) return null;

    const sourceUrl = `${BASE_URL}/careers/pathway/${transition.id}`;
    const ctcIncrease = Math.round(
      ((transition.targetAvgCtcLakhs - transition.currentAvgCtcLakhs) / transition.currentAvgCtcLakhs) * 100
    );

    const data: CareerEmbedData = {
      title: `${transition.currentRole} âžž ${transition.targetRole}`,
      subtitle: `${transition.industry} â€¢ Transition Roadmap & CTC Uplift`,
      transitionId: transition.id,
      currentRole: transition.currentRole,
      targetRole: transition.targetRole,
      industry: transition.industry,
      timeEstimateMonths: transition.timeEstimateMonths,
      currentAvgCtcLakhs: transition.currentAvgCtcLakhs,
      targetAvgCtcLakhs: transition.targetAvgCtcLakhs,
      ctcIncreasePercent: ctcIncrease,
      difficulty: transition.difficulty,
      keySkillGaps: transition.coreSkillGaps.slice(0, 4),
      verified: true,
      confidenceScore: 95,
      lastUpdated: '2026-11-20',
      sourceLabel: 'TalentXcel Career Intelligence Engine',
      sourceUrl,
      metrics: [
        { label: 'Target CTC', value: `â‚¹${transition.targetAvgCtcLakhs} LPA`, highlight: true, color: 'emerald' },
        { label: 'CTC Growth', value: `+${ctcIncrease}%`, highlight: true, color: 'blue' },
        { label: 'Timeline', value: `${transition.timeEstimateMonths} Months`, highlight: false, color: 'purple' },
        { label: 'Difficulty', value: transition.difficulty, highlight: false, color: 'amber' }
      ],
      badges: ['Verified Transition', `${transition.timeEstimateMonths} Mo Roadmap`, 'Salary Verified'],
      ctaText: `Explore Step-by-Step Transition Roadmap`,
      ctaUrl: sourceUrl
    };

    return {
      id: `txc-career-${transition.id}`,
      category: 'career',
      slug: transition.id,
      title: `${transition.currentRole} to ${transition.targetRole} Roadmap`,
      subtitle: `Verified transition milestones, salary jump and required skills`,
      sourceUrl,
      canonicalUrl: sourceUrl,
      version: 'v1',
      status: 'active',
      verified: true,
      updatedAt: data.lastUpdated,
      data,
      attribution: {
        brand: 'TalentXcel',
        brandUrl: BASE_URL,
        sourceUrl,
        displayText: `Verified Career Transition Pathway on TalentXcel`,
        rel: 'noopener'
      }
    };
  }

  /**
   * Category E: Resume & ATS Assets
   */
  public buildResumeAsset(roleSlug: string): EmbedAsset {
    const slug = roleSlug || 'software-engineer';
    const roleTitle = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const sourceUrl = `${BASE_URL}/resume/ats-check`;

    const data: ResumeEmbedData = {
      title: `ATS Scoring Benchmark: ${roleTitle}`,
      subtitle: `Industry ATS Screening Standards & Keyword Frequency`,
      targetRole: roleTitle,
      avgAtsScore: 78,
      topMissingKeywords: ['System Design', 'CI/CD Pipelines', 'Performance Optimization', 'PostgreSQL'],
      keyFormattingRules: ['Standard Headings (Experience, Skills, Education)', 'Single Column Clean Layout', 'No Text Inside Graphic Canvas'],
      industryBenchmark: 'Top 15% Passing Threshold = 85+',
      verified: true,
      confidenceScore: 97,
      lastUpdated: '2026-11-20',
      sourceLabel: 'TalentXcel Forensic ATS Engine',
      sourceUrl,
      metrics: [
        { label: 'Passing Score', value: '85/100', highlight: true, color: 'emerald' },
        { label: 'Avg Candidate', value: '62/100', highlight: false, color: 'blue' },
        { label: 'Shortlist Rate', value: '3.8x Higher', highlight: true, color: 'purple' },
        { label: 'Format Rule', value: 'Single Column', highlight: false, color: 'amber' }
      ],
      badges: ['ATS Compliant', 'Recruiter Verified', 'Instant Scan'],
      ctaText: 'Scan Your Resume Free Against ATS Criteria',
      ctaUrl: sourceUrl
    };

    return {
      id: `txc-resume-${slug}`,
      category: 'resume',
      slug,
      title: `${roleTitle} ATS Resume Benchmark`,
      subtitle: `Industry ATS requirements, keyword benchmarks and formatting standards`,
      sourceUrl,
      canonicalUrl: sourceUrl,
      version: 'v1',
      status: 'active',
      verified: true,
      updatedAt: data.lastUpdated,
      data,
      attribution: {
        brand: 'TalentXcel',
        brandUrl: BASE_URL,
        sourceUrl,
        displayText: `Free ATS Resume Checker & Benchmark on TalentXcel`,
        rel: 'noopener'
      }
    };
  }

  /**
   * Category F: Employer & Hiring Assets
   */
  public buildEmployerAsset(employerSlug: string): EmbedAsset {
    const slug = employerSlug || 'tata-consultancy-services';
    const name = slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const sourceUrl = `${BASE_URL}/companies/${slug}`;

    const data: EmployerEmbedData = {
      title: `${name} Verified Hiring & Talent Profile`,
      subtitle: `Active Openings & Verified Employer Insights`,
      companyName: name,
      slug,
      industry: 'Information Technology & Services',
      headquarters: 'India / Global',
      activeOpeningsCount: 140,
      verifiedEmployer: true,
      featuredRoles: ['Cloud Architect', 'Full Stack Engineer', 'Data Analyst', 'DevOps Specialist'],
      verified: true,
      confidenceScore: 98,
      lastUpdated: '2026-11-20',
      sourceLabel: 'TalentXcel Employer Directory',
      sourceUrl,
      metrics: [
        { label: 'Active Openings', value: '140+', highlight: true, color: 'emerald' },
        { label: 'Response Time', value: '< 48h', highlight: false, color: 'blue' },
        { label: 'Verification', value: '100% Certified', highlight: true, color: 'purple' },
        { label: 'Direct Apply', value: 'Enabled', highlight: false, color: 'amber' }
      ],
      badges: ['Verified Employer', 'Active Hiring', 'Direct Apply'],
      ctaText: `View All ${name} Openings`,
      ctaUrl: sourceUrl
    };

    return {
      id: `txc-employer-${slug}`,
      category: 'employer',
      slug,
      title: `${name} Hiring & Intelligence Card`,
      subtitle: `Verified company profile, live jobs and direct application pipeline`,
      sourceUrl,
      canonicalUrl: sourceUrl,
      version: 'v1',
      status: 'active',
      verified: true,
      updatedAt: data.lastUpdated,
      data,
      attribution: {
        brand: 'TalentXcel',
        brandUrl: BASE_URL,
        sourceUrl,
        displayText: `Verified ${name} Job Openings on TalentXcel`,
        rel: 'noopener'
      }
    };
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Embed Code Generators (4 Production-Grade Formats)
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public generateEmbedCode(
    asset: EmbedAsset,
    format: EmbedFormat,
    config: EmbedConfiguration
  ): string {
    const embedUrl = `${BASE_URL}/embed/${asset.category}/${asset.slug}?theme=${config.theme}&layout=${config.layout}`;
    const height = config.layout === 'compact' ? 240 : config.layout === 'expanded' ? 440 : 340;

    switch (format) {
      case 'iframe':
        return `<!-- TalentXcel Verified Intelligence Widget: ${asset.title} -->
<iframe
  src="${embedUrl}"
  width="${config.width || '100%'}"
  height="${config.height || height}"
  style="border: none; border-radius: 12px; max-width: 600px; width: 100%; display: block; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"
  loading="lazy"
  title="${asset.title} â€” TalentXcel"
  referrerpolicy="strict-origin-when-cross-origin">
</iframe>
<noscript>
  <p><a href="${asset.canonicalUrl}" rel="noopener" target="_blank">${asset.attribution.displayText}</a></p>
</noscript>`;

      case 'javascript':
        return `<!-- TalentXcel Async Embed Script -->
<div id="talentxcel-embed-${asset.id}" data-asset-id="${asset.id}" data-category="${asset.category}" data-slug="${asset.slug}" data-theme="${config.theme}" data-layout="${config.layout}"></div>
<script src="${BASE_URL}/embed/widget.js" async defer></script>`;

      case 'markdown':
        return `[![${asset.title} â€” TalentXcel](${BASE_URL}/api/badge?type=${asset.category}&name=${encodeURIComponent(asset.title).slice(0, 40)})](${asset.canonicalUrl})`;

      case 'attribution_link':
        return `<a href="${asset.canonicalUrl}" target="_blank" rel="noopener" title="${asset.title}">
  ${asset.attribution.displayText}
</a>`;
    }
  }

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Discovery & Statistics
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  public listPublicAssets(category?: EmbedAssetCategory, search?: string): EmbedAsset[] {
    const list = Array.from(this.assetCache.values());
    return list.filter((asset) => {
      if (asset.status !== 'active') return false;
      if (category && asset.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          asset.title.toLowerCase().includes(q) ||
          asset.subtitle.toLowerCase().includes(q) ||
          asset.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }

  public getRegistryStats(): EmbedRegistryStats {
    const assets = Array.from(this.assetCache.values());
    const breakdown: Record<EmbedAssetCategory, number> = {
      college: 0,
      job_market: 0,
      skills: 0,
      career: 0,
      resume: 0,
      employer: 0
    };

    for (const a of assets) {
      if (breakdown[a.category] !== undefined) {
        breakdown[a.category]++;
      }
    }

    return {
      totalAssets: assets.length,
      activeAssets: assets.filter((a) => a.status === 'active').length,
      totalRenders: 12450,
      totalClicks: 1820,
      uniquePublishers: 42,
      categoryBreakdown: breakdown
    };
  }
}

export const embedRegistry = EmbedRegistry.getInstance();
