import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BotDisplayInfo {
  display_name: string;
  display_role: string;
  profile_picture_url: string;
  bot_tag: string;
}

export const useBotIdentity = (botId?: string) => {
  const [botInfo, setBotInfo] = useState<BotDisplayInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (botId) {
      fetchBotInfo(botId);
    }
  }, [botId]);

  const fetchBotInfo = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_bot_display_info', {
        bot_uuid: id
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setBotInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching bot info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { botInfo, isLoading };
};