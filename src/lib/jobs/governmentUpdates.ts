/**
 * Government Vacancy Corrigendum & Timeline Tracker
 * Tracks official notifications, deadline extensions, exam schedules, and vacancy count modifications.
 */

import { CorrigendumUpdate } from '@/types/jobs/globalJob';

export interface VacancyTimelineEvent {
  date: string;
  title: string;
  description: string;
  type: 'POSTED' | 'EXTENSION' | 'CORRIGENDUM' | 'EXAM_NOTICE' | 'CLOSED';
  officialNoticeUrl?: string;
}

export function buildVacancyTimeline(
  postedAt: string,
  closingDate?: string,
  corrigenda: CorrigendumUpdate[] = []
): VacancyTimelineEvent[] {
  const events: VacancyTimelineEvent[] = [
    {
      date: postedAt,
      title: 'Official Vacancy Notice Issued',
      description: 'Recruitment notification published by official government portal/gazette.',
      type: 'POSTED',
    },
  ];

  for (const c of corrigenda) {
    let eventType: VacancyTimelineEvent['type'] = 'CORRIGENDUM';
    if (c.update_type === 'DEADLINE_EXTENSION') eventType = 'EXTENSION';
    else if (c.update_type === 'EXAM_DATE_CHANGE') eventType = 'EXAM_NOTICE';

    events.push({
      date: c.detected_at,
      title: c.update_type.replace(/_/g, ' '),
      description: c.description,
      type: eventType,
      officialNoticeUrl: c.official_notice_url,
    });
  }

  if (closingDate) {
    const isPast = new Date(closingDate).getTime() <= Date.now();
    events.push({
      date: closingDate,
      title: isPast ? 'Applications Closed' : 'Application Deadline',
      description: isPast
        ? 'Online application window has concluded.'
        : 'Final deadline to register and submit application on official portal.',
      type: 'CLOSED',
    });
  }

  // Sort chronologically
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
