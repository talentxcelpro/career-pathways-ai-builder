/**
 * USAJOBS Item Mapper
 * Maps raw USAJOBS API payload into internal structures.
 */

import { USAJobsItem } from './USAJobsTypes';
import { GlobalJobSalary, WorkplaceType, RemoteScope } from '@/types/jobs/globalJob';

export function mapUSAJobsSalary(item: USAJobsItem): GlobalJobSalary | undefined {
  const rem = item.MatchedObjectDescriptor.PositionRemuneration?.[0];
  if (!rem) return undefined;

  const min = parseFloat(rem.MinimumRange);
  const max = parseFloat(rem.MaximumRange);
  const interval = (rem.RateIntervalCode || '').toLowerCase();

  let period: 'HOUR' | 'MONTH' | 'YEAR' = 'YEAR';
  if (interval.includes('hour')) period = 'HOUR';
  else if (interval.includes('month')) period = 'MONTH';

  const minVal = isNaN(min) ? undefined : min;
  const maxVal = isNaN(max) ? undefined : max;

  // Compute normalized USD annual
  let annualUsd = minVal;
  if (annualUsd) {
    if (period === 'HOUR') annualUsd = annualUsd * 2080;
    else if (period === 'MONTH') annualUsd = annualUsd * 12;
  }

  return {
    currency: 'USD',
    minimum: minVal,
    maximum: maxVal,
    period,
    original_display: `$${minVal?.toLocaleString() ?? ''} - $${maxVal?.toLocaleString() ?? ''} ${rem.RateIntervalCode}`,
    normalized_annual_usd: annualUsd,
    normalized_annual_inr: annualUsd ? Math.round(annualUsd * 87) : undefined,
  };
}

export function mapUSAJobsWorkplace(item: USAJobsItem): { workplaceType: WorkplaceType; remoteScope?: RemoteScope } {
  const details = item.MatchedObjectDescriptor.UserArea?.Details;
  const isTelework = details?.TeleworkEligible === true;
  const locName = item.MatchedObjectDescriptor.PositionLocation?.[0]?.LocationName || '';

  if (locName.toLowerCase().includes('negotiable') || locName.toLowerCase().includes('anywhere')) {
    return { workplaceType: 'REMOTE', remoteScope: 'COUNTRY' };
  }
  if (isTelework) {
    return { workplaceType: 'HYBRID' };
  }
  return { workplaceType: 'ON_SITE' };
}
