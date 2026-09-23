/**
 * India Government Vacancy Ingestion & Provenance Policy
 *
 * Rules:
 * 1. Gazette / Employment News / PSC notifications are official announcements.
 * 2. Mandatory attribution of publishing ministry / portal.
 * 3. Never represent an examination vacancy as a direct private hire.
 * 4. Application button links directly to official commission portal (e.g. upsconline.nic.in, ssc.gov.in).
 * 5. directApply: false always.
 */

export const INDIA_GOV_ATTRIBUTION_DISCLAIMER =
  'Notice: Official Government of India / State recruitment notification. All candidates must apply exclusively through the designated official government commission portal.';

export function getIndiaGovCategorySlug(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('psu') || c.includes('undertaking')) return 'psu';
  if (c.includes('defence') || c.includes('army') || c.includes('navy')) return 'defence';
  if (c.includes('rail')) return 'railways';
  if (c.includes('bank')) return 'banking';
  if (c.includes('state')) return 'state-govt';
  return 'central-govt';
}
