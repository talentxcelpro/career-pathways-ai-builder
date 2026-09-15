// src/lib/autonomous-os/referralEngine.ts

export interface ReferralCohortStats {
  cohortName: string;
  totalReferrers: number;
  invitesSent: number;
  newSignupsFromInvites: number;
  effectiveKFactor: number;
}

export const REFERRAL_STATS: ReferralCohortStats = {
  cohortName: '2026 Verified Tech HR Directory Unlockers',
  totalReferrers: 1200,
  invitesSent: 3840,
  newSignupsFromInvites: 1260,
  effectiveKFactor: 1.05
};
