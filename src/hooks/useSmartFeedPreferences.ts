import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmartFeedPreferences {
  id?: string;
  user_id?: string;
  include_content_types: string[];
  exclude_content_types: string[];
  include_tags: string[];
  exclude_tags: string[];
  preferred_industries: string[];
  preferred_roles: string[];
  blocked_users: string[];
  blocked_keywords: string[];
  prioritize_connections: boolean;
  show_trending_content: boolean;
  content_freshness_weight: number;
  relevance_weight: number;
  diversity_weight: number;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_PREFERENCES: SmartFeedPreferences = {
  include_content_types: ['career_tips', 'job_posts', 'industry_news', 'peer_achievements', 'polls_opinions', 'skill_recommendations'],
  exclude_content_types: [],
  include_tags: [],
  exclude_tags: [],
  preferred_industries: [],
  preferred_roles: [],
  blocked_users: [],
  blocked_keywords: [],
  prioritize_connections: true,
  show_trending_content: true,
  content_freshness_weight: 0.7,
  relevance_weight: 0.8,
  diversity_weight: 0.5,
};

export const useSmartFeedPreferences = () => {
  const [preferences, setPreferences] = useState<SmartFeedPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('smart_feed_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      } else if (data) {
        setPreferences(data);
      } else {
        // No preferences found, use defaults
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<SmartFeedPreferences>) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updatedPreferences = { ...preferences, ...newPreferences };
      
      // Remove id and timestamps from the data to insert/update
      const { id, created_at, updated_at, ...dataToSave } = updatedPreferences;
      
      const { data, error } = await supabase
        .from('smart_feed_preferences')
        .upsert({
          ...dataToSave,
          user_id: user.id,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save preferences. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      setPreferences(data);
      toast({
        title: "Success",
        description: "Smart Feed preferences saved successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = (newPreferences: Partial<SmartFeedPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    savePreferences,
    resetToDefaults,
    loadPreferences,
  };
};