// src/lib/autonomous-os/channelOrchestrator.ts
import { ChannelType } from './types';

export interface ChannelDescriptor {
  channel: ChannelType;
  displayName: string;
  status: 'ACTIVE_SCALING' | 'OPTIMIZING' | 'MEASURING' | 'RESTRICTED_SAFE_MODE';
  currentMonthlyRunRate: number;
  targetSharePct: number;
}

export const CHANNEL_REGISTRY: ChannelDescriptor[] = [
  { channel: 'SEARCH_ORGANIC', displayName: 'Google & Search Engine Optimization', status: 'ACTIVE_SCALING', currentMonthlyRunRate: 32400, targetSharePct: 15 },
  { channel: 'PRODUCT_LED_UTILITY', displayName: 'ATS Resume Scanner & Career Tools', status: 'ACTIVE_SCALING', currentMonthlyRunRate: 58000, targetSharePct: 30 },
  { channel: 'PUBLIC_UGC_OBJECTS', displayName: 'Career Passports & Verified Identities', status: 'ACTIVE_SCALING', currentMonthlyRunRate: 26000, targetSharePct: 15 },
  { channel: 'AI_DISCOVERY_GEO', displayName: 'Generative Engine Citations (ChatGPT/Perplexity)', status: 'OPTIMIZING', currentMonthlyRunRate: 14500, targetSharePct: 10 },
  { channel: 'REFERRAL_VIRAL', displayName: 'Incentivized Member-Get-Member Referrals', status: 'OPTIMIZING', currentMonthlyRunRate: 22000, targetSharePct: 20 },
  { channel: 'EXTERNAL_COMMUNITY', displayName: 'College TPOs & Student Placement Networks', status: 'RESTRICTED_SAFE_MODE', currentMonthlyRunRate: 12000, targetSharePct: 10 }
];
