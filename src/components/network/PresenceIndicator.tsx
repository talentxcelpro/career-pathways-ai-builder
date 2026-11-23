import React from 'react';
import { formatPresence, PresenceData } from '@/utils/presenceFormatter';

export interface PresenceIndicatorProps {
  presence?: PresenceData | null;
  isOnline?: boolean | null;
  lastSeen?: string | null;
  lastHeartbeatAt?: string | null;
  isVisible?: boolean | null;
  visibility?: string | null;
  variant?: 'dot' | 'text' | 'compact' | 'badge' | 'header';
  className?: string;
  dotClassName?: string;
  textClassName?: string;
  shortYesterday?: boolean;
  hideIfOffline?: boolean;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  presence,
  isOnline,
  lastSeen,
  lastHeartbeatAt,
  isVisible,
  visibility,
  variant = 'compact',
  className = '',
  dotClassName = '',
  textClassName = '',
  shortYesterday = false,
  hideIfOffline = false,
}) => {
  const presenceInput: PresenceData = presence || {
    is_online: isOnline,
    last_seen: lastSeen,
    last_heartbeat_at: lastHeartbeatAt,
    is_visible: isVisible,
    visibility: visibility
  };

  const formatted = formatPresence(presenceInput, { shortYesterday, hideIfOffline });

  if (formatted.statusColor === 'hidden' || !formatted.label) {
    return null;
  }

  const dotColorClass = formatted.isOnline
    ? 'bg-emerald-500 shadow-xs'
    : 'bg-slate-400 dark:bg-slate-500';

  if (variant === 'dot') {
    return (
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${dotColorClass} ${dotClassName}`}
        title={formatted.label}
        aria-label={formatted.label}
      />
    );
  }

  if (variant === 'text') {
    return (
      <span className={`text-[11px] font-medium ${formatted.textColorClass} ${textClassName}`}>
        {formatted.label}
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
          formatted.isOnline
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/60'
        } ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />
        <span>{formatted.label}</span>
      </span>
    );
  }

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColorClass}`} />
        <span className={`text-xs font-medium ${formatted.textColorClass} ${textClassName}`}>
          {formatted.label}
        </span>
      </div>
    );
  }

  // Default: 'compact' (inline dot + text)
  return (
    <div className={`inline-flex items-center gap-1.5 text-[11px] ${className}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColorClass} ${dotClassName}`} />
      <span className={`font-medium ${formatted.textColorClass} ${textClassName}`}>
        {formatted.label}
      </span>
    </div>
  );
};

export default PresenceIndicator;
