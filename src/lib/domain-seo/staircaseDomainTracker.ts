// src/lib/domain-seo/staircaseDomainTracker.ts
/**
 * TalentXcel Domain Growth Staircase Tracker
 * 
 * Maps the 12-step growth staircase (Current: 2/day -> Step 1: 10/day -> Step 12: 50,000/day)
 * down to each production subdomain based on observed registration yield.
 */

import { SubdomainId, DomainStaircaseMilestone } from './types';
import { getAuthoritativeDomains } from './domainRegistry';

export interface DomainStaircaseProgress {
  subdomainId: SubdomainId;
  hostname: string;
  currentDailyRegistrations: number;
  step1TargetDailyRegistrations: number;
  longTermTargetDailyRegistrations: number;
  shareOfNetworkPct: number;
  step1DailyClicksNeeded: number;
  status: 'FOCUS' | 'ACTIVE' | 'BASELINE';
}

export class StaircaseDomainTracker {
  // Master Long-Term Target (Unforecasted North Star)
  public static readonly NETWORK_NORTH_STAR_DAILY = 50000;
  public static readonly STEP_1_TARGET_DAILY = 10;
  public static readonly CURRENT_OBSERVED_DAILY = 2;

  /**
   * Calculates the per-domain allocation for Step 1 (10/day) and Step 12 (50k/day).
   */
  public static getDomainStaircaseProgress(): Record<SubdomainId, DomainStaircaseProgress> {
    return {
      RESUME: {
        subdomainId: 'RESUME',
        hostname: 'resume.talentxcel.in',
        currentDailyRegistrations: 1.0,
        step1TargetDailyRegistrations: 3.5, // 35% share
        longTermTargetDailyRegistrations: 17500,
        shareOfNetworkPct: 35.0,
        step1DailyClicksNeeded: 10, // At 357 yield
        status: 'FOCUS',
      },
      JOBS: {
        subdomainId: 'JOBS',
        hostname: 'jobs.talentxcel.in',
        currentDailyRegistrations: 0.6,
        step1TargetDailyRegistrations: 3.0, // 30% share
        longTermTargetDailyRegistrations: 15000,
        shareOfNetworkPct: 30.0,
        step1DailyClicksNeeded: 13, // At 230 yield
        status: 'FOCUS',
      },
      CAREERS: {
        subdomainId: 'CAREERS',
        hostname: 'careers.talentxcel.in',
        currentDailyRegistrations: 0.2,
        step1TargetDailyRegistrations: 1.0, // 10% share
        longTermTargetDailyRegistrations: 6000,
        shareOfNetworkPct: 12.0,
        step1DailyClicksNeeded: 6, // At 181 yield
        status: 'ACTIVE',
      },
      SALARY: {
        subdomainId: 'SALARY',
        hostname: 'salary.talentxcel.in',
        currentDailyRegistrations: 0.1,
        step1TargetDailyRegistrations: 0.8, // 8% share
        longTermTargetDailyRegistrations: 4000,
        shareOfNetworkPct: 8.0,
        step1DailyClicksNeeded: 7, // At 111 yield
        status: 'ACTIVE',
      },
      LEARNING: {
        subdomainId: 'LEARNING',
        hostname: 'learning.talentxcel.in',
        currentDailyRegistrations: 0.1,
        step1TargetDailyRegistrations: 0.7, // 7% share
        longTermTargetDailyRegistrations: 3500,
        shareOfNetworkPct: 7.0,
        step1DailyClicksNeeded: 6, // At 111 yield
        status: 'ACTIVE',
      },
      GOVERNMENT: {
        subdomainId: 'GOVERNMENT',
        hostname: 'government.talentxcel.in',
        currentDailyRegistrations: 0.0,
        step1TargetDailyRegistrations: 0.4, // 4% share
        longTermTargetDailyRegistrations: 2500,
        shareOfNetworkPct: 5.0,
        step1DailyClicksNeeded: 3, // At 181 yield
        status: 'BASELINE',
      },
      COLLEGES: {
        subdomainId: 'COLLEGES',
        hostname: 'colleges.talentxcel.in',
        currentDailyRegistrations: 0.0,
        step1TargetDailyRegistrations: 0.2, // 2% share
        longTermTargetDailyRegistrations: 1500,
        shareOfNetworkPct: 3.0,
        step1DailyClicksNeeded: 2,
        status: 'BASELINE',
      },
      CORE: {
        subdomainId: 'CORE',
        hostname: 'talentxcel.in',
        currentDailyRegistrations: 0.0,
        step1TargetDailyRegistrations: 0.2,
        longTermTargetDailyRegistrations: 1000,
        shareOfNetworkPct: 2.0,
        step1DailyClicksNeeded: 1,
        status: 'BASELINE',
      },
      EMPLOYERS: {
        subdomainId: 'EMPLOYERS',
        hostname: 'employers.talentxcel.in',
        currentDailyRegistrations: 0.0,
        step1TargetDailyRegistrations: 0.1,
        longTermTargetDailyRegistrations: 1000,
        shareOfNetworkPct: 2.0,
        step1DailyClicksNeeded: 1,
        status: 'BASELINE',
      },
      PASSPORT: {
        subdomainId: 'PASSPORT',
        hostname: 'passport.talentxcel.in',
        currentDailyRegistrations: 0.0,
        step1TargetDailyRegistrations: 0.1,
        longTermTargetDailyRegistrations: 500,
        shareOfNetworkPct: 1.0,
        step1DailyClicksNeeded: 1,
        status: 'BASELINE',
      },
      EMPLOYER_ALIAS: {
        subdomainId: 'EMPLOYER_ALIAS',
        hostname: 'employer.talentxcel.in',
        currentDailyRegistrations: 0.0,
        step1TargetDailyRegistrations: 0.0,
        longTermTargetDailyRegistrations: 0,
        shareOfNetworkPct: 0.0,
        step1DailyClicksNeeded: 0,
        status: 'BASELINE',
      },
    };
  }

  /**
   * Generates summary scorecard for the entire network.
   */
  public static getNetworkSummary() {
    const progress = this.getDomainStaircaseProgress();
    const authoritative = getAuthoritativeDomains();

    let totalCurrent = 0;
    let totalStep1 = 0;
    let totalClicksNeeded = 0;

    for (const d of authoritative) {
      const p = progress[d.subdomainId];
      totalCurrent += p.currentDailyRegistrations;
      totalStep1 += p.step1TargetDailyRegistrations;
      totalClicksNeeded += p.step1DailyClicksNeeded;
    }

    return {
      currentDailyRegistrations: Math.round(totalCurrent),
      step1TargetDailyRegistrations: Math.round(totalStep1),
      dailyRegistrationGap: Math.round(totalStep1 - totalCurrent),
      totalClicksNeededForStep1: totalClicksNeeded,
      longTermNorthStarTarget: this.NETWORK_NORTH_STAR_DAILY,
      longTermGap: this.NETWORK_NORTH_STAR_DAILY - Math.round(totalCurrent),
    };
  }
}
