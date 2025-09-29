import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTXCMining } from './useTXCMining';
import { useTokenBalance } from './useTokenBalance';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useDailyLoginBonus = () => {
  const { user } = useAuth();
  const { earnTXC } = useTXCMining();
  const { refreshBalance } = useTokenBalance();
  const [hasCheckedToday, setHasCheckedToday] = useState(false);

  useEffect(() => {
    // TEMPORARILY DISABLED - TXC system being fixed
    // This prevents automatic daily login bonus calls that are causing UI errors
    console.log('Daily login bonus temporarily disabled for debugging');
    setHasCheckedToday(true);
    
    /* Original code - re-enable once TXC is fixed:
    if (!user || hasCheckedToday) return;

    const checkDailyBonus = async () => {
      try {
        // Check if user has already received daily bonus today
        const today = new Date().toISOString().split('T')[0];
        
        const { data: todayBonus } = await supabase
          .from('txc_transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('transaction_type', 'mining')
          .eq('description', 'Daily login bonus')
          .gte('created_at', `${today}T00:00:00.000Z`)
          .maybeSingle();

        if (!todayBonus) {
          // Try to earn daily login bonus
          const earned = await earnTXC('daily_login');
          if (earned) {
            await refreshBalance();
            toast.success('🎉 Daily login bonus! +75 TXC earned!', {
              duration: 5000,
            });
          }
        }
        
        setHasCheckedToday(true);
      } catch (error) {
        console.error('Error checking daily login bonus:', error);
        setHasCheckedToday(true);
      }
    };

    // Small delay to ensure other systems are loaded
    const timer = setTimeout(checkDailyBonus, 2000);
    return () => clearTimeout(timer);
    */
  }, [user, hasCheckedToday, earnTXC, refreshBalance]);

  return { hasCheckedToday };
};