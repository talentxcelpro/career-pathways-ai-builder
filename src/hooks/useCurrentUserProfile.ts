import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseCurrentUserProfile {
  displayName: string;
  streakDays: number;
  loading: boolean;
}

// Best-effort hook: gracefully falls back if profile fields aren't present
export function useCurrentUserProfile(): UseCurrentUserProfile {
  const [displayName, setDisplayName] = useState<string>('Learner');
  const [streakDays, setStreakDays] = useState<number>(7); // sensible default
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) {
          if (isMounted) setLoading(false);
          return;
        }

        // Try to fetch profile details; tolerate missing columns
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferred_name, display_name, full_name, username, first_name, last_name, current_streak, streak')
          .eq('id', user.id)
          .maybeSingle();

        const emailBase = user.email?.split('@')[0] || '';
        const emailName = emailBase
          .replace(/[._-]+/g, ' ')
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Learner';

        const name =
          (profile?.preferred_name as string | undefined) ||
          (profile?.display_name as string | undefined) ||
          ((profile?.first_name || profile?.last_name)
            ? `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
            : undefined) ||
          (profile?.full_name as string | undefined) ||
          (profile?.username as string | undefined) ||
          ((user?.user_metadata?.full_name as string | undefined) ??
            (user?.user_metadata?.name as string | undefined)) ||
          emailName;

        const streak = (profile?.current_streak ?? profile?.streak ?? Number(localStorage.getItem('tx_streak_days')) ?? 7) as number;

        if (isMounted) {
          setDisplayName(name);
          setStreakDays(Number.isFinite(streak) ? streak : 7);
        }
      } catch (e) {
        // Silent fallback to defaults
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, []);

  return { displayName, streakDays, loading };
}
