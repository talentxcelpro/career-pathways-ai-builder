/**
 * TalentXcel Multi-Criteria Job Alert Engine
 * Supports user criteria subscriptions across Private, Government, and Fresher domains.
 */

import { GlobalJob } from '@/types/jobs/globalJob';

export interface JobAlertSubscription {
  id: string;
  userId: string;
  query?: string;
  countryCode?: string;
  regionCode?: string;
  city?: string;
  industryId?: string;
  isFresherOnly?: boolean;
  isGovernmentOnly?: boolean;
  minSalaryAnnual?: number;
  workplaceType?: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  active: boolean;
  createdAt: string;
}

export function matchesJobAlert(alert: JobAlertSubscription, job: GlobalJob): boolean {
  if (!alert.active) return false;

  // 1. Fresher filter
  if (alert.isFresherOnly && !job.accepts_freshers) {
    return false;
  }

  // 2. Government filter
  if (alert.isGovernmentOnly && !job.is_government) {
    return false;
  }

  // 3. Country check
  if (alert.countryCode && job.country_code !== alert.countryCode) {
    return false;
  }

  // 4. City / Region check
  if (alert.city && job.city && !job.city.toLowerCase().includes(alert.city.toLowerCase())) {
    return false;
  }

  // 5. Industry check
  if (alert.industryId && job.industry_id !== alert.industryId) {
    return false;
  }

  // 6. Minimum Salary check
  if (alert.minSalaryAnnual && job.salary?.normalized_annual_inr) {
    if (job.salary.normalized_annual_inr < alert.minSalaryAnnual) {
      return false;
    }
  }

  // 7. Free text query
  if (alert.query) {
    const q = alert.query.toLowerCase();
    const text = `${job.title} ${job.description} ${job.employer.legal_name} ${job.skills.join(' ')}`.toLowerCase();
    if (!text.includes(q)) {
      return false;
    }
  }

  return true;
}
