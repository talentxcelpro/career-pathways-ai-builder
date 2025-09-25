import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useAdvancedNetworking = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Skill Exchange Functions
  const createSkillExchange = async (skillOffered: string, skillSought: string, description: string) => {
    if (!user?.id) return { success: false };
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('skill_exchanges')
        .insert({
          user_id: user.id,
          skill_offered: skillOffered,
          skill_sought: skillSought,
          description,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating skill exchange:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const createVideoIntro = async (title: string, description: string, videoUrl: string) => {
    if (!user?.id) return { success: false };
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('video_intros')
        .insert({
          user_id: user.id,
          title,
          description,
          video_url: videoUrl,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating video intro:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const joinInterestCommunity = async (communityId: string) => {
    if (!user?.id) return { success: false };
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_interests')
        .insert({
          user_id: user.id,
          community_id: communityId,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Joined community successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createSkillExchange,
    createVideoIntro,
    joinInterestCommunity
  };
};