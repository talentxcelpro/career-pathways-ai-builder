/**
 * presenceFormatter.ts
 * Unified presence and last-seen formatter for TalentXcel Network
 * Platform: TalentXcel.in
 */

export interface PresenceData {
  is_online?: boolean | null;
  last_seen?: string | null;
  last_heartbeat_at?: string | null;
  is_visible?: boolean | null;
  visibility?: string | null;
}

export interface FormattedPresence {
  label: string;
  isOnline: boolean;
  isRecent: boolean;
  statusColor: 'green' | 'gray' | 'hidden';
  dotColorClass: string;
  textColorClass: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Formats a user's presence into accurate, human-readable, privacy-respecting status.
 *
 * Status Hierarchy:
 * - Online: "Active now"
 * - Recent: "Active 1 minute ago", "Active 2 minutes ago", "Active 18 minutes ago"
 * - Same day older: "Active 2 hours ago" or "Active today at 6:31 PM"
 * - Previous day: "Active yesterday at 4:15 PM" (or "Active yesterday")
 * - Older: "Active Nov 21 at 9:42 PM"
 */
export function formatPresence(
  presence?: PresenceData | null,
  options?: {
    now?: Date;
    shortYesterday?: boolean;
    hideIfOffline?: boolean;
  }
): FormattedPresence {
  // If explicitly hidden by privacy setting
  if (!presence || presence.is_visible === false || presence.visibility === 'nobody') {
    return {
      label: '',
      isOnline: false,
      isRecent: false,
      statusColor: 'hidden',
      dotColorClass: 'hidden',
      textColorClass: 'hidden'
    };
  }

  const now = options?.now || new Date();
  const nowMs = now.getTime();

  // 1. Verify Online Status with confirmed recent heartbeat or fresh last_seen
  let isConfirmedOnline = false;

  const heartbeatTime = presence.last_heartbeat_at ? new Date(presence.last_heartbeat_at).getTime() : 0;
  const lastSeenTime = presence.last_seen ? new Date(presence.last_seen).getTime() : 0;
  const mostRecentActivityMs = Math.max(heartbeatTime, lastSeenTime);

  if (presence.is_online === true) {
    if (mostRecentActivityMs > 0) {
      // Must have had a heartbeat or activity within last 2 minutes (120,000 ms)
      const diffSinceActivity = nowMs - mostRecentActivityMs;
      if (diffSinceActivity <= 120_000) {
        isConfirmedOnline = true;
      }
    } else {
      isConfirmedOnline = true;
    }
  } else if (mostRecentActivityMs > 0 && nowMs - mostRecentActivityMs < 60_000) {
    // Activity within less than 60 seconds
    isConfirmedOnline = true;
  }

  if (isConfirmedOnline) {
    return {
      label: 'Active now',
      isOnline: true,
      isRecent: true,
      statusColor: 'green',
      dotColorClass: 'bg-emerald-500',
      textColorClass: 'text-emerald-600 dark:text-emerald-400 font-semibold'
    };
  }

  // 2. Relative time formatting for offline / last active
  if (!presence.last_seen && !presence.last_heartbeat_at) {
    if (options?.hideIfOffline) {
      return {
        label: '',
        isOnline: false,
        isRecent: false,
        statusColor: 'hidden',
        dotColorClass: 'hidden',
        textColorClass: 'hidden'
      };
    }
    return {
      label: 'Offline',
      isOnline: false,
      isRecent: false,
      statusColor: 'gray',
      dotColorClass: 'bg-slate-400',
      textColorClass: 'text-slate-500 dark:text-slate-400'
    };
  }

  const activeDate = new Date(presence.last_seen || presence.last_heartbeat_at || '');
  if (isNaN(activeDate.getTime())) {
    return {
      label: 'Offline',
      isOnline: false,
      isRecent: false,
      statusColor: 'gray',
      dotColorClass: 'bg-slate-400',
      textColorClass: 'text-slate-500 dark:text-slate-400'
    };
  }

  const diffMs = nowMs - activeDate.getTime();

  // If clock skew resulted in slightly negative difference or under 1 minute
  if (diffMs < 60_000) {
    return {
      label: 'Active now',
      isOnline: true,
      isRecent: true,
      statusColor: 'green',
      dotColorClass: 'bg-emerald-500',
      textColorClass: 'text-emerald-600 dark:text-emerald-400 font-semibold'
    };
  }

  // Minutes ago: 1 to 59 minutes
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    const minText = diffMinutes === 1 ? '1 minute' : `${diffMinutes} minutes`;
    return {
      label: `Active ${minText} ago`,
      isOnline: false,
      isRecent: true,
      statusColor: 'gray',
      dotColorClass: 'bg-slate-400',
      textColorClass: 'text-slate-600 dark:text-slate-400'
    };
  }

  // Check same calendar day in viewer's local timezone
  const isToday =
    activeDate.getDate() === now.getDate() &&
    activeDate.getMonth() === now.getMonth() &&
    activeDate.getFullYear() === now.getFullYear();

  const diffHours = Math.floor(diffMs / 3_600_000);

  if (isToday) {
    if (diffHours < 3) {
      const hrText = diffHours === 1 ? '1 hour' : `${diffHours} hours`;
      return {
        label: `Active ${hrText} ago`,
        isOnline: false,
        isRecent: false,
        statusColor: 'gray',
        dotColorClass: 'bg-slate-400',
        textColorClass: 'text-slate-500 dark:text-slate-400'
      };
    }

    const timeStr = formatTime(activeDate);
    return {
      label: `Active today at ${timeStr}`,
      isOnline: false,
      isRecent: false,
      statusColor: 'gray',
      dotColorClass: 'bg-slate-400',
      textColorClass: 'text-slate-500 dark:text-slate-400'
    };
  }

  // Check yesterday in viewer's local timezone
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    activeDate.getDate() === yesterday.getDate() &&
    activeDate.getMonth() === yesterday.getMonth() &&
    activeDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    if (options?.shortYesterday) {
      return {
        label: 'Active yesterday',
        isOnline: false,
        isRecent: false,
        statusColor: 'gray',
        dotColorClass: 'bg-slate-400',
        textColorClass: 'text-slate-500 dark:text-slate-400'
      };
    }
    const timeStr = formatTime(activeDate);
    return {
      label: `Active yesterday at ${timeStr}`,
      isOnline: false,
      isRecent: false,
      statusColor: 'gray',
      dotColorClass: 'bg-slate-400',
      textColorClass: 'text-slate-500 dark:text-slate-400'
    };
  }

  // Older activity: "Active Nov 21 at 9:42 PM"
  const monthDayStr = `${MONTHS[activeDate.getMonth()]} ${activeDate.getDate()}`;
  const timeStr = formatTime(activeDate);

  return {
    label: `Active ${monthDayStr} at ${timeStr}`,
    isOnline: false,
    isRecent: false,
    statusColor: 'gray',
    dotColorClass: 'bg-slate-400',
    textColorClass: 'text-slate-500 dark:text-slate-400'
  };
}
