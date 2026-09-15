import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Status = 'restoring' | 'active' | 'signed_out';

interface Props {
  className?: string;
}

/**
 * Compact pill that reflects whether the Supabase auth session
 * is restored. Use on profile pages so users can confirm before saving.
 */
export const SessionStatusIndicator: React.FC<Props> = ({ className }) => {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<Status>('restoring');

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (loading) {
        setStatus('restoring');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setStatus(session?.user ? 'active' : user ? 'restoring' : 'signed_out');
    };
    check();
    return () => { cancelled = true; };
  }, [user, loading]);

  const config = {
    restoring: {
      icon: Loader2,
      label: 'Restoring session…',
      className: 'bg-muted text-muted-foreground border-border',
      spin: true,
    },
    active: {
      icon: CheckCircle2,
      label: 'Session active — safe to save',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
      spin: false,
    },
    signed_out: {
      icon: AlertTriangle,
      label: 'Signed out — please sign in',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
      spin: false,
    },
  }[status];

  const Icon = config.icon;
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        config.className,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className={cn('h-3.5 w-3.5', config.spin && 'animate-spin')} />
      {config.label}
    </div>
  );
};

export default SessionStatusIndicator;
