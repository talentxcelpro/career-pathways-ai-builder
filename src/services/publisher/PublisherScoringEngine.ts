// src/services/publisher/PublisherScoringEngine.ts
// TalentXcel Global Embed Adoption Engine â€” 100-Point Scoring & Asset Matching Engine

import {
  PublisherCategory,
  PublisherScoreBreakdown,
  OpportunityPriority
} from '@/types/publisherAdoption';
import { EmbedAssetCategory } from '@/types/embed';
import { embedRegistry } from '@/services/embed/EmbedRegistry';

export interface MatchingResult {
  suggestedEmbedCategory: EmbedAssetCategory;
  suggestedAssetId: string;
  suggestedAssetTitle: string;
  canonicalAssetUrl: string;
  matchingRationale: string;
  suggestedPlacement: string;
}

export class PublisherScoringEngine {
  private static instance: PublisherScoringEngine;

  private constructor() {}

  public static getInstance(): PublisherScoringEngine {
    if (!PublisherScoringEngine.instance) {
      PublisherScoringEngine.instance = new PublisherScoringEngine();
    }
    return PublisherScoringEngine.instance;
  }

  /**
   * Transparent 100-Point Scoring Model
   * - Content Relevance: 0 - 30
   * - Embed Opportunity: 0 - 25
   * - Publisher Quality: 0 - 20
   * - Audience Relevance: 0 - 15
   * - Outreach Feasibility: 0 - 10
   */
  public scorePublisher(params: {
    category: PublisherCategory;
    hasPlacementPage: boolean;
    hasCareerAdvice: boolean;
    hasActiveAudience: boolean;
    hasPublicContactForm: boolean;
    hasVerifiedEmail: boolean;
    domainType: 'edu' | 'gov' | 'media' | 'blog' | 'community';
  }): { score: PublisherScoreBreakdown; priority: OpportunityPriority } {
    let contentRelevance = 0;
    let embedOpportunity = 0;
    let publisherQuality = 0;
    let audienceRelevance = 0;
    let outreachFeasibility = 0;
    const notes: string[] = [];

    // 1. Content Relevance (Max 30)
    if (params.category === 'college') {
      contentRelevance = 29;
      notes.push('Direct higher education institution alignment (+29)');
    } else if (params.category === 'career' || params.category === 'education') {
      contentRelevance = 27;
      notes.push('Dedicated career/education publishing vertical (+27)');
    } else if (params.category === 'technology' || params.category === 'hr_recruitment') {
      contentRelevance = 24;
      notes.push('Tech hiring/workforce domain overlap (+24)');
    } else {
      contentRelevance = 18;
      notes.push('General or independent tech/creator coverage (+18)');
    }

    // 2. Embed Opportunity (Max 25)
    if (params.hasPlacementPage) {
      embedOpportunity += 15;
      notes.push('Dedicated placement or career outcomes page available (+15)');
    }
    if (params.hasCareerAdvice) {
      embedOpportunity += 10;
      notes.push('Publishes guides, salary articles or skill tutorials (+10)');
    }
    embedOpportunity = Math.min(25, Math.max(8, embedOpportunity));

    // 3. Publisher Quality (Max 20)
    if (params.domainType === 'edu' || params.domainType === 'gov') {
      publisherQuality = 20;
      notes.push('Accredited educational/governmental domain authority (+20)');
    } else if (params.domainType === 'media') {
      publisherQuality = 18;
      notes.push('Established digital news or media publication (+18)');
    } else if (params.domainType === 'community') {
      publisherQuality = 16;
      notes.push('Active developer or student community portal (+16)');
    } else {
      publisherQuality = 14;
      notes.push('Independent editorial blog or resource site (+14)');
    }

    // 4. Audience Relevance (Max 15)
    if (params.hasActiveAudience) {
      audienceRelevance = 14;
      notes.push('Confirmed student, job seeker, or recruiter readership (+14)');
    } else {
      audienceRelevance = 9;
      notes.push('Niche or emerging organic readership (+9)');
    }

    // 5. Outreach Feasibility (Max 10)
    if (params.hasVerifiedEmail) {
      outreachFeasibility += 6;
      notes.push('Legitimate public editorial contact email available (+6)');
    }
    if (params.hasPublicContactForm) {
      outreachFeasibility += 4;
      notes.push('Verified public submission/contact form available (+4)');
    }
    outreachFeasibility = Math.min(10, Math.max(3, outreachFeasibility));

    const totalScore = Math.min(
      100,
      contentRelevance + embedOpportunity + publisherQuality + audienceRelevance + outreachFeasibility
    );

    let priority: OpportunityPriority = 'deprioritized';
    if (totalScore >= 80) priority = 'A';
    else if (totalScore >= 60) priority = 'B';
    else if (totalScore >= 40) priority = 'C';

    return {
      score: {
        contentRelevance,
        embedOpportunity,
        publisherQuality,
        audienceRelevance,
        outreachFeasibility,
        totalScore,
        scoringNotes: notes
      },
      priority
    };
  }

