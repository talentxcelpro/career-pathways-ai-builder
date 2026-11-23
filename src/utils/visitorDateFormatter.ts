/**
 * visitorDateFormatter.ts
 * Formats visit timestamps into human-readable relative and exact local timezone representations.
 */

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export interface FormattedVisitTime {
  relativeText: string;
  exactDateTime: string;
  dateText: string;
  timeText: string;
}

export function formatVisitTimestamp(timestamp: string | Date | null | undefined): FormattedVisitTime {
  if (!timestamp) {
    return {
      relativeText: 'Unknown date',
      exactDateTime: 'Unknown time',
      dateText: 'Unknown',
      timeText: ''
    };
  }

  const visitDate = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (isNaN(visitDate.getTime())) {
    return {
      relativeText: 'Invalid date',
      exactDateTime: 'Invalid date',
      dateText: 'Invalid',
      timeText: ''
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - visitDate.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);

  // Time in local 12-hour format: "6:31 PM"
  let hours = visitDate.getHours();
  const minutes = visitDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeText = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

  // Calendar day comparisons in local timezone
  const isToday =
    visitDate.getDate() === now.getDate() &&
    visitDate.getMonth() === now.getMonth() &&
    visitDate.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    visitDate.getDate() === yesterday.getDate() &&
    visitDate.getMonth() === yesterday.getMonth() &&
    visitDate.getFullYear() === yesterday.getFullYear();

  const monthName = MONTHS[visitDate.getMonth()];
  const day = visitDate.getDate();
  const year = visitDate.getFullYear();
  const sameYear = year === now.getFullYear();
  const dateFormatted = sameYear ? `${monthName} ${day}` : `${monthName} ${day}, ${year}`;

  let relativeText: string;
  let dateText: string;

  if (diffSec < 60) {
    relativeText = 'Just now';
    dateText = 'Today';
  } else if (diffMin < 60) {
    relativeText = `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`;
    dateText = 'Today';
  } else if (diffHours < 6 && isToday) {
    relativeText = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    dateText = 'Today';
  } else if (isToday) {
    relativeText = `Today at ${timeText}`;
    dateText = 'Today';
  } else if (isYesterday) {
    relativeText = `Yesterday at ${timeText}`;
    dateText = 'Yesterday';
  } else {
    relativeText = `${dateFormatted} at ${timeText}`;
    dateText = dateFormatted;
  }

  const exactDateTime = `${dateFormatted} at ${timeText}`;

  return {
    relativeText,
    exactDateTime,
    dateText,
    timeText
  };
}
