/**
 * TalentXcel Government Source Policy Engine
 * Enforces field-level redistribution permissions, application routing,
 * and canonical indexing rules on a per-source basis.
 */

import {
  GOVERNMENT_SOURCE_MAP,
  RedistributionStatus,
  GovernmentJobSource
} from '@/config/jobs/governmentSources';

export interface SourceRightsDecision {
  sourceId: string;
  sourceName: string;
  policy: RedistributionStatus;
  canDisplayFullDescription: boolean;
  canStoreRawPayload: boolean;
  canNormalizeSalary: boolean;
  canCreateCanonicalDetailPage: boolean;
  canPublishGoogleJobPostingSchema: boolean;
  canOfferNativeApply: boolean;
  requiresOfficialRedirect: boolean;
  attributionRequired: boolean;
  attributionText: string;
  attributionUrl: string;
  retentionDays: number;
  reason: string;
}

/**
 * Evaluates the legal and contractual redistribution rights for any government or public sector source.
 */
export function evaluateSourcePolicy(sourceId: string): SourceRightsDecision {
  const source: GovernmentJobSource | undefined = GOVERNMENT_SOURCE_MAP[sourceId];

  // Default fail-safe policy for unknown or unlisted sources: DO NOT INGEST / LINK OUT ONLY
  if (!source) {
    return {
      sourceId,
      sourceName: 'Unknown Source',
      policy: 'DO_NOT_INGEST',
      canDisplayFullDescription: false,
      canStoreRawPayload: false,
      canNormalizeSalary: false,
      canCreateCanonicalDetailPage: false,
      canPublishGoogleJobPostingSchema: false,
      canOfferNativeApply: false,
      requiresOfficialRedirect: true,
      attributionRequired: true,
      attributionText: 'Source: External Portal',
      attributionUrl: 'https://talentxcel.in',
      retentionDays: 0,
      reason: 'Source is not registered in the TalentXcel Government Source Registry.',
    };
  }

  const attributionText = source.attribution_text || `Source: ${source.portal_name}`;
  const attributionUrl = source.attribution_url || source.website;

  switch (source.redistribution_status) {
    case 'FULL_REPUBLISH':
      return {
        sourceId,
        sourceName: source.portal_name,
        policy: 'FULL_REPUBLISH',
        canDisplayFullDescription: true,
        canStoreRawPayload: true,
        canNormalizeSalary: true,
        canCreateCanonicalDetailPage: true,
        canPublishGoogleJobPostingSchema: true,
        canOfferNativeApply: source.application_routing === 'DIRECT_APPLY_NATIVE',
        requiresOfficialRedirect: source.application_redirect_required,
        attributionRequired: source.attribution_required,
        attributionText,
        attributionUrl,
        retentionDays: 90,
        reason: 'Source grants explicit full republishing authorization.',
      };

    case 'ATTRIBUTED_REPUBLISH':
      // e.g. USAJOBS, Employment News
      return {
        sourceId,
        sourceName: source.portal_name,
        policy: 'ATTRIBUTED_REPUBLISH',
        canDisplayFullDescription: true,
        canStoreRawPayload: true,
        canNormalizeSalary: true,
        canCreateCanonicalDetailPage: true,
        canPublishGoogleJobPostingSchema: true,
        canOfferNativeApply: false, // Invariant: must redirect to official portal
        requiresOfficialRedirect: true,
        attributionRequired: true,
        attributionText,
        attributionUrl,
        retentionDays: 60,
        reason: 'Authorized for search & display with mandatory attribution; application strictly directs to official portal.',
      };

    case 'SUMMARY_ONLY':
      // e.g. UPSC, SSC
      return {
        sourceId,
        sourceName: source.portal_name,
        policy: 'SUMMARY_ONLY',
        canDisplayFullDescription: false, // Summary and vacancy metadata only
        canStoreRawPayload: true,
        canNormalizeSalary: true,
        canCreateCanonicalDetailPage: true, // Landing page with official notice link
        canPublishGoogleJobPostingSchema: false, // Google requires complete description
        canOfferNativeApply: false,
        requiresOfficialRedirect: true,
        attributionRequired: true,
        attributionText,
        attributionUrl,
        retentionDays: 30,
        reason: 'Only summary and title reproduction permitted; detailed examination notification hosted on official site.',
      };

    case 'LINK_OUT':
      // e.g. UP Rojgar Sangam, UK Civil Service, Tawteen
      return {
        sourceId,
        sourceName: source.portal_name,
        policy: 'LINK_OUT',
        canDisplayFullDescription: false,
        canStoreRawPayload: false,
        canNormalizeSalary: false,
        canCreateCanonicalDetailPage: false, // Discovery link only, no individual detail page
        canPublishGoogleJobPostingSchema: false,
        canOfferNativeApply: false,
        requiresOfficialRedirect: true,
        attributionRequired: true,
        attributionText,
        attributionUrl,
        retentionDays: 14,
        reason: 'No content reproduction authorized; discovery link-out only.',
      };

    case 'API_ONLY':
    case 'PARTNER_ONLY':
      return {
        sourceId,
        sourceName: source.portal_name,
        policy: source.redistribution_status,
        canDisplayFullDescription: false,
        canStoreRawPayload: false,
        canNormalizeSalary: false,
        canCreateCanonicalDetailPage: false,
        canPublishGoogleJobPostingSchema: false,
        canOfferNativeApply: false,
        requiresOfficialRedirect: true,
        attributionRequired: true,
        attributionText,
        attributionUrl,
        retentionDays: 7,
        reason: 'Requires partner bilateral agreement before activation.',
      };

    case 'DO_NOT_INGEST':
    default:
      return {
        sourceId,
        sourceName: source.portal_name,
        policy: 'DO_NOT_INGEST',
        canDisplayFullDescription: false,
        canStoreRawPayload: false,
        canNormalizeSalary: false,
        canCreateCanonicalDetailPage: false,
        canPublishGoogleJobPostingSchema: false,
        canOfferNativeApply: false,
        requiresOfficialRedirect: true,
        attributionRequired: false,
        attributionText: '',
        attributionUrl: '',
        retentionDays: 0,
        reason: 'Explicitly prohibited from ingestion by portal terms of use.',
      };
  }
}

export const resolveSourcePolicy = evaluateSourcePolicy;