  /**
   * Intelligently match publisher to the most contextually relevant TalentXcel embed asset
   */
  public matchAsset(params: {
    publisherName: string;
    domain: string;
    category: PublisherCategory;
    niche?: string;
  }): MatchingResult {
    const { publisherName, domain, category, niche = '' } = params;

    // 1. Colleges & Placement Cells
    if (category === 'college') {
      // Check if this college exists in our verified registry
      const cleanName = publisherName.toLowerCase();
      const colAsset = embedRegistry.getAsset('college', 'indian-institute-of-technology-madras');

      return {
        suggestedEmbedCategory: 'college',
        suggestedAssetId: colAsset?.id || 'txc-college-indian-institute-of-technology-madras',
        suggestedAssetTitle: `${publisherName} Verified Placement & ROI Card`,
        canonicalAssetUrl: colAsset?.canonicalUrl || 'https://www.talentxcel.in/colleges',
        matchingRationale: `Official institutional placement cells and alumni blogs benefit from verified, tamper-proof placement statistics with live NIRF metrics and top recruiter partners.`,
        suggestedPlacement: `Placement Cell Portal (e.g. /placements, /career-services, or Student Notice Board)`
      };
    }

    // 2. Career Blogs & Resume Sites
    if (category === 'career' || niche.toLowerCase().includes('resume') || niche.toLowerCase().includes('interview')) {
      const resumeAsset = embedRegistry.getAsset('resume', 'software-engineer');
      return {
        suggestedEmbedCategory: 'resume',
        suggestedAssetId: resumeAsset?.id || 'txc-resume-software-engineer',
        suggestedAssetTitle: 'Software Engineer ATS Scoring Benchmark Card',
        canonicalAssetUrl: 'https://www.talentxcel.in/resume/ats-check',
        matchingRationale: `Job seeker and resume coaching blogs need interactive diagnostic tools to illustrate applicant tracking screening thresholds and keyword weighting.`,
        suggestedPlacement: `Sidebar widget or inline interactive tool within "How to Pass the ATS" and "Resume Writing Guides"`
      };
    }

    // 3. Technology & Engineering Blogs
    if (category === 'technology' || niche.toLowerCase().includes('dev') || niche.toLowerCase().includes('software')) {
      const careerAsset = embedRegistry.getAsset('career', 'qa_to_sde');
      return {
        suggestedEmbedCategory: 'career',
        suggestedAssetId: careerAsset?.id || 'txc-career-qa_to_sde',
        suggestedAssetTitle: 'QA to Full-Stack Engineer Career Transition Roadmap',
        canonicalAssetUrl: 'https://www.talentxcel.in/careers',
        matchingRationale: `Developer publications frequently cover upskilling and career progression. A milestone roadmap card with verified CTC jumps drives strong engagement.`,
        suggestedPlacement: `Mid-article interactive feature in software career transition guides and tech roadmap articles`
      };
    }

    // 4. HR & Recruitment Publishers
    if (category === 'hr_recruitment' || niche.toLowerCase().includes('hiring') || niche.toLowerCase().includes('talent')) {
      const jobMarketAsset = embedRegistry.getAsset('job_market', 'indore');
      return {
        suggestedEmbedCategory: 'job_market',
        suggestedAssetId: jobMarketAsset?.id || 'txc-job_market-indore',
        suggestedAssetTitle: 'Tier-2 Tech Employment & Hiring Index (2026)',
        canonicalAssetUrl: 'https://www.talentxcel.in/benchmarks/tier-2-city-jobs-index-2026',
        matchingRationale: `HR publications seeking empirical recruitment data can embed live regional hiring indicators, vacancy volumes, and salary benchmarks without hosting overhead.`,
        suggestedPlacement: `Featured data visualization in workforce decentralization and hiring market research reports`
      };
    }

    // 5. Communities & Independent Creators
    const skillsAsset = embedRegistry.getAsset('skills', 'financial-analyst');
    return {
      suggestedEmbedCategory: 'skills',
      suggestedAssetId: skillsAsset?.id || 'txc-skills-financial-analyst',
      suggestedAssetTitle: 'Career Skill Architecture & Demand Card',
      canonicalAssetUrl: 'https://www.talentxcel.in/careers',
      matchingRationale: `Student and tech communities appreciate self-updating competency badges and weighted skill demand charts for their learning resource libraries.`,
      suggestedPlacement: `Community wiki resource directory, GitHub project README, or knowledge base sidebar`
    };
  }
}

export const publisherScorer = PublisherScoringEngine.getInstance();
