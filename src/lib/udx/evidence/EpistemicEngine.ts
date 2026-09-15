/**
 * UDX Universal Discovery & Intelligence OS v3.0
 * Epistemic Engine
 * 
 * Enforces explicit visual semantics and metadata for the 9 epistemic states.
 * Guarantees that no modeled/forecast insight is presented as observed truth.
 */

import { EpistemicStatus } from './EvidenceTypes';

export interface EpistemicBadgeConfig {
  status: EpistemicStatus;
  label: string;
  badgeClass: string;
  iconName: string;
  description: string;
}

export class EpistemicEngine {
  public static getConfig(status: EpistemicStatus): EpistemicBadgeConfig {
    switch (status) {
      case 'OBSERVED':
        return {
          status,
          label: 'OBSERVED',
          badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
          iconName: 'CheckCircle2',
          description: 'Directly measured via empirical telemetry or external sensor.',
        };
      case 'VERIFIED_TRUTH':
        return {
          status,
          label: 'VERIFIED TRUTH',
          badgeClass: 'bg-emerald-900/90 text-emerald-200 border-emerald-600/80 shadow-emerald-950/50',
          iconName: 'ShieldCheck',
          description: 'Formally verified first-party reality (100% verified inventory/state).',
        };
      case 'DETECTED':
        return {
          status,
          label: 'DETECTED',
          badgeClass: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
          iconName: 'Radio',
          description: 'Statistically or algorithmically identified signal shift or anomaly.',
        };
      case 'MODELED':
        return {
          status,
          label: 'MODELED',
          badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
          iconName: 'Layers',
          description: 'Synthesized across multiple observations through a validated model.',
        };
      case 'FORECAST':
        return {
          status,
          label: 'FORECAST',
          badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800/60',
          iconName: 'TrendingUp',
          description: 'Probabilistic projection across a defined future time horizon.',
        };
      case 'RECOMMENDATION':
        return {
          status,
          label: 'RECOMMENDATION',
          badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
          iconName: 'Sparkles',
          description: 'Strategic action proposed to establish advantage before demand peaks.',
        };
      case 'EXPERIMENT':
        return {
          status,
          label: 'EXPERIMENT',
          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
          iconName: 'FlaskConical',
          description: 'Controlled live intervention deployed to test hypothesis.',
        };
      case 'OUTCOME':
        return {
          status,
          label: 'OUTCOME',
          badgeClass: 'bg-teal-950/80 text-teal-300 border-teal-800/60',
          iconName: 'Target',
          description: 'Empirically measured terminal outcome closing the feedback loop.',
        };
      case 'HYPOTHESIS':
      default:
        return {
          status: 'HYPOTHESIS',
          label: 'HYPOTHESIS',
          badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-800/60',
          iconName: 'AlertTriangle',
          description: 'Theoretical assumption pending empirical verification.',
        };
    }
  }
}
