// src/lib/marketing/referralUnlockEngine.ts
// Referral & Unlock Engine: Incentivized viral loop ($K > 1.2) unlocking high-value career assets

export interface ReferralTier {
  tierId: string;
  requiredInvites: number;
  unlockedAssetTitle: string;
  unlockedAssetDescription: string;
  assetDownloadUrl: string;
  badgeTitle: string;
}

export const REFERRAL_UNLOCK_TIERS: ReferralTier[] = [
  {
    tierId: 'TIER_1_HR_DIRECTORY',
    requiredInvites: 3,
    unlockedAssetTitle: '2026 Verified Tech & Startup HR Email Directory (500+ Direct Contacts)',
    unlockedAssetDescription: 'Direct verified email addresses and LinkedIn profiles of Tech Recruiters and Talent Acquisition Leads hiring in Bangalore, Delhi NCR, Hyderabad, and Remote.',
    assetDownloadUrl: 'https://talentxcel.in/assets/directory/tech-hr-contacts-2026.csv',
    badgeTitle: 'Verified Talent Scout'
  },
  {
    tierId: 'TIER_2_AI_RESUME_PRO',
    requiredInvites: 5,
    unlockedAssetTitle: 'Unlimited 1-Click AI Resume Auto-Optimizer & Cover Letter Generator',
    unlockedAssetDescription: 'Full access to automated ATS keyword injection, bullet-point impact rewrites, and role-specific cover letter studio.',
    assetDownloadUrl: 'https://talentxcel.in/resume/pro-unlocked',
    badgeTitle: 'Elite Career Pro'
  },
  {
    tierId: 'TIER_3_DIRECT_REFERRAL',
    requiredInvites: 10,
    unlockedAssetTitle: 'Guaranteed Priority Employer Shortlisting & Direct Founder Referral',
    unlockedAssetDescription: 'Your Career Passport is tagged with Priority Fast-Track badge and pushed to top 50 hiring startups on TalentXcel.',
    assetDownloadUrl: 'https://talentxcel.in/passport/priority-verified',
    badgeTitle: 'TalentXcel Ambassador'
  }
];

export function generateMemberInviteLink(userId: string, source: string = 'referral_engine'): string {
  const shortId = userId.slice(0, 8);
  return `https://talentxcel.in/resume?ref=inv_${shortId}&utm_source=${source}&utm_medium=viral_share`;
}

export function checkUnlockedTiers(completedInvitesCount: number): {
  unlockedTiers: ReferralTier[];
  nextTier: ReferralTier | null;
  invitesNeededForNextTier: number;
} {
  const unlocked = REFERRAL_UNLOCK_TIERS.filter(t => completedInvitesCount >= t.requiredInvites);
  const next = REFERRAL_UNLOCK_TIERS.find(t => completedInvitesCount < t.requiredInvites) || null;
  const needed = next ? next.requiredInvites - completedInvitesCount : 0;

  return {
    unlockedTiers: unlocked,
    nextTier: next,
    invitesNeededForNextTier: needed
  };
}
